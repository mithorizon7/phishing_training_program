import { 
  scenarios, shifts, decisions, userProgress, assignments, assignmentCompletions,
  type Scenario, type InsertScenario,
  type Shift, type InsertShift,
  type Decision, type InsertDecision,
  type UserProgress, type InsertUserProgress,
  type Assignment, type InsertAssignment,
  type AssignmentCompletion, type InsertAssignmentCompletion
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, inArray, sql, desc, and, gte } from "drizzle-orm";

// Analytics types
export interface CohortAnalytics {
  totalLearners: number;
  activeLearners: number;
  totalDecisions: number;
  overallAccuracy: number;
  falsePositiveRate: number;
  compromiseRate: number;
  topMissedCues: Array<{ cue: string; count: number }>;
  mistakePatterns: Array<{ attackFamily: string; errorRate: number }>;
  recentActivity: Array<{
    date: string;
    decisions: number;
    accuracy: number;
  }>;
}

export interface LearnerSummary {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  totalDecisions: number;
  accuracy: number;
  falsePositiveRate: number;
  lastPlayedAt: Date | null;
}

export interface IStorage {
  // Scenarios
  getScenarios(): Promise<Scenario[]>;
  getScenarioById(id: string): Promise<Scenario | undefined>;
  getScenariosByIds(ids: string[]): Promise<Scenario[]>;
  getRandomScenarios(count: number, maxDifficulty?: number): Promise<Scenario[]>;
  getAdaptiveScenarios(count: number, userAccuracy: number, shiftsCompleted: number): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  getScenariosCount(): Promise<number>;

  // Shifts
  getShiftById(id: string): Promise<Shift | undefined>;
  getShiftsByUserId(userId: string): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined>;

  // Decisions
  getDecisionsByShiftId(shiftId: string): Promise<Decision[]>;
  createDecision(decision: InsertDecision): Promise<Decision>;
  getAllDecisions(): Promise<Decision[]>;

  // User Progress
  getProgressByUserId(userId: string): Promise<UserProgress | undefined>;
  getAllProgress(): Promise<UserProgress[]>;
  upsertProgress(userId: string, updates: Partial<InsertUserProgress>): Promise<UserProgress>;

  // Users
  getUserById(id: string): Promise<User | undefined>;
  getAllLearners(): Promise<User[]>;
  updateUserRole(userId: string, role: "learner" | "instructor"): Promise<User | undefined>;

  // Analytics
  getCohortAnalytics(): Promise<CohortAnalytics>;
  getLearnerSummaries(): Promise<LearnerSummary[]>;

  // Assignments
  getAssignments(): Promise<Assignment[]>;
  getAssignmentById(id: string): Promise<Assignment | undefined>;
  getAssignmentsByInstructor(instructorId: string): Promise<Assignment[]>;
  getPublishedAssignments(): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;

  // Assignment Completions
  getAssignmentCompletions(assignmentId: string): Promise<AssignmentCompletion[]>;
  createAssignmentCompletion(completion: InsertAssignmentCompletion): Promise<AssignmentCompletion>;
  updateAssignmentCompletion(id: string, updates: Partial<AssignmentCompletion>): Promise<AssignmentCompletion | undefined>;

  // Multi-turn scenario chains
  getNextChainScenario(chainId: string, currentChainOrder: number, previousAction: string): Promise<Scenario | undefined>;
  getScenarioChains(): Promise<Array<{ chainId: string; chainName: string; scenarioCount: number }>>;
}

export class DatabaseStorage implements IStorage {
  // Scenarios
  async getScenarios(): Promise<Scenario[]> {
    return db.select().from(scenarios);
  }

