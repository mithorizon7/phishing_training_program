import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Shield, 
  Wifi, 
  Key, 
  Phone, 
  FileText,
  RotateCcw,
  Trophy
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

type ScenarioType = "clicked_link" | "entered_credentials" | "sent_money" | "downloaded_file";

interface RecoveryStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  critical: boolean;
}

interface DrillScenario {
  id: ScenarioType;
  titleKey: string;
  descriptionKey: string;
  steps: RecoveryStep[];
}

const DRILL_SCENARIOS: DrillScenario[] = [
  {
    id: "clicked_link",
    titleKey: "recover.scenarios.clicked_link.title",
    descriptionKey: "recover.scenarios.clicked_link.description",
    steps: [
      { id: "disconnect", titleKey: "recover.scenarios.clicked_link.steps.disconnect.title", descriptionKey: "recover.scenarios.clicked_link.steps.disconnect.description", icon: Wifi, critical: true },
      { id: "report", titleKey: "recover.scenarios.clicked_link.steps.report.title", descriptionKey: "recover.scenarios.clicked_link.steps.report.description", icon: Phone, critical: true },
      { id: "scan", titleKey: "recover.scenarios.clicked_link.steps.scan.title", descriptionKey: "recover.scenarios.clicked_link.steps.scan.description", icon: Shield, critical: true },
      { id: "document", titleKey: "recover.scenarios.clicked_link.steps.document.title", descriptionKey: "recover.scenarios.clicked_link.steps.document.description", icon: FileText, critical: false },
    ],
  },
  {
    id: "entered_credentials",
    titleKey: "recover.scenarios.entered_credentials.title",
    descriptionKey: "recover.scenarios.entered_credentials.description",
    steps: [
      { id: "change_password", titleKey: "recover.scenarios.entered_credentials.steps.change_password.title", descriptionKey: "recover.scenarios.entered_credentials.steps.change_password.description", icon: Key, critical: true },
      { id: "report", titleKey: "recover.scenarios.entered_credentials.steps.report.title", descriptionKey: "recover.scenarios.entered_credentials.steps.report.description", icon: Phone, critical: true },
      { id: "mfa", titleKey: "recover.scenarios.entered_credentials.steps.mfa.title", descriptionKey: "recover.scenarios.entered_credentials.steps.mfa.description", icon: Shield, critical: true },
      { id: "check_accounts", titleKey: "recover.scenarios.entered_credentials.steps.check_accounts.title", descriptionKey: "recover.scenarios.entered_credentials.steps.check_accounts.description", icon: Key, critical: false },
      { id: "monitor", titleKey: "recover.scenarios.entered_credentials.steps.monitor.title", descriptionKey: "recover.scenarios.entered_credentials.steps.monitor.description", icon: FileText, critical: false },
    ],
  },
  {
    id: "sent_money",
    titleKey: "recover.scenarios.sent_money.title",
    descriptionKey: "recover.scenarios.sent_money.description",
    steps: [
      { id: "bank", titleKey: "recover.scenarios.sent_money.steps.bank.title", descriptionKey: "recover.scenarios.sent_money.steps.bank.description", icon: Phone, critical: true },
      { id: "report_it", titleKey: "recover.scenarios.sent_money.steps.report_it.title", descriptionKey: "recover.scenarios.sent_money.steps.report_it.description", icon: Phone, critical: true },
      { id: "report_fbi", titleKey: "recover.scenarios.sent_money.steps.report_fbi.title", descriptionKey: "recover.scenarios.sent_money.steps.report_fbi.description", icon: Shield, critical: false },
      { id: "document", titleKey: "recover.scenarios.sent_money.steps.document.title", descriptionKey: "recover.scenarios.sent_money.steps.document.description", icon: FileText, critical: false },
      { id: "notify", titleKey: "recover.scenarios.sent_money.steps.notify.title", descriptionKey: "recover.scenarios.sent_money.steps.notify.description", icon: Phone, critical: false },
    ],
  },
  {
    id: "downloaded_file",
    titleKey: "recover.scenarios.downloaded_file.title",
    descriptionKey: "recover.scenarios.downloaded_file.description",
    steps: [
      { id: "disconnect", titleKey: "recover.scenarios.downloaded_file.steps.disconnect.title", descriptionKey: "recover.scenarios.downloaded_file.steps.disconnect.description", icon: Wifi, critical: true },
      { id: "no_touch", titleKey: "recover.scenarios.downloaded_file.steps.no_touch.title", descriptionKey: "recover.scenarios.downloaded_file.steps.no_touch.description", icon: XCircle, critical: true },
      { id: "report", titleKey: "recover.scenarios.downloaded_file.steps.report.title", descriptionKey: "recover.scenarios.downloaded_file.steps.report.description", icon: Phone, critical: true },
      { id: "scan", titleKey: "recover.scenarios.downloaded_file.steps.scan.title", descriptionKey: "recover.scenarios.downloaded_file.steps.scan.description", icon: Shield, critical: false },
      { id: "change_passwords", titleKey: "recover.scenarios.downloaded_file.steps.change_passwords.title", descriptionKey: "recover.scenarios.downloaded_file.steps.change_passwords.description", icon: Key, critical: false },
    ],
  },
];

