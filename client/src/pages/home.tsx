import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dashboard } from "@/components/dashboard";
import { Header } from "@/components/header";
import { useTranslation } from "react-i18next";
import type { Assignment, Scenario } from "@shared/schema";
import { useTrainingSession } from "@/lib/training-session";
import { selectAdaptiveScenarios } from "@/lib/training-engine";

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { progress, assignmentCompletions, startShift } = useTrainingSession();

  const { data: scenarioLibrary, isLoading: scenariosLoading } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const scenarioMap = useMemo(() => {
    return new Map((scenarioLibrary || []).map((scenario) => [scenario.id, scenario]));
  }, [scenarioLibrary]);

  const handleStartShift = () => {
    if (!scenarioLibrary || scenarioLibrary.length === 0) {
      toast({
        title: t("common.error"),
        description: t("errors.shiftFailed"),
        variant: "destructive",
      });
      return;
    }

    const accuracy = progress.totalDecisions > 0
      ? progress.correctDecisions / progress.totalDecisions
      : 0;

    const scenarios = selectAdaptiveScenarios(
      scenarioLibrary,
      10,
      accuracy,
      progress.totalShifts || 0
    );
    const shift = startShift({ scenarios });
    navigate(`/training/${shift.id}`);
  };

  const handleStartAssignment = (assignmentId: string) => {
    if (!scenarioLibrary || scenarioLibrary.length === 0) {
      toast({
        title: t("common.error"),
        description: t("errors.assignmentStartFailed"),
        variant: "destructive",
      });
      return;
    }

    const assignment = (assignments || []).find((item) => item.id === assignmentId);
    if (!assignment) {
      toast({
        title: t("common.error"),
        description: t("errors.assignmentStartFailed"),
        variant: "destructive",
      });
      return;
    }

    const scenarios = assignment.scenarioIds
      .map((scenarioId) => scenarioMap.get(scenarioId))
      .filter(Boolean) as Scenario[];

    if (scenarios.length === 0) {
      toast({
        title: t("common.error"),
        description: t("errors.assignmentStartFailed"),
        variant: "destructive",
      });
      return;
    }

    const shift = startShift({
      scenarios,
      assignmentId: assignment.id,
      verificationBudget: assignment.verificationBudget ?? 3,
      assignmentPassingScore: assignment.passingScore ?? 70,
    });
    navigate(`/training/${shift.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Dashboard 
          progress={progress}
          isLoading={scenariosLoading || assignmentsLoading}
          onStartShift={handleStartShift}
          assignments={assignments || []}
          completions={assignmentCompletions}
          onStartAssignment={handleStartAssignment}
        />
      </main>
    </div>
  );
}