  async getScenarioById(id: string): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario;
  }

  async getScenariosByIds(ids: string[]): Promise<Scenario[]> {
    if (ids.length === 0) return [];
    return db.select().from(scenarios).where(inArray(scenarios.id, ids));
  }

  async getRandomScenarios(count: number, maxDifficulty: number = 5): Promise<Scenario[]> {
    // Only include standalone scenarios OR first scenario in chains (chainOrder = 1 or null)
    // Exclude follow-up scenarios (chainOrder > 1) from random selection
    // Filter by difficulty score to enable adaptive learning
    return db.select()
      .from(scenarios)
      .where(
        sql`(${scenarios.chainOrder} IS NULL OR ${scenarios.chainOrder} = 1) 
            AND (${scenarios.difficultyScore} IS NULL OR ${scenarios.difficultyScore} <= ${maxDifficulty})`
      )
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async getAdaptiveScenarios(count: number, userAccuracy: number, shiftsCompleted: number): Promise<Scenario[]> {
    // Adaptive difficulty based on user performance and experience
    // Start with easier scenarios (difficulty 1-2) and gradually unlock harder ones
    // 
    // Difficulty unlocking progression:
    // - Shifts 0-2: Max difficulty 2 (basic scenarios only)
    // - Shifts 3-5: Max difficulty 3 (if accuracy > 60%)
    // - Shifts 6-10: Max difficulty 4 (if accuracy > 70%)
    // - Shifts 11+: Max difficulty 5 (if accuracy > 75%)
    
    let maxDifficulty = 2; // Start with easiest
    
    if (shiftsCompleted >= 3 && userAccuracy >= 0.60) {
      maxDifficulty = 3;
    }
    if (shiftsCompleted >= 6 && userAccuracy >= 0.70) {
      maxDifficulty = 4;
    }
    if (shiftsCompleted >= 11 && userAccuracy >= 0.75) {
      maxDifficulty = 5;
    }
    
    // Get scenarios at or below the user's current level
    // But mix in some challenge - include 20% slightly harder scenarios if available
    const easyCount = Math.ceil(count * 0.8);
    const challengeCount = count - easyCount;
    
    const easyScenarios = await db.select()
      .from(scenarios)
      .where(
        sql`(${scenarios.chainOrder} IS NULL OR ${scenarios.chainOrder} = 1) 
            AND (${scenarios.difficultyScore} IS NULL OR ${scenarios.difficultyScore} <= ${maxDifficulty})`
      )
      .orderBy(sql`RANDOM()`)
      .limit(easyCount);
    
    // Get some challenge scenarios (one level above if available)
    const challengeScenarios = await db.select()
      .from(scenarios)
      .where(
        sql`(${scenarios.chainOrder} IS NULL OR ${scenarios.chainOrder} = 1) 
            AND ${scenarios.difficultyScore} = ${Math.min(maxDifficulty + 1, 5)}`
      )
      .orderBy(sql`RANDOM()`)
      .limit(challengeCount);
    
    // Combine scenarios - if we don't have enough challenge scenarios, backfill with more at-level ones
    let combined = [...easyScenarios, ...challengeScenarios];
    
    // Backfill if we don't have enough scenarios
    if (combined.length < count) {
      const backfillCount = count - combined.length;
      const existingIds = combined.map(s => s.id);
      
      // Use notInArray for proper SQL escaping, or fall back to simpler query if no existing IDs
      let backfillScenarios: Scenario[];
      if (existingIds.length > 0) {
        backfillScenarios = await db.select()
          .from(scenarios)
          .where(
            sql`(${scenarios.chainOrder} IS NULL OR ${scenarios.chainOrder} = 1) 
                AND (${scenarios.difficultyScore} IS NULL OR ${scenarios.difficultyScore} <= ${maxDifficulty})
                AND ${scenarios.id} NOT IN (${sql.join(existingIds.map(id => sql`${id}`), sql`, `)})`
          )
          .orderBy(sql`RANDOM()`)
          .limit(backfillCount);
      } else {
        backfillScenarios = await db.select()
          .from(scenarios)
          .where(
            sql`(${scenarios.chainOrder} IS NULL OR ${scenarios.chainOrder} = 1) 
                AND (${scenarios.difficultyScore} IS NULL OR ${scenarios.difficultyScore} <= ${maxDifficulty})`
          )
          .orderBy(sql`RANDOM()`)
          .limit(backfillCount);
      }
      
      combined = [...combined, ...backfillScenarios];
    }
    
    // Shuffle and return
    return combined.sort(() => Math.random() - 0.5);
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const [created] = await db.insert(scenarios).values(scenario).returning();
    return created;
  }

  async getScenariosCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(scenarios);
    return Number(result[0]?.count || 0);
  }

  // Shifts
  async getShiftById(id: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
  }

  async getShiftsByUserId(userId: string): Promise<Shift[]> {
    return db.select().from(shifts).where(eq(shifts.userId, userId));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [created] = await db.insert(shifts).values(shift).returning();
    return created;
  }

  async updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
    const [updated] = await db.update(shifts)
      .set(updates)
      .where(eq(shifts.id, id))
      .returning();
    return updated;
  }

  // Decisions
  async getDecisionsByShiftId(shiftId: string): Promise<Decision[]> {
    return db.select().from(decisions).where(eq(decisions.shiftId, shiftId));
  }

  async createDecision(decision: InsertDecision): Promise<Decision> {
    const [created] = await db.insert(decisions).values(decision).returning();
    return created;
  }

  async getAllDecisions(): Promise<Decision[]> {
    return db.select().from(decisions).orderBy(desc(decisions.createdAt));
  }

  // User Progress
  async getProgressByUserId(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async getAllProgress(): Promise<UserProgress[]> {
    return db.select().from(userProgress);
  }

  async upsertProgress(userId: string, updates: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existing = await this.getProgressByUserId(userId);
    
    if (existing) {
      const [updated] = await db.update(userProgress)
        .set({ ...updates, lastPlayedAt: new Date() })
        .where(eq(userProgress.userId, userId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(userProgress)
      .values({ userId, ...updates, lastPlayedAt: new Date() })
      .returning();
    return created;
  }

  // Users
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllLearners(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "learner"));
  }

  async updateUserRole(userId: string, role: "learner" | "instructor"): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Analytics
  async getCohortAnalytics(): Promise<CohortAnalytics> {
    // Get all progress records
    const allProgress = await this.getAllProgress();
    const allDecisions = await this.getAllDecisions();
    const allScenarios = await this.getScenarios();
    
    // Calculate basic metrics
    const totalLearners = allProgress.length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeLearners = allProgress.filter(p => p.lastPlayedAt && p.lastPlayedAt >= sevenDaysAgo).length;
    const totalDecisions = allProgress.reduce((sum, p) => sum + (p.totalDecisions || 0), 0);
    const totalCorrect = allProgress.reduce((sum, p) => sum + (p.correctDecisions || 0), 0);
    const totalFalsePositives = allProgress.reduce((sum, p) => sum + (p.falsePositives || 0), 0);
    const totalCompromised = allProgress.reduce((sum, p) => sum + (p.compromised || 0), 0);
    
    const overallAccuracy = totalDecisions > 0 ? (totalCorrect / totalDecisions) * 100 : 0;
    const falsePositiveRate = totalDecisions > 0 ? (totalFalsePositives / totalDecisions) * 100 : 0;
    const compromiseRate = totalDecisions > 0 ? (totalCompromised / totalDecisions) * 100 : 0;
    
    // Aggregate missed cues across all learners with null checks
    const cueCounter: Record<string, number> = {};
    for (const p of allProgress) {
      const missedCues = (p.missedCues as Record<string, number>) || {};
      if (missedCues && typeof missedCues === 'object') {
        for (const [cue, count] of Object.entries(missedCues)) {
          if (cue && typeof count === 'number') {
            cueCounter[cue] = (cueCounter[cue] || 0) + count;
          }
        }
      }
    }
    const topMissedCues = Object.entries(cueCounter)
      .map(([cue, count]) => ({ cue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate mistake patterns by attack family using pre-built map
    const scenarioMap = new Map(allScenarios.map(s => [s.id, s]));
    const familyStats: Record<string, { total: number; errors: number }> = {};
    
    for (const decision of allDecisions) {
      const scenario = scenarioMap.get(decision.scenarioId);
      if (scenario?.attackFamily && Array.isArray(scenario.cues)) {
        if (!familyStats[scenario.attackFamily]) {
          familyStats[scenario.attackFamily] = { total: 0, errors: 0 };
        }
        familyStats[scenario.attackFamily].total++;
        if (decision.outcome === "compromised" || decision.outcome === "false_alarm") {
          familyStats[scenario.attackFamily].errors++;
        }
      }
    }
    
    const mistakePatterns = Object.entries(familyStats)
      .map(([attackFamily, stats]) => ({
        attackFamily,
        errorRate: stats.total > 0 ? (stats.errors / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.errorRate - a.errorRate);
    
    // Calculate recent activity (last 7 days)
    const recentActivity: Array<{ date: string; decisions: number; accuracy: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayDecisions = allDecisions.filter(d => {
        const dDate = d.createdAt.toISOString().split('T')[0];
        return dDate === dateStr;
      });
      
      const dayCorrect = dayDecisions.filter(d => d.outcome === "safe").length;
      recentActivity.push({
        date: dateStr,
        decisions: dayDecisions.length,
        accuracy: dayDecisions.length > 0 ? (dayCorrect / dayDecisions.length) * 100 : 0
      });
    }
    
    return {
      totalLearners,
      activeLearners,
      totalDecisions,
      overallAccuracy,
      falsePositiveRate,
      compromiseRate,
      topMissedCues,
      mistakePatterns,
      recentActivity
    };
  }

  async getLearnerSummaries(): Promise<LearnerSummary[]> {
    const learners = await this.getAllLearners();
    const allProgress = await this.getAllProgress();
    
    const progressMap = new Map(allProgress.map(p => [p.userId, p]));
    
    return learners.map(learner => {
      const progress = progressMap.get(learner.id);
      const totalDecisions = progress?.totalDecisions || 0;
      const correctDecisions = progress?.correctDecisions || 0;
      const falsePositives = progress?.falsePositives || 0;
      
      return {
        userId: learner.id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        email: learner.email,
        totalDecisions,
        accuracy: totalDecisions > 0 ? (correctDecisions / totalDecisions) * 100 : 0,
        falsePositiveRate: totalDecisions > 0 ? (falsePositives / totalDecisions) * 100 : 0,
        lastPlayedAt: progress?.lastPlayedAt || null
      };
    });
  }

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    return db.select().from(assignments).orderBy(desc(assignments.createdAt));
  }

  async getAssignmentById(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async getAssignmentsByInstructor(instructorId: string): Promise<Assignment[]> {
    return db.select().from(assignments)
      .where(eq(assignments.createdBy, instructorId))
      .orderBy(desc(assignments.createdAt));
  }

  async getPublishedAssignments(): Promise<Assignment[]> {
    return db.select().from(assignments)
      .where(eq(assignments.isPublished, true))
      .orderBy(desc(assignments.createdAt));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [created] = await db.insert(assignments).values(assignment).returning();
    return created;
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const [updated] = await db.update(assignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updated;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const result = await db.delete(assignments).where(eq(assignments.id, id));
    return true;
  }

  // Assignment Completions
  async getAssignmentCompletions(assignmentId: string): Promise<AssignmentCompletion[]> {
    return db.select().from(assignmentCompletions)
      .where(eq(assignmentCompletions.assignmentId, assignmentId));
  }

  async createAssignmentCompletion(completion: InsertAssignmentCompletion): Promise<AssignmentCompletion> {
    const [created] = await db.insert(assignmentCompletions).values(completion).returning();
    return created;
  }

  async updateAssignmentCompletion(id: string, updates: Partial<AssignmentCompletion>): Promise<AssignmentCompletion | undefined> {
    const [updated] = await db.update(assignmentCompletions)
      .set(updates)
      .where(eq(assignmentCompletions.id, id))
      .returning();
    return updated;
  }

  // Multi-turn scenario chains
  async getNextChainScenario(chainId: string, currentChainOrder: number, previousAction: string): Promise<Scenario | undefined> {
    // Find the next scenario in the chain that:
    // 1. Has the same chainId
    // 2. Has chainOrder = currentChainOrder + 1
    // 3. Has previousAction matching the action the user took
    const [nextScenario] = await db.select()
      .from(scenarios)
      .where(
        and(
          eq(scenarios.chainId, chainId),
          eq(scenarios.chainOrder, currentChainOrder + 1),
          eq(scenarios.previousAction, previousAction as any)
        )
      )
      .limit(1);
    return nextScenario;
  }

  async getScenarioChains(): Promise<Array<{ chainId: string; chainName: string; scenarioCount: number }>> {
    const chains = await db.select({
      chainId: scenarios.chainId,
      chainName: scenarios.chainName,
      count: sql<number>`count(*)`.as('count')
    })
      .from(scenarios)
      .where(sql`${scenarios.chainId} IS NOT NULL`)
      .groupBy(scenarios.chainId, scenarios.chainName);
    
    return chains.map(c => ({
      chainId: c.chainId!,
      chainName: c.chainName || c.chainId!,
      scenarioCount: Number(c.count)
    }));
  }
}

export const storage = new DatabaseStorage();
