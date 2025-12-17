import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { scenariosSeed } from "./scenarios-seed";
import type { ActionType, OutcomeType, Scenario, UserProgress, BadgeId } from "@shared/schema";
import { BADGES, insertAssignmentSchema, insertDecisionSchema } from "@shared/schema";
import { z } from "zod";

// Valid actions for runtime validation - single source of truth
const VALID_ACTIONS: readonly ActionType[] = ["report", "delete", "verify", "proceed"] as const;

// Runtime assertion that validates action type
function assertActionType(value: string): ActionType {
  if (!VALID_ACTIONS.includes(value as ActionType)) {
    throw new Error(`Invalid action type: ${value}`);
  }
  return value as ActionType;
}

// Decision submission validation - pick client-provided fields from the shared schema
// Uses runtime assertion to guarantee ActionType compatibility
const submitDecisionSchema = z.object({
  scenarioId: z.string().min(1),
  action: z.string().refine(
    (val): val is ActionType => VALID_ACTIONS.includes(val as ActionType),
    { message: "Invalid action type" }
  ),
  confidence: z.number().int().min(0).max(100),
});

// Badge awarding logic
function checkAndAwardBadges(
  progress: UserProgress,
  scenario: Scenario | null,
  isCorrect: boolean,
  usedVerification: boolean
): BadgeId[] {
  const earnedBadges = [...(progress.earnedBadges || [])] as BadgeId[];
  const newBadges: BadgeId[] = [];

  // Domain Detective - check if scenario has domain mismatch cue
  if (scenario && isCorrect && scenario.cues.some(c => c.toLowerCase().includes("domain"))) {
    const domainDetects = progress.correctDecisions + 1;
    if (domainDetects >= BADGES.domain_detective.requirement && !earnedBadges.includes("domain_detective")) {
      newBadges.push("domain_detective");
    }
  }

  // Verification Pro - used verification correctly on malicious content
  if (usedVerification && scenario?.legitimacy === "malicious") {
    const verifyCount = (progress.totalDecisions || 0);
    if (verifyCount >= BADGES.verification_pro.requirement && !earnedBadges.includes("verification_pro")) {
      newBadges.push("verification_pro");
    }
  }

  // BEC Blocker - blocked BEC attempts
  if (isCorrect && scenario?.attackFamily === "bec") {
    const becBlocks = progress.correctDecisions + 1;
    if (becBlocks >= BADGES.bec_blocker.requirement && !earnedBadges.includes("bec_blocker")) {
      newBadges.push("bec_blocker");
    }
  }

  // Urgency Immune - resisted urgency attacks
  if (isCorrect && scenario?.cues.some(c => c.toLowerCase().includes("urgency"))) {
    const urgencyResists = progress.correctDecisions + 1;
    if (urgencyResists >= BADGES.urgency_immune.requirement && !earnedBadges.includes("urgency_immune")) {
      newBadges.push("urgency_immune");
    }
  }

  // Streak Master - 20 decision streak
  const currentStreak = progress.currentStreak + (isCorrect ? 1 : 0);
  if (currentStreak >= BADGES.streak_master.requirement && !earnedBadges.includes("streak_master")) {
    newBadges.push("streak_master");
  }

  return newBadges;
}

