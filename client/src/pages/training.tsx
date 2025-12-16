import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { isUnauthorizedError } from "@/lib/auth-utils";
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
import type { Scenario, Shift, ActionType, OutcomeType, Decision } from "@shared/schema";

interface ShiftWithScenarios extends Shift {
  scenarios: Scenario[];
}

export default function Training() {
  const { t } = useTranslation();
  const { id: shiftId } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: shift, isLoading: shiftLoading, refetch: refetchShift } = useQuery<ShiftWithScenarios>({
    queryKey: ["/api/shifts", shiftId],
    enabled: isAuthenticated && !!shiftId,
  });

  const createShiftMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/shifts");
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/training/${data.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create a new shift.",
        variant: "destructive",
      });
    },
  });

  const submitDecisionMutation = useMutation({
    mutationFn: async ({ action, confidence }: { action: ActionType; confidence: number }) => {
      const scenario = shift?.scenarios[currentIndex];
      if (!scenario || !shift) throw new Error("No scenario selected");
      
      const response = await apiRequest("POST", `/api/shifts/${shift.id}/decisions`, {
        scenarioId: scenario.id,
        action,
        confidence,
      });
      return response.json();
    },
    onSuccess: (data: { decision: Decision; outcome: OutcomeType; pointsEarned: number; shift: Shift }) => {
      const scenario = shift?.scenarios[currentIndex];
      if (scenario) {
        setCompletedIds(prev => [...prev, scenario.id]);
        setLastDecision({
          scenario,
          action: data.decision.action as ActionType,
          outcome: data.outcome,
          pointsEarned: data.pointsEarned,
        });
      }
      refetchShift();
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      setPendingAction(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit decision.",
        variant: "destructive",
      });
      setPendingAction(null);
    },
  });

  const handleAction = (action: ActionType) => {
    setPendingAction(action);
  };

  const handleConfidenceSubmit = (confidence: number) => {
    if (pendingAction) {
      submitDecisionMutation.mutate({ action: pendingAction, confidence });
    }
  };

  const handleConfidenceCancel = () => {
    setPendingAction(null);
  };

  const handleContinueFromFeedback = () => {
    setLastDecision(null);
    
    if (shift) {
      const nextIncompleteIndex = shift.scenarios.findIndex(
        (s, i) => i > currentIndex && !completedIds.includes(s.id)
      );
      
      if (nextIncompleteIndex >= 0) {
        setCurrentIndex(nextIncompleteIndex);
      } else {
        const anyIncomplete = shift.scenarios.findIndex(
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
    navigate("/");
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

  const handlePlayAgain = () => {
    setShowComplete(false);
    setCompletedIds([]);
    setCurrentIndex(0);
    createShiftMutation.mutate();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!shiftId) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main className="max-w-2xl mx-auto p-6 py-12">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('training.readyToTrain.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('training.readyToTrain.description')}
            </p>
            <Button 
              size="lg" 
              onClick={() => createShiftMutation.mutate()}
              disabled={createShiftMutation.isPending}
              data-testid="button-start-training"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {createShiftMutation.isPending ? t('training.readyToTrain.startingButton') : t('training.readyToTrain.startButton')}
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const scenarios = shift?.scenarios || [];
  const currentScenario = scenarios[currentIndex] || null;
  const verificationsRemaining = shift 
    ? shift.verificationBudget - shift.verificationsUsed 
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        user={user} 
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
              <div className="lg:col-span-3 overflow-hidden">
                <MessageDetail
                  scenario={currentScenario}
                  verificationsRemaining={verificationsRemaining}
                  onAction={handleAction}
                  disabled={submitDecisionMutation.isPending || completedIds.includes(currentScenario?.id || "")}
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

      {showComplete && shift && (
        <ShiftComplete
          shift={shift}
          onGoHome={handleGoHome}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