export default function RecoverDrill() {
  const { t } = useTranslation();
  const [selectedScenario, setSelectedScenario] = useState<DrillScenario | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const handleStepClick = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setCompletedSteps(new Set());
    setShowResults(false);
  };

  const getCriticalStepsCompleted = () => {
    if (!selectedScenario) return 0;
    const criticalSteps = selectedScenario.steps.filter(s => s.critical);
    return criticalSteps.filter(s => completedSteps.has(s.id)).length;
  };

  const getTotalCriticalSteps = () => {
    if (!selectedScenario) return 0;
    return selectedScenario.steps.filter(s => s.critical).length;
  };

  const getScore = () => {
    if (!selectedScenario) return 0;
    const criticalSteps = selectedScenario.steps.filter(s => s.critical);
    const optionalSteps = selectedScenario.steps.filter(s => !s.critical);
    const criticalCompleted = criticalSteps.filter(s => completedSteps.has(s.id)).length;
    const optionalCompleted = optionalSteps.filter(s => completedSteps.has(s.id)).length;
    const allCriticalDone = criticalCompleted === criticalSteps.length;
    
    if (allCriticalDone) {
      return 100;
    }
    
    const criticalPercent = criticalSteps.length > 0 
      ? (criticalCompleted / criticalSteps.length) * 80 
      : 80;
    const optionalBonus = optionalSteps.length > 0 
      ? (optionalCompleted / optionalSteps.length) * 10 
      : 0;
    
    return Math.round(criticalPercent + optionalBonus);
  };

  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-background app-shell">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold" data-testid="text-recover-title">{t("recover.title")}</h1>
              <p className="text-muted-foreground">{t("recover.subtitle")}</p>
            </div>
            <Link href="/">
              <Button variant="outline" data-testid="link-back-dashboard">
                {t("recover.backToDashboard")}
              </Button>
            </Link>
          </div>

          <Card className="border border-black/5 dark:border-white/10 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                {t("recover.intro.title")}
              </CardTitle>
              <CardDescription>
                {t("recover.intro.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {DRILL_SCENARIOS.map((scenario) => (
                  <Card 
                    key={scenario.id}
                    className="group cursor-pointer border border-black/5 dark:border-white/10 bg-background/60 transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-50px_rgba(15,23,42,0.6)]"
                    onClick={() => setSelectedScenario(scenario)}
                    data-testid={`card-scenario-${scenario.id}`}
                  >
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{t(scenario.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground">{t(scenario.descriptionKey)}</p>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <Badge variant="outline">
                          {t("recover.labels.criticalStepsCount", { count: scenario.steps.filter(s => s.critical).length })}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5 dark:border-white/10 bg-background/60">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">{t("recover.why.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("recover.why.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = getScore();
    const criticalCompleted = getCriticalStepsCompleted();
    const totalCritical = getTotalCriticalSteps();
    const allCriticalDone = criticalCompleted === totalCritical;

    return (
      <div className="min-h-screen bg-background app-shell">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          <Card className={`${allCriticalDone ? "border-chart-2" : "border-destructive"} bg-card/70`}>
          <CardHeader className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              allCriticalDone ? "bg-chart-2/20" : "bg-destructive/20"
            }`}>
              {allCriticalDone ? (
                <Trophy className="w-10 h-10 text-chart-2" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-destructive" />
              )}
            </div>
            <CardTitle>
              {allCriticalDone ? t("recover.results.successTitle") : t("recover.results.partialTitle")}
            </CardTitle>
            <CardDescription>
              {allCriticalDone 
                ? t("recover.results.successDescription")
                : t("recover.results.partialDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-recovery-score">{score}/100</div>
              <p className="text-muted-foreground">{t("recover.results.scoreLabel")}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t("recover.results.criticalStepsLabel", { completed: criticalCompleted, total: totalCritical })}
              </p>
              {selectedScenario.steps.map((step) => {
                const completed = completedSteps.has(step.id);
                const Icon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border border-black/5 dark:border-white/10 ${
                      completed ? "bg-chart-2/10 border-chart-2/30" : step.critical ? "bg-destructive/10 border-destructive/30" : "bg-background/60"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle className="w-5 h-5 text-chart-2 flex-shrink-0" />
                    ) : (
                      <XCircle className={`w-5 h-5 flex-shrink-0 ${step.critical ? "text-destructive" : "text-muted-foreground"}`} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${!completed && step.critical ? "text-destructive" : ""}`}>
                          {t(step.titleKey)}
                        </span>
                        {step.critical && (
                          <Badge variant={completed ? "default" : "destructive"}>{t("recover.labels.critical")}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{t(step.descriptionKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="border border-black/5 dark:border-white/10 bg-background/60">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-medium mb-2">{t("recover.results.keyTakeaway")}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedScenario.id === "clicked_link" && t("recover.results.takeaways.clicked_link")}
                  {selectedScenario.id === "entered_credentials" && t("recover.results.takeaways.entered_credentials")}
                  {selectedScenario.id === "sent_money" && t("recover.results.takeaways.sent_money")}
                  {selectedScenario.id === "downloaded_file" && t("recover.results.takeaways.downloaded_file")}
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset} data-testid="button-try-again">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("recover.results.tryAnother")}
              </Button>
              <Link href="/training" className="flex-1">
                <Button className="w-full" data-testid="button-back-training">
                  {t("recover.results.backToTraining")}
                </Button>
              </Link>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background app-shell">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t(selectedScenario.titleKey)}</h1>
            <p className="text-muted-foreground text-sm">{t(selectedScenario.descriptionKey)}</p>
          </div>
          <Button variant="ghost" onClick={handleReset} data-testid="button-change-scenario">
            {t("recover.actions.changeScenario")}
          </Button>
        </div>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{t("recover.prompt.title")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("recover.prompt.subtitle")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {selectedScenario.steps.map((step) => {
            const completed = completedSteps.has(step.id);
            const Icon = step.icon;
            return (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all border ${
                  completed ? "border-chart-2/50 bg-chart-2/10" : "border-black/5 dark:border-white/10 bg-background/60 hover:bg-background/80"
                }`}
                onClick={() => handleStepClick(step.id)}
                data-testid={`card-step-${step.id}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      completed ? "bg-chart-2/20" : "bg-muted/60"
                    }`}>
                      {completed ? (
                        <CheckCircle className="w-5 h-5 text-chart-2" />
                      ) : (
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t(step.titleKey)}</span>
                        {step.critical && (
                          <Badge variant="outline">{t("recover.labels.critical")}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{t(step.descriptionKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-0 z-50 bg-background/80 backdrop-blur border-t border-black/5 dark:border-white/10 pt-4 pb-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-sm text-muted-foreground">
              {t("recover.footer.stepsSelected", {
                selected: completedSteps.size,
                total: selectedScenario.steps.length
              })}
            </span>
            <span className="text-sm font-medium flex-shrink-0">
              {t("recover.footer.criticalSummary", {
                completed: getCriticalStepsCompleted(),
                total: getTotalCriticalSteps()
              })}
            </span>
          </div>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubmit}
            disabled={completedSteps.size === 0}
            data-testid="button-submit-recovery"
          >
            {t("recover.actions.checkResponse")}
          </Button>
        </div>
      </div>
    </div>
  );
}
