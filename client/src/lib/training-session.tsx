import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import type { ActionType, AssignmentCompletion, Scenario, UserProgress } from "@shared/schema";
import {
  applyDecision,
  completeShift,
  createEmptyProgress,
  createShift,
  type DecisionResult,
  type LocalShift,
} from "./training-engine";

interface TrainingSessionContextValue {
  progress: UserProgress;
  shift: LocalShift | null;
  assignmentCompletions: AssignmentCompletion[];
  startShift: (options: {
    scenarios: Scenario[];
    verificationBudget?: number;
    assignmentId?: string | null;
    assignmentPassingScore?: number | null;
  }) => LocalShift;
  recordDecision: (options: {
    scenario: Scenario;
    action: ActionType;
    confidence: number;
    scenarioLibrary: Scenario[];
  }) => DecisionResult;
  finalizeShift: () => { shift: LocalShift; newBadges: string[] } | null;
  resetShift: () => void;
}

const TrainingSessionContext = createContext<TrainingSessionContextValue | null>(null);

function generateSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `session_${crypto.randomUUID()}`;
  }
  return `session_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(generateSessionId);
  const [progress, setProgress] = useState<UserProgress>(() => createEmptyProgress(sessionId));
  const [shift, setShift] = useState<LocalShift | null>(null);
  const [assignmentCompletions, setAssignmentCompletions] = useState<AssignmentCompletion[]>([]);

  const startShift = useCallback((options: {
    scenarios: Scenario[];
    verificationBudget?: number;
    assignmentId?: string | null;
    assignmentPassingScore?: number | null;
  }) => {
    const nextShift = createShift({
      scenarios: options.scenarios,
      verificationBudget: options.verificationBudget,
      assignmentId: options.assignmentId ?? null,
      assignmentPassingScore: options.assignmentPassingScore ?? null,
      userId: sessionId,
    });
    setShift(nextShift);
    return nextShift;
  }, [sessionId]);

  const recordDecision = useCallback((options: {
    scenario: Scenario;
    action: ActionType;
    confidence: number;
    scenarioLibrary: Scenario[];
  }) => {
    if (!shift) {
      throw new Error("No active shift");
    }
    const result = applyDecision({
      shift,
      progress,
      scenario: options.scenario,
      action: options.action,
      confidence: options.confidence,
      scenarioLibrary: options.scenarioLibrary,
    });
    setShift(result.shift);
    setProgress(result.progress);
    return result;
  }, [progress, shift]);

  const finalizeShift = useCallback(() => {
    if (!shift) return null;

    const { shift: completedShift, progress: updatedProgress, newBadges } = completeShift(shift, progress);
    setShift(completedShift);
    setProgress(updatedProgress);

    if (completedShift.assignmentId) {
      const totalMessages = completedShift.scenarioIds.length;
      const accuracy = totalMessages > 0
        ? Math.round((completedShift.correctDecisions / totalMessages) * 100)
        : 0;
      const passingScore = completedShift.assignmentPassingScore ?? 70;
      const passed = accuracy >= passingScore;

      const completion: AssignmentCompletion = {
        id: `completion_${completedShift.id}`,
        assignmentId: completedShift.assignmentId,
        userId: sessionId,
        shiftId: completedShift.id,
        score: accuracy,
        passed,
        completedAt: new Date(),
        startedAt: completedShift.startedAt ?? new Date(),
      };

      setAssignmentCompletions((prev) => {
        const existingIndex = prev.findIndex((item) => item.assignmentId === completion.assignmentId);
        if (existingIndex === -1) {
          return [...prev, completion];
        }
        const next = [...prev];
        next[existingIndex] = completion;
        return next;
      });
    }

    return { shift: completedShift, newBadges };
  }, [progress, sessionId, shift]);

  const resetShift = useCallback(() => {
    setShift(null);
  }, []);

  const value = useMemo(() => ({
    progress,
    shift,
    assignmentCompletions,
    startShift,
    recordDecision,
    finalizeShift,
    resetShift,
  }), [assignmentCompletions, finalizeShift, progress, recordDecision, resetShift, shift, startShift]);

  return (
    <TrainingSessionContext.Provider value={value}>
      {children}
    </TrainingSessionContext.Provider>
  );
}

export function useTrainingSession() {
  const context = useContext(TrainingSessionContext);
  if (!context) {
    throw new Error("useTrainingSession must be used within TrainingSessionProvider");
  }
  return context;
}
