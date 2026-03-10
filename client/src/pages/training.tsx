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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, HelpCircle, Circle, CheckCircle2, Search, Target, X } from "lucide-react";
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
  const [showGuide, setShowGuide] = useState(false);

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

  const isFirstSession = progress.totalDecisions === 0;

  useEffect(() => {
    if (activeShift?.id && isFirstSession) {
      setShowGuide(true);
    }
  }, [activeShift?.id, isFirstSession]);

  useEffect(() => {
    if (showComplete && activeShift && !activeShift.completedAt) {
      finalizeShift();
    }
  }, [showComplete, activeShift, finalizeShift]);

  if (!activeShift && !shiftLoading) {
    return (
      <div className="min-h-screen bg-background app-shell">
        <Header />
        <main className="max-w-2xl mx-auto p-6 py-12">
          <Card className="p-10 text-center glass-panel">
            <h2 className="text-2xl font-bold mb-4">{t('training.readyToTrain.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('training.readyToTrain.description')}
            </p>
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-background/60 p-4 text-left mb-6">
              <p className="text-sm font-semibold mb-2">{t("training.readyToTrain.firstSuccessTitle")}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("training.readyToTrain.steps.inspect")}</li>
                <li>{t("training.readyToTrain.steps.decide")}</li>
                <li>{t("training.readyToTrain.steps.learn")}</li>
              </ul>
            </div>
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
  const isGuidedShift = activeShift
    ? (progress.totalShifts || 0) === 0 && !activeShift.completedAt
    : false;
  const recommendedIndex = Math.max(0, scenarios.findIndex((scenario) => !completedIds.includes(scenario.id)));
  const requiresGuidedInspection = isFirstSession && completedIds.length === 0;
  const requiredLensChecks = requiresGuidedInspection ? 3 : 0;
  const firstDecisionCompleted = progress.totalDecisions > 0 || completedIds.length > 0;
  const shiftProgress = scenarios.length > 0
    ? Math.round((completedIds.length / scenarios.length) * 100)
    : 0;
  const currentMessageNumber = scenarios.length > 0
    ? Math.min(currentIndex + 1, scenarios.length)
    : 0;
  const nextStepMode = isGuidedShift && lensChecks.size < requiredLensChecks
    ? "inspect"
    : isGuidedShift
      ? "decide"
      : "continue";
  const NextStepIcon = nextStepMode === "inspect" ? Search : Target;

  return (
    <div className="min-h-screen bg-background flex flex-col app-shell">
      <Header 
        inShift={true}
        verificationsRemaining={verificationsRemaining}
      />
      
      <main className="flex-1 px-6 pb-8 pt-6 overflow-auto lg:overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {shiftLoading ? (
            <div className="grid lg:grid-cols-5 gap-6 h-full">
              <div className="lg:col-span-2">
                <Card className="h-full p-4 border border-black/5 dark:border-white/10 bg-card/60">
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
                <Card className="h-96 p-4 border border-black/5 dark:border-white/10 bg-card/60">
                  <Skeleton className="h-full w-full" />
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-4 h-full">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-[220px] flex-1">
                  <p className="text-sm font-medium">
                    {t("training.progress.message", { current: currentMessageNumber, total: scenarios.length })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("training.progress.shiftProgress")}: {shiftProgress}%
                  </p>
                  <Progress value={shiftProgress} className="h-1.5 mt-2" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuide((previous) => !previous)}
                  data-testid="button-toggle-training-guide"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {showGuide ? t("training.onboarding.hideGuide") : t("training.onboarding.showGuide")}
                </Button>
              </div>

              <Card className={isGuidedShift ? "border border-primary/30 bg-primary/5" : "border border-black/5 dark:border-white/10 bg-card/60"}>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${isGuidedShift ? "bg-primary/10 text-primary" : "bg-background/70 text-foreground"}`}>
                      <NextStepIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {t("training.nextStep.kicker")}
                      </p>
                      <p className="font-semibold mt-1">
                        {t(`training.nextStep.${nextStepMode}.title`, { current: currentMessageNumber, total: scenarios.length })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(`training.nextStep.${nextStepMode}.description`, {
                          count: requiredLensChecks,
                          current: currentMessageNumber,
                          total: scenarios.length,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isGuidedShift ? "default" : "secondary"}>
                    {t(isGuidedShift ? "training.nextStep.badges.guided" : "training.nextStep.badges.recommended")}
                  </Badge>
                </div>
              </Card>

              {showGuide && (
                <Card className="border border-black/5 dark:border-white/10 bg-card/60">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{t("training.onboarding.title")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t(isFirstSession ? "training.onboarding.firstSessionSubtitle" : "training.onboarding.defaultSubtitle")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setShowGuide(false)}
                        data-testid="button-close-training-guide"
                      >
                        <X className="w-4 h-4" />
                        <span className="sr-only">{t("common.close")}</span>
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 mt-4">
                      {[
                        {
                          key: "inspect",
                          done: lensChecks.size >= 3 || firstDecisionCompleted,
                          active: !firstDecisionCompleted,
                        },
                        {
                          key: "decide",
                          done: pendingAction !== null || lastDecision !== null || firstDecisionCompleted,
                          active: lensChecks.size >= 3 && !firstDecisionCompleted,
                        },
                        {
                          key: "learn",
                          done: firstDecisionCompleted,
                          active: (pendingAction !== null || lastDecision !== null) && !firstDecisionCompleted,
                        },
                      ].map((step) => (
                        <div
                          key={step.key}
                          className={`rounded-2xl border p-3 ${
                            step.done
                              ? "border-chart-2/40 bg-chart-2/5"
                              : step.active
                                ? "border-primary/40 bg-primary/5"
                                : "border-black/5 dark:border-white/10 bg-background/60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {step.done ? (
                              <CheckCircle2 className="w-4 h-4 text-chart-2" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium">{t(`training.onboarding.steps.${step.key}.title`)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t(`training.onboarding.steps.${step.key}.description`)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {requiresGuidedInspection && (
                      <p className="text-xs mt-3 text-amber-600 dark:text-amber-400">
                        {t("training.onboarding.inspectionRequired", { count: requiredLensChecks })}
                      </p>
                    )}
                  </div>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-5 lg:h-[calc(100vh-11.5rem)]">
                <div className="lg:col-span-2 lg:overflow-hidden">
                  <MessageList
                    scenarios={scenarios}
                    currentIndex={currentIndex}
                    completedIds={completedIds}
                    onSelectMessage={setCurrentIndex}
                    guidedMode={isGuidedShift}
                    recommendedIndex={recommendedIndex}
                  />
                </div>
                <div className="lg:col-span-3 lg:overflow-auto">
                  <MessageDetail
                    scenario={currentScenario}
                    verificationsRemaining={verificationsRemaining}
                    onAction={handleAction}
                    disabled={pendingAction !== null || completedIds.includes(currentScenario?.id || "")}
                    lensChecks={lensChecks}
                    onLensCheck={handleLensCheck}
                    requiredLensChecks={requiredLensChecks}
                  />
                </div>
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