// Scoring logic
function calculateOutcome(
  scenario: Scenario,
  action: ActionType,
  usedVerification: boolean
): { outcome: OutcomeType; points: number } {
  const isCorrect = action === scenario.correctAction;
  const isMalicious = scenario.legitimacy === "malicious";
  const isLegitimate = scenario.legitimacy === "legitimate";
  const isSuspiciousLegit = scenario.legitimacy === "suspicious_legitimate";

  // Proceed on malicious = compromised
  if (action === "proceed" && isMalicious) {
    return { outcome: "compromised", points: -20 };
  }

  // Report legitimate = false alarm
  if (action === "report" && isLegitimate) {
    return { outcome: "false_alarm", points: -5 };
  }

  // Report suspicious-but-legit = minor false alarm
  if (action === "report" && isSuspiciousLegit) {
    return { outcome: "false_alarm", points: -2 };
  }

  // Delete legitimate = delayed work
  if (action === "delete" && isLegitimate) {
    return { outcome: "delayed_work", points: -3 };
  }

  // Verify is always safe but costs resources
  if (action === "verify") {
    if (isMalicious) {
      return { outcome: "safe", points: 15 }; // Good use of verification
    }
    if (isLegitimate || isSuspiciousLegit) {
      return { outcome: "safe", points: 8 }; // Cautious but acceptable
    }
  }

  // Report malicious = correct
  if (action === "report" && isMalicious) {
    return { outcome: "safe", points: 15 };
  }

  // Delete malicious = partial credit
  if (action === "delete" && isMalicious) {
    return { outcome: "safe", points: 10 };
  }

  // Proceed on legitimate = correct
  if (action === "proceed" && isLegitimate) {
    return { outcome: "safe", points: 10 };
  }

  // Proceed on suspicious-legit = risky but okay
  if (action === "proceed" && isSuspiciousLegit) {
    return { outcome: "safe", points: 5 };
  }

  // Delete suspicious-legit = cautious
  if (action === "delete" && isSuspiciousLegit) {
    return { outcome: "delayed_work", points: 2 };
  }

  // Default fallback
  return { outcome: "safe", points: 5 };
}

