import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { Header } from "@/components/header";
import { MessageList } from "@/components/inbox/message-list";
import { MessageDetail } from "@/components/inbox/message-detail";
import { ConfidenceRating } from "@/components/inbox/confidence-rating";
import { FeedbackScreen } from "@/components/inbox/feedback-screen";
import { ShiftComplete } from "@/components/inbox/shift-complete";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import type { Scenario, ActionType, OutcomeType } from "@shared/schema";
import { localizeScenario } from "@/lib/localize-scenario";
import { useTrainingSession } from "@/lib/training-session";
import { selectAdaptiveScenarios, type LocalShift } from "@/lib/training-engine";

export default function Training() {
  const { t, i18n } = useTranslation();
  const { id: shiftId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { progress, shift, startShift, recordDecision, finalizeShift } = useTrainingSession();

  const { data: scenarioLibrary, isLoading: scenariosLoading } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [lastDecision, setLastDecision] = useState<{
    scenario: Scenario;
    action: ActionType;
    outcome: OutcomeType;
    pointsEarned: number;
  } | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [lensChecks, setLensChecks] = useState<Set<string>>(new Set());

  const activeShift = useMemo<LocalShift | null>(() => {
    if (!shift) return null;
    if (shiftId && shift.id !== shiftId) return null;
    return shift;
  }, [shift, shiftId]);

  const displayShift = useMemo(() => {
    if (!activeShift) return null;
    return {
      ...activeShift,
      scenarios: activeShift.scenarios.map((scenario) => localizeScenario(scenario, t)),
    };
  }, [activeShift, t, i18n.language]);

  const shiftLoading = scenariosLoading && !!shiftId && !activeShift;

  const createShift = () => {
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

    const nextShift = startShift({ scenarios });
    setCurrentIndex(0);
    setCompletedIds([]);
    setShowComplete(false);
    navigate(`/training/${nextShift.id}`);
  };

  const handleAction = (action: ActionType) => {
    setPendingAction(action);
  };

  const handleConfidenceSubmit = (confidence: number) => {
    if (!pendingAction || !displayShift || !activeShift) {
      return;
    }

    const scenario = displayShift.scenarios[currentIndex];
    if (!scenario) {
      setPendingAction(null);
      return;
    }

    try {
      const result = recordDecision({
        scenario,
        action: pendingAction,
        confidence,
        scenarioLibrary: scenarioLibrary || activeShift.scenarios,
      });
      setCompletedIds(result.shift.completedScenarioIds);
      setLastDecision({
        scenario,
        action: pendingAction,
        outcome: result.outcome,
        pointsEarned: result.pointsEarned,
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("errors.submitDecisionFailed"),
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleConfidenceCancel = () => {
    setPendingAction(null);
  };

  const handleContinueFromFeedback = () => {
    setLastDecision(null);
    
    if (displayShift) {
      const nextIncompleteIndex = displayShift.scenarios.findIndex(
        (s, i) => i > currentIndex && !completedIds.includes(s.id)
      );
      
      if (nextIncompleteIndex >= 0) {
        setCurrentIndex(nextIncompleteIndex);
      } else {
        const anyIncomplete = displayShift.scenarios.findIndex(
          s => !completedIds.includes(s.id)
        );
        if (anyIncomplete >= 0) {
          setCurrentIndex(anyIncomplete);
        } else {
          setShowComplete(true);
        }
      }
    }
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleLensCheck = (checkId: string, checked: boolean) => {
    setLensChecks(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(checkId);
      } else {
        newSet.delete(checkId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    setLensChecks(new Set());
  }, [currentIndex]);

  useEffect(() => {
    if (activeShift?.completedScenarioIds) {
      setCompletedIds(activeShift.completedScenarioIds);
    } else {
      setCompletedIds([]);
    }
  }, [activeShift?.completedScenarioIds, activeShift?.id]);

  const handlePlayAgain = () => {
    setShowComplete(false);
    setCompletedIds([]);
    setCurrentIndex(0);
    createShift();
  };

  useEffect(() => {
    if (activeShift?.completedAt) {
      setShowComplete(true);
    }
  }, [activeShift?.completedAt]);

  useEffect(() => {
    if (showComplete && activeShift && !activeShift.completedAt) {
      finalizeShift();
    }
  }, [showComplete, activeShift, finalizeShift]);

  if (!activeShift && !shiftLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto p-6 py-12">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('training.readyToTrain.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('training.readyToTrain.description')}
            </p>
            <Button 
              size="lg" 
              onClick={createShift}
              disabled={scenariosLoading}
              data-testid="button-start-training"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {scenariosLoading ? t('training.readyToTrain.startingButton') : t('training.readyToTrain.startButton')}
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const scenarios = displayShift?.scenarios || [];
  const currentScenario = scenarios[currentIndex] || null;
  const verificationsRemaining = activeShift 
    ? activeShift.verificationBudget - activeShift.verificationsUsed 
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        inShift={true}
        verificationsRemaining={verificationsRemaining}
      />
      
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {shiftLoading ? (
            <div className="grid lg:grid-cols-5 gap-4 h-full">
              <div className="lg:col-span-2">
                <Card className="h-full p-4">
                  <Skeleton className="h-10 w-full mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-3 space-y-4">
                <Card className="h-96 p-4">
                  <Skeleton className="h-full w-full" />
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-4 h-[calc(100vh-8rem)]">
              <div className="lg:col-span-2 overflow-hidden">
                <MessageList
                  scenarios={scenarios}
                  currentIndex={currentIndex}
                  completedIds={completedIds}
                  onSelectMessage={setCurrentIndex}
                />
              </div>
              <div className="lg:col-span-3 overflow-auto">
                <MessageDetail
                  scenario={currentScenario}
                  verificationsRemaining={verificationsRemaining}
                  onAction={handleAction}
                  disabled={pendingAction !== null || completedIds.includes(currentScenario?.id || "")}
                  lensChecks={lensChecks}
                  onLensCheck={handleLensCheck}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {pendingAction && (
        <ConfidenceRating
          action={pendingAction}
          onSubmit={handleConfidenceSubmit}
          onCancel={handleConfidenceCancel}
        />
      )}

      {lastDecision && (
        <FeedbackScreen
          scenario={lastDecision.scenario}
          userAction={lastDecision.action}
          outcome={lastDecision.outcome}
          pointsEarned={lastDecision.pointsEarned}
          onContinue={handleContinueFromFeedback}
        />
      )}

      {showComplete && activeShift && (
        <ShiftComplete
          shift={activeShift}
          onGoHome={handleGoHome}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
