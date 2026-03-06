import type { ActionType, BadgeId, OutcomeType, Scenario, Shift, UserProgress } from "@shared/schema";
import { BADGES } from "@shared/schema";

export interface LocalShift extends Shift {
  scenarios: Scenario[];
  completedScenarioIds: string[];
  assignmentPassingScore?: number | null;
}

type BadgeCounts = Partial<Record<BadgeId, number>>;

export interface DecisionResult {
  shift: LocalShift;
  progress: UserProgress;
  outcome: OutcomeType;
  pointsEarned: number;
  newBadges: BadgeId[];
  nextScenario?: Scenario;
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function createEmptyProgress(userId: string): UserProgress {
  return {
    id: userId,
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
    badgeCounts: {},
    earnedBadges: [],
    lastPlayedAt: null,
  } as UserProgress;
}

export function createShift({
  scenarios,
  verificationBudget = 3,
  assignmentId = null,
  assignmentPassingScore = null,
  userId = "local",
}: {
  scenarios: Scenario[];
  verificationBudget?: number;
  assignmentId?: string | null;
  assignmentPassingScore?: number | null;
  userId?: string;
}): LocalShift {
  return {
    id: generateId("shift"),
    userId,
    assignmentId,
    startedAt: new Date(),
    completedAt: null,
    scenarioIds: scenarios.map((scenario) => scenario.id),
    verificationBudget,
    verificationsUsed: 0,
    score: 0,
    correctDecisions: 0,
    falsePositives: 0,
    compromised: 0,
    scenarios,
    completedScenarioIds: [],
    assignmentPassingScore,
  };
}

function hasDomainCue(cues: string[] = []): boolean {
  return cues.some((cue) => cue.toLowerCase().includes("domain"));
}

function hasUrgencyCue(cues: string[] = []): boolean {
  return cues.some((cue) => /urgenc|urgent|deadline/.test(cue.toLowerCase()));
}

function updateBadgeCounts(
  previous: BadgeCounts | undefined,
  scenario: Scenario | null,
  action: ActionType,
  usedVerification: boolean
): BadgeCounts {
  const next: BadgeCounts = { ...(previous || {}) };
  if (!scenario) return next;

  const isMalicious = scenario.legitimacy === "malicious";
  const handledSafely = isMalicious && action !== "proceed";

  if (handledSafely && hasDomainCue(scenario.cues)) {
    next.domain_detective = (next.domain_detective || 0) + 1;
  }

  if (usedVerification && isMalicious) {
    next.verification_pro = (next.verification_pro || 0) + 1;
  }

  if (handledSafely && scenario.attackFamily === "bec") {
    next.bec_blocker = (next.bec_blocker || 0) + 1;
  }

  if (handledSafely && hasUrgencyCue(scenario.cues)) {
    next.urgency_immune = (next.urgency_immune || 0) + 1;
  }

  return next;
}

function getCueKey(scenario: Scenario, cue: string, index: number): string {
  if (scenario.i18nKey) {
    return `scenarios.${scenario.i18nKey}.cues.${index}`;
  }
  return cue;
}

function checkAndAwardBadges(
  earnedBadges: BadgeId[],
  badgeCounts: BadgeCounts,
  currentStreak: number
): BadgeId[] {
  const newBadges: BadgeId[] = [];

  if ((badgeCounts.domain_detective || 0) >= BADGES.domain_detective.requirement &&
      !earnedBadges.includes("domain_detective")) {
    newBadges.push("domain_detective");
  }

  if ((badgeCounts.verification_pro || 0) >= BADGES.verification_pro.requirement &&
      !earnedBadges.includes("verification_pro")) {
    newBadges.push("verification_pro");
  }

  if ((badgeCounts.bec_blocker || 0) >= BADGES.bec_blocker.requirement &&
      !earnedBadges.includes("bec_blocker")) {
    newBadges.push("bec_blocker");
  }

  if ((badgeCounts.urgency_immune || 0) >= BADGES.urgency_immune.requirement &&
      !earnedBadges.includes("urgency_immune")) {
    newBadges.push("urgency_immune");
  }

  if (currentStreak >= BADGES.streak_master.requirement &&
      !earnedBadges.includes("streak_master")) {
    newBadges.push("streak_master");
  }

  return newBadges;
}

export function calculateOutcome(
  scenario: Scenario,
  action: ActionType,
  usedVerification: boolean
): { outcome: OutcomeType; points: number } {
  const isCorrect = action === scenario.correctAction;
  const isMalicious = scenario.legitimacy === "malicious";
  const isLegitimate = scenario.legitimacy === "legitimate";
  const isSuspiciousLegit = scenario.legitimacy === "suspicious_legitimate";

  if (action === "proceed" && isMalicious) {
    return { outcome: "compromised", points: -20 };
  }

  if (action === "report" && isLegitimate) {
    return { outcome: "false_alarm", points: -5 };
  }

  if (action === "report" && isSuspiciousLegit) {
    return { outcome: "false_alarm", points: -2 };
  }

  if (action === "delete" && isLegitimate) {
    return { outcome: "delayed_work", points: -3 };
  }

  if (action === "verify") {
    if (isMalicious) {
      return { outcome: "safe", points: 15 };
    }
    if (isLegitimate || isSuspiciousLegit) {
      return { outcome: "safe", points: 8 };
    }
  }

  if (action === "report" && isMalicious) {
    return { outcome: "safe", points: 15 };
  }

  if (action === "delete" && isMalicious) {
    return { outcome: "safe", points: 10 };
  }

  if (action === "proceed" && isLegitimate) {
    return { outcome: "safe", points: 10 };
  }

  if (action === "proceed" && isSuspiciousLegit) {
    return { outcome: "safe", points: 5 };
  }

  if (action === "delete" && isSuspiciousLegit) {
    return { outcome: "delayed_work", points: 2 };
  }

  return { outcome: "safe", points: 5 };
}

function findNextChainScenario(
  scenarioLibrary: Scenario[],
  scenario: Scenario,
  action: ActionType
): Scenario | undefined {
  const currentChainOrder = scenario.chainOrder;
  if (!scenario.chainId || currentChainOrder === null || currentChainOrder === undefined) {
    return undefined;
  }
  return scenarioLibrary.find((candidate) =>
    candidate.chainId === scenario.chainId &&
    candidate.chainOrder === currentChainOrder + 1 &&
    candidate.previousAction === action
  );
}

export function applyDecision({
  shift,
  progress,
  scenario,
  action,
  confidence,
  scenarioLibrary,
}: {
  shift: LocalShift;
  progress: UserProgress;
  scenario: Scenario;
  action: ActionType;
  confidence: number;
  scenarioLibrary: Scenario[];
}): DecisionResult {
  if (!shift.scenarioIds.includes(scenario.id)) {
    throw new Error("Scenario not part of this shift");
  }
  if (shift.completedScenarioIds.includes(scenario.id)) {
    throw new Error("Decision already submitted");
  }

  const usedVerification = action === "verify";
  if (usedVerification && shift.verificationsUsed >= shift.verificationBudget) {
    throw new Error("No verifications remaining");
  }

  const { outcome, points } = calculateOutcome(scenario, action, usedVerification);

  const isCorrect = action === scenario.correctAction;
  const isFalsePositive = outcome === "false_alarm";
  const isCompromised = outcome === "compromised";
  const isReport = action === "report";
  const isMalicious = scenario.legitimacy === "malicious";
  const isLegitimate = scenario.legitimacy === "legitimate" || scenario.legitimacy === "suspicious_legitimate";
  const isCorrectReport = isReport && isMalicious;
  const isCorrectMaliciousHandling = isMalicious && action !== "proceed";
  const isUnsafeAction = isMalicious && action === "proceed";
  const isHighConfidenceWrong = !isCorrect && confidence >= 85;
  const isCorrectLegitimateHandling = isLegitimate && isCorrect;

  const completedScenarioIds = [...shift.completedScenarioIds, scenario.id];
  let updatedShift: LocalShift = {
    ...shift,
    score: shift.score + points,
    correctDecisions: shift.correctDecisions + (isCorrect ? 1 : 0),
    falsePositives: shift.falsePositives + (isFalsePositive ? 1 : 0),
    compromised: shift.compromised + (isCompromised ? 1 : 0),
    verificationsUsed: shift.verificationsUsed + (usedVerification ? 1 : 0),
    completedScenarioIds,
  };

  const currentStreak = isCompromised ? 0 : (progress.currentStreak || 0) + (isCorrect ? 1 : 0);
  const longestStreak = Math.max(currentStreak, progress.longestStreak || 0);

  const missedCues = { ...(progress.missedCues as Record<string, number> || {}) };
  if (!isCorrect && scenario.cues) {
    scenario.cues.forEach((cue, index) => {
      const cueKey = getCueKey(scenario, cue, index);
      missedCues[cueKey] = (missedCues[cueKey] || 0) + 1;
    });
  }

  const badgeCounts = updateBadgeCounts(
    progress.badgeCounts as BadgeCounts | undefined,
    scenario,
    action,
    usedVerification
  );

  const newBadges = checkAndAwardBadges(
    [...(progress.earnedBadges || [])] as BadgeId[],
    badgeCounts,
    currentStreak
  );
  const allBadges = [...(progress.earnedBadges || []), ...newBadges];

  const updatedProgress: UserProgress = {
    ...progress,
    totalDecisions: (progress.totalDecisions || 0) + 1,
    correctDecisions: (progress.correctDecisions || 0) + (isCorrect ? 1 : 0),
    falsePositives: (progress.falsePositives || 0) + (isFalsePositive ? 1 : 0),
    compromised: (progress.compromised || 0) + (isCompromised ? 1 : 0),
    totalReports: (progress.totalReports || 0) + (isReport ? 1 : 0),
    correctReports: (progress.correctReports || 0) + (isCorrectReport ? 1 : 0),
    totalMaliciousSeen: (progress.totalMaliciousSeen || 0) + (isMalicious ? 1 : 0),
    correctMaliciousHandling: (progress.correctMaliciousHandling || 0) + (isCorrectMaliciousHandling ? 1 : 0),
    totalLegitimateSeen: (progress.totalLegitimateSeen || 0) + (isLegitimate ? 1 : 0),
    correctLegitimateHandling: (progress.correctLegitimateHandling || 0) + (isCorrectLegitimateHandling ? 1 : 0),
    unsafeActions: (progress.unsafeActions || 0) + (isUnsafeAction ? 1 : 0),
    highConfidenceWrong: (progress.highConfidenceWrong || 0) + (isHighConfidenceWrong ? 1 : 0),
    currentStreak,
    longestStreak,
    totalScore: (progress.totalScore || 0) + points,
    missedCues,
    badgeCounts,
    earnedBadges: allBadges,
    lastPlayedAt: new Date(),
  };

  const nextScenario = findNextChainScenario(scenarioLibrary, scenario, action);
  if (nextScenario && !updatedShift.scenarioIds.includes(nextScenario.id)) {
    updatedShift = {
      ...updatedShift,
      scenarioIds: [...updatedShift.scenarioIds, nextScenario.id],
      scenarios: [...updatedShift.scenarios, nextScenario],
    };
  }

  return {
    shift: updatedShift,
    progress: updatedProgress,
    outcome,
    pointsEarned: points,
    newBadges,
    nextScenario,
  };
}

export function completeShift(
  shift: LocalShift,
  progress: UserProgress
): { shift: LocalShift; progress: UserProgress; newBadges: BadgeId[] } {
  if (shift.completedAt) {
    return { shift, progress, newBadges: [] };
  }

  const totalMessages = shift.scenarioIds.length;
  const isPerfect = shift.correctDecisions === totalMessages &&
    shift.compromised === 0 &&
    shift.falsePositives === 0;

  const earnedBadges = [...(progress.earnedBadges || [])] as BadgeId[];
  const newBadges: BadgeId[] = [];

  if (isPerfect && !earnedBadges.includes("perfect_shift")) {
    newBadges.push("perfect_shift");
  }

  const updatedProgress: UserProgress = {
    ...progress,
    totalShifts: (progress.totalShifts || 0) + 1,
    earnedBadges: [...earnedBadges, ...newBadges],
    lastPlayedAt: new Date(),
  };

  return {
    shift: { ...shift, completedAt: new Date() },
    progress: updatedProgress,
    newBadges,
  };
}

function pickRandom<T extends { id: string }>(items: T[], count: number, excludeIds?: Set<string>): T[] {
  const filtered = excludeIds ? items.filter((item) => !excludeIds.has(item.id)) : items;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function selectAdaptiveScenarios(
  scenarioLibrary: Scenario[],
  count: number,
  accuracy: number,
  shiftsCompleted: number
): Scenario[] {
  let maxDifficulty = 2;

  if (shiftsCompleted >= 3 && accuracy >= 0.60) {
    maxDifficulty = 3;
  }
  if (shiftsCompleted >= 6 && accuracy >= 0.70) {
    maxDifficulty = 4;
  }
  if (shiftsCompleted >= 11 && accuracy >= 0.75) {
    maxDifficulty = 5;
  }

  const baseScenarios = scenarioLibrary.filter(
    (scenario) => scenario.chainOrder === null || scenario.chainOrder === undefined || scenario.chainOrder === 1
  );

  const easyPool = baseScenarios.filter((scenario) => {
    const difficulty = typeof scenario.difficultyScore === "number" ? scenario.difficultyScore : 1;
    return difficulty <= maxDifficulty;
  });

  const challengePool = baseScenarios.filter((scenario) => {
    const difficulty = typeof scenario.difficultyScore === "number" ? scenario.difficultyScore : 1;
    return difficulty === Math.min(maxDifficulty + 1, 5);
  });

  const easyCount = Math.ceil(count * 0.8);
  const challengeCount = count - easyCount;

  const easyScenarios = pickRandom(easyPool, easyCount);
  const challengeScenarios = pickRandom(challengePool, challengeCount, new Set(easyScenarios.map((s) => s.id)));

  let combined = [...easyScenarios, ...challengeScenarios];

  if (combined.length < count) {
    const existingIds = new Set(combined.map((scenario) => scenario.id));
    const backfill = pickRandom(easyPool, count - combined.length, existingIds);
    combined = [...combined, ...backfill];
  }

  return combined.sort(() => Math.random() - 0.5);
}