async function seedScenariosIfNeeded() {
  const count = await storage.getScenariosCount();
  if (count === 0) {
    console.log("Seeding scenarios...");
    for (const scenario of scenariosSeed) {
      // Seed data is pre-validated, cast to native insert type
      await storage.createScenario(scenario as Parameters<typeof storage.createScenario>[0]);
    }
    console.log(`Seeded ${scenariosSeed.length} scenarios`);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed scenarios
  await seedScenariosIfNeeded();

  // Get user progress
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let progress = await storage.getProgressByUserId(userId);
      
      if (!progress) {
        progress = await storage.upsertProgress(userId, {
          totalShifts: 0,
          totalDecisions: 0,
          correctDecisions: 0,
          falsePositives: 0,
          compromised: 0,
          totalReports: 0,
          correctReports: 0,
          totalMaliciousSeen: 0,
          correctMaliciousHandling: 0,
          totalLegitimateSeen: 0,
          correctLegitimateHandling: 0,
          unsafeActions: 0,
          highConfidenceWrong: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalScore: 0,
          missedCues: {},
          earnedBadges: [],
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Create a new shift with adaptive difficulty
  app.post("/api/shifts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user progress for adaptive difficulty
      const progress = await storage.getProgressByUserId(userId);
      const shiftsCompleted = progress?.totalShifts || 0;
      const accuracy = progress?.totalDecisions 
        ? progress.correctDecisions / progress.totalDecisions 
        : 0;
      
      // Use adaptive scenario selection based on user performance
      const scenarios = await storage.getAdaptiveScenarios(10, accuracy, shiftsCompleted);
      const scenarioIds = scenarios.map(s => s.id);
      
      const shift = await storage.createShift({
        userId,
        scenarioIds,
        verificationBudget: 3,
        verificationsUsed: 0,
        score: 0,
        correctDecisions: 0,
        falsePositives: 0,
        compromised: 0,
      });
      
      res.json(shift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  // Get shift by ID with scenarios
  app.get("/api/shifts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const shift = await storage.getShiftById(id);
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      if (shift.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get scenarios for this shift
      const scenarios = await storage.getScenariosByIds(shift.scenarioIds);
      
      // Sort scenarios to match the order in scenarioIds
      const orderedScenarios = shift.scenarioIds
        .map(id => scenarios.find(s => s.id === id))
        .filter(Boolean);
      
      res.json({ ...shift, scenarios: orderedScenarios });
    } catch (error) {
      console.error("Error fetching shift:", error);
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  // Submit a decision
  app.post("/api/shifts/:shiftId/decisions", isAuthenticated, async (req: any, res) => {
    try {
      const { shiftId } = req.params;
      const userId = req.user.claims.sub;
      
      // Validate input using Zod schema
      const validationResult = submitDecisionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validationResult.error.flatten().fieldErrors 
        });
      }
      
      const { scenarioId, action, confidence } = validationResult.data;
      
      const shift = await storage.getShiftById(shiftId);
      if (!shift || shift.userId !== userId) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      const scenario = await storage.getScenarioById(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
      // Check if using verification
      const usedVerification = action === "verify";
      if (usedVerification && shift.verificationsUsed >= shift.verificationBudget) {
        return res.status(400).json({ message: "No verifications remaining" });
      }
      
      // Calculate outcome
      const { outcome, points } = calculateOutcome(scenario, action, usedVerification);
      
      // Create decision
      const decision = await storage.createDecision({
        shiftId,
        scenarioId,
        userId,
        action,
        confidence,
        outcome,
        pointsEarned: points,
        usedVerification,
      });
      
      // Update shift stats
      const isCorrect = action === scenario.correctAction;
      const isFalsePositive = outcome === "false_alarm";
      const isCompromised = outcome === "compromised";
      
      // Track new metrics for spec compliance
      const isReport = action === "report";
      const isMalicious = scenario.legitimacy === "malicious";
      const isLegitimate = scenario.legitimacy === "legitimate" || scenario.legitimacy === "suspicious_legitimate";
      // Correct report = reported a malicious message (not just when report is the "correct" action)
      const isCorrectReport = isReport && isMalicious;
      // Correct handling of malicious = any action that isn't proceed (report, delete, or verify are all safe)
      const isCorrectMaliciousHandling = isMalicious && action !== "proceed";
      const isUnsafeAction = isMalicious && action === "proceed";
      const isHighConfidenceWrong = !isCorrect && confidence >= 85;
      // Correctly handled legitimate = took the correct action (typically proceed)
      // Delete of legitimate causes "delayed_work" which is a penalty, not correct
      const isCorrectLegitimateHandling = isLegitimate && isCorrect;
      
      const updatedShift = await storage.updateShift(shiftId, {
        score: shift.score + points,
        correctDecisions: shift.correctDecisions + (isCorrect ? 1 : 0),
        falsePositives: shift.falsePositives + (isFalsePositive ? 1 : 0),
        compromised: shift.compromised + (isCompromised ? 1 : 0),
        verificationsUsed: shift.verificationsUsed + (usedVerification ? 1 : 0),
      });
      
      // Update user progress
      const progress = await storage.getProgressByUserId(userId);
      const currentStreak = isCompromised ? 0 : (progress?.currentStreak || 0) + (isCorrect ? 1 : 0);
      const longestStreak = Math.max(currentStreak, progress?.longestStreak || 0);
      
      // Track missed cues
      const missedCues = { ...(progress?.missedCues as Record<string, number> || {}) };
      if (!isCorrect && scenario.cues) {
        for (const cue of scenario.cues) {
          missedCues[cue] = (missedCues[cue] || 0) + 1;
        }
      }
      
      // Check for new badges
      const defaultProgress: UserProgress = {
        id: '',
        userId,
        totalShifts: 0,
        totalDecisions: 0,
        correctDecisions: 0,
        falsePositives: 0,
        compromised: 0,
        totalReports: 0,
        correctReports: 0,
        totalMaliciousSeen: 0,
        correctMaliciousHandling: 0,
        totalLegitimateSeen: 0,
        correctLegitimateHandling: 0,
        unsafeActions: 0,
        highConfidenceWrong: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalScore: 0,
        missedCues: {},
        earnedBadges: [],
        lastPlayedAt: null,
      };
      const newBadges = checkAndAwardBadges(progress || defaultProgress, scenario, isCorrect, usedVerification);
      const allBadges = [...(progress?.earnedBadges || []), ...newBadges];
      
      await storage.upsertProgress(userId, {
        totalDecisions: (progress?.totalDecisions || 0) + 1,
        correctDecisions: (progress?.correctDecisions || 0) + (isCorrect ? 1 : 0),
        falsePositives: (progress?.falsePositives || 0) + (isFalsePositive ? 1 : 0),
        compromised: (progress?.compromised || 0) + (isCompromised ? 1 : 0),
        totalReports: (progress?.totalReports || 0) + (isReport ? 1 : 0),
        correctReports: (progress?.correctReports || 0) + (isCorrectReport ? 1 : 0),
        totalMaliciousSeen: (progress?.totalMaliciousSeen || 0) + (isMalicious ? 1 : 0),
        correctMaliciousHandling: (progress?.correctMaliciousHandling || 0) + (isCorrectMaliciousHandling ? 1 : 0),
        totalLegitimateSeen: (progress?.totalLegitimateSeen || 0) + (isLegitimate ? 1 : 0),
        correctLegitimateHandling: (progress?.correctLegitimateHandling || 0) + (isCorrectLegitimateHandling ? 1 : 0),
        unsafeActions: (progress?.unsafeActions || 0) + (isUnsafeAction ? 1 : 0),
        highConfidenceWrong: (progress?.highConfidenceWrong || 0) + (isHighConfidenceWrong ? 1 : 0),
        currentStreak,
        longestStreak,
        totalScore: (progress?.totalScore || 0) + points,
        missedCues,
        earnedBadges: allBadges,
      });
      
      // Check for chain follow-up scenario
      let nextScenario: Scenario | undefined;
      if (scenario.chainId && scenario.chainOrder !== null) {
        // Try to find the next scenario in the chain based on the action taken
        // Any action can potentially trigger chain progression
        nextScenario = await storage.getNextChainScenario(
          scenario.chainId, 
          scenario.chainOrder, 
          action
        );
        
        if (nextScenario) {
          // Get fresh shift data to avoid race conditions
          const freshShift = await storage.getShiftById(shiftId);
          if (freshShift) {
            // Check if this scenario is already in the list (prevent duplicates)
            if (!freshShift.scenarioIds.includes(nextScenario.id)) {
              const updatedScenarioIds = [...freshShift.scenarioIds, nextScenario.id];
              await storage.updateShift(shiftId, {
                scenarioIds: updatedScenarioIds,
              });
            }
          }
        }
      }
      
      res.json({
        decision,
        outcome,
        pointsEarned: points,
        shift: updatedShift,
        newBadges,
        nextChainScenario: nextScenario ? {
          id: nextScenario.id,
          chainName: nextScenario.chainName,
          triggeredBy: action,
        } : undefined,
      });
    } catch (error) {
      console.error("Error submitting decision:", error);
      res.status(500).json({ message: "Failed to submit decision" });
    }
  });

  // Get current user info (with role)
  app.get("/api/user/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Instructor middleware
  const isInstructor = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserById(userId);
      if (!user || user.role !== "instructor") {
        return res.status(403).json({ message: "Instructor access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking instructor role:", error);
      res.status(500).json({ message: "Authorization error" });
    }
  };

  // Instructor: Get cohort analytics
  app.get("/api/instructor/analytics", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const analytics = await storage.getCohortAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Instructor: Get learner summaries
  app.get("/api/instructor/learners", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const learners = await storage.getLearnerSummaries();
      res.json(learners);
    } catch (error) {
      console.error("Error fetching learners:", error);
      res.status(500).json({ message: "Failed to fetch learners" });
    }
  });

  // Instructor: Get all assignments by instructor
  app.get("/api/instructor/assignments", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignments = await storage.getAssignmentsByInstructor(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Instructor: Get single assignment
  app.get("/api/instructor/assignments/:id", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const { id } = req.params;
      const assignment = await storage.getAssignmentById(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });

  // Instructor: Create assignment
  app.post("/api/instructor/assignments", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = insertAssignmentSchema.safeParse({
        ...req.body,
        createdBy: userId,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid assignment data", 
          errors: validationResult.error.flatten().fieldErrors 
        });
      }
      
      const assignment = await storage.createAssignment(validationResult.data);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  // Instructor: Update assignment
  app.patch("/api/instructor/assignments/:id", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existing = await storage.getAssignmentById(id);
      if (!existing || existing.createdBy !== userId) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      const assignment = await storage.updateAssignment(id, req.body);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  // Instructor: Delete assignment
  app.delete("/api/instructor/assignments/:id", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existing = await storage.getAssignmentById(id);
      if (!existing || existing.createdBy !== userId) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      await storage.deleteAssignment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Instructor: Get assignment completions
  app.get("/api/instructor/assignments/:id/completions", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const { id } = req.params;
      const completions = await storage.getAssignmentCompletions(id);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Instructor: Generate debrief pack (anonymized teachable moments)
  app.get("/api/instructor/debrief-pack", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const decisions = await storage.getAllDecisions();
      const allScenarios = await storage.getScenarios();
      const scenarioMap = new Map(allScenarios.map(s => [s.id, s]));
      
      // Group decisions by scenario
      const scenarioStats: Record<string, {
        scenario: Scenario;
        totalAttempts: number;
        correctCount: number;
        compromisedCount: number;
        falseAlarmCount: number;
        commonMistakes: string[];
        missedCues: string[];
      }> = {};
      
      for (const decision of decisions) {
        const scenario = scenarioMap.get(decision.scenarioId);
        if (!scenario) continue;
        
        if (!scenarioStats[scenario.id]) {
          scenarioStats[scenario.id] = {
            scenario,
            totalAttempts: 0,
            correctCount: 0,
            compromisedCount: 0,
            falseAlarmCount: 0,
            commonMistakes: [],
            missedCues: [],
          };
        }
        
        scenarioStats[scenario.id].totalAttempts++;
        if (decision.outcome === "safe") {
          scenarioStats[scenario.id].correctCount++;
        } else if (decision.outcome === "compromised") {
          scenarioStats[scenario.id].compromisedCount++;
          // Track missed cues for compromised decisions
          if (scenario.cues && Array.isArray(scenario.cues)) {
            scenarioStats[scenario.id].missedCues.push(...scenario.cues);
          }
        } else if (decision.outcome === "false_alarm") {
          scenarioStats[scenario.id].falseAlarmCount++;
        }
      }
      
      // Build debrief items - focus on scenarios with high error rates
      const debriefItems = Object.values(scenarioStats)
        .filter(stat => stat.totalAttempts >= 3) // Need enough data
        .map(stat => {
          const errorRate = ((stat.compromisedCount + stat.falseAlarmCount) / stat.totalAttempts) * 100;
          const uniqueMissedCues = Array.from(new Set(stat.missedCues));
          
          return {
            scenarioId: stat.scenario.id,
            channel: stat.scenario.channel,
            attackFamily: stat.scenario.attackFamily,
            subject: stat.scenario.subject,
            senderName: stat.scenario.senderName,
            correctAction: stat.scenario.correctAction,
            explanation: stat.scenario.explanation,
            cues: stat.scenario.cues,
            difficultyScore: stat.scenario.difficultyScore,
            totalAttempts: stat.totalAttempts,
            errorRate: Math.round(errorRate * 10) / 10,
            compromiseRate: Math.round((stat.compromisedCount / stat.totalAttempts) * 100 * 10) / 10,
            falsePositiveRate: Math.round((stat.falseAlarmCount / stat.totalAttempts) * 100 * 10) / 10,
            frequentlyMissedCues: uniqueMissedCues.slice(0, 5),
          };
        })
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 20); // Top 20 most problematic scenarios
      
      res.json({
        generatedAt: new Date().toISOString(),
        totalScenarios: debriefItems.length,
        items: debriefItems,
      });
    } catch (error) {
      console.error("Error generating debrief pack:", error);
      res.status(500).json({ message: "Failed to generate debrief pack" });
    }
  });

  // Complete a shift
  app.post("/api/shifts/:shiftId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { shiftId } = req.params;
      const userId = req.user.claims.sub;
      
      const shift = await storage.getShiftById(shiftId);
      if (!shift || shift.userId !== userId) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      const updatedShift = await storage.updateShift(shiftId, {
        completedAt: new Date(),
      });
      
      // Update total shifts count and check for perfect shift badge
      const progress = await storage.getProgressByUserId(userId);
      const earnedBadges = [...(progress?.earnedBadges || [])] as BadgeId[];
      const newBadges: BadgeId[] = [];
      
      // Check for perfect shift (all decisions correct, no compromises or false positives)
      const isPerfect = shift.correctDecisions === shift.scenarioIds.length && 
                       shift.compromised === 0 && 
                       shift.falsePositives === 0;
      
      if (isPerfect && !earnedBadges.includes("perfect_shift")) {
        newBadges.push("perfect_shift");
      }
      
      const allBadges = [...earnedBadges, ...newBadges];
      
      await storage.upsertProgress(userId, {
        totalShifts: (progress?.totalShifts || 0) + 1,
        earnedBadges: allBadges,
      });
      
      res.json({ shift: updatedShift, newBadges });
    } catch (error) {
      console.error("Error completing shift:", error);
      res.status(500).json({ message: "Failed to complete shift" });
    }
  });

  return httpServer;
}
