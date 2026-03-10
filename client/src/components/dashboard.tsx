import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  Target, 
  AlertTriangle, 
  Flame, 
  PlayCircle, 
  TrendingUp,
  Search,
  CheckCircle,
  Clock,
  Star,
  Flag,
  ShieldAlert,
  Zap,
  FileText,
  Briefcase,
  ShieldCheck,
  LifeBuoy,
  Gauge,
  ShieldX,
  ShieldOff
} from "lucide-react";
import type { UserProgress, Assignment, AssignmentCompletion } from "@shared/schema";
import { BADGES } from "@shared/schema";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface DashboardProps {
  progress: UserProgress | null;
  isLoading: boolean;
  onStartShift: () => void;
  assignments?: Assignment[];
  completions?: AssignmentCompletion[];
  onStartAssignment?: (assignmentId: string) => void;
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  testId
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType;
  color: string;
  testId?: string;
}) {
  return (
    <Card className="relative overflow-hidden border border-black/5 dark:border-white/10 bg-card/60">
      <div className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-br from-white/10 to-transparent" />
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">{title}</CardTitle>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold" data-testid={`text-stat-${testId ?? title.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RiskMeter({ progress }: { progress: UserProgress | null }) {
  const { t } = useTranslation();
  const unsafeActions = progress?.unsafeActions || 0;
  const highConfWrong = progress?.highConfidenceWrong || 0;
  const totalDecisions = progress?.totalDecisions || 0;
  const totalMalicious = progress?.totalMaliciousSeen || 0;
  
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let riskScore = 0;
  let riskMessageKey = "dashboard.riskMeter.messageNoData";
  
  if (totalDecisions > 0) {
    const unsafeRate = totalMalicious > 0 ? (unsafeActions / totalMalicious) * 100 : 0;
    const calibrationIssues = totalDecisions > 0 ? (highConfWrong / totalDecisions) * 100 : 0;
    
    riskScore = Math.min(100, Math.round(unsafeRate * 0.7 + calibrationIssues * 0.3));
    
    if (riskScore <= 10) {
      riskLevel = "low";
      riskMessageKey = "dashboard.riskMeter.messageLow";
    } else if (riskScore <= 30) {
      riskLevel = "medium";
      riskMessageKey = "dashboard.riskMeter.messageMedium";
    } else if (riskScore <= 50) {
      riskLevel = "high";
      riskMessageKey = "dashboard.riskMeter.messageHigh";
    } else {
      riskLevel = "critical";
      riskMessageKey = "dashboard.riskMeter.messageCritical";
    }
  }

  const riskMessage = t(riskMessageKey);
  
  const riskColors = {
    low: { bg: "bg-chart-2/20", border: "border-chart-2/50", text: "text-chart-2", fill: "bg-chart-2" },
    medium: { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-600 dark:text-amber-400", fill: "bg-amber-500" },
    high: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-600 dark:text-orange-400", fill: "bg-orange-500" },
    critical: { bg: "bg-destructive/20", border: "border-destructive/50", text: "text-destructive", fill: "bg-destructive" },
  };
  
  const colors = riskColors[riskLevel];
  
  const missedCues = progress?.missedCues as Record<string, number> | undefined;
  const topVulnerabilities = missedCues 
    ? Object.entries(missedCues).sort((a, b) => b[1] - a[1]).slice(0, 4)
    : [];

  return (
    <Card className={`relative overflow-hidden border-2 ${colors.border} bg-card/70`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          {t("dashboard.riskMeter.title")}
        </CardTitle>
        <CardDescription>{t("dashboard.riskMeter.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center relative`}>
            {riskLevel === "low" && <ShieldCheck className={`w-10 h-10 ${colors.text}`} />}
            {riskLevel === "medium" && <Shield className={`w-10 h-10 ${colors.text}`} />}
            {riskLevel === "high" && <ShieldOff className={`w-10 h-10 ${colors.text}`} />}
            {riskLevel === "critical" && <ShieldX className={`w-10 h-10 ${colors.text}`} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={colors.text} data-testid="badge-risk-level">
                {t(`dashboard.riskMeter.${riskLevel}Risk`)}
              </Badge>
              {totalDecisions > 0 && (
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.riskMeter.score", { score: riskScore })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{riskMessage}</p>
          </div>
        </div>
        
        <div className="relative">
          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="flex-1 bg-chart-2/30" />
            <div className="flex-1 bg-amber-500/30" />
            <div className="flex-1 bg-orange-500/30" />
            <div className="flex-1 bg-destructive/30" />
          </div>
          <div 
            className="absolute top-0 left-0 h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, riskScore)}%`,
              background: riskScore <= 10 ? 'hsl(var(--chart-2))' : 
                         riskScore <= 30 ? 'hsl(45, 93%, 47%)' :
                         riskScore <= 50 ? 'hsl(25, 95%, 53%)' : 
                         'hsl(var(--destructive))'
            }} 
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-5 rounded bg-foreground/80 border-2 border-background shadow-sm transition-all duration-300"
            style={{ left: `calc(${Math.min(100, riskScore)}% - 6px)` }}
          />
        </div>
        <div className="flex text-xs text-muted-foreground mt-1">
          <span className="flex-1 text-left">{t("dashboard.riskMeter.low")}</span>
          <span className="flex-1 text-center">{t("dashboard.riskMeter.medium")}</span>
          <span className="flex-1 text-center">{t("dashboard.riskMeter.high")}</span>
          <span className="flex-1 text-right">{t("dashboard.riskMeter.critical")}</span>
        </div>
        
        {topVulnerabilities.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2">{t("dashboard.riskMeter.topVulnerabilities")}</p>
            <div className="grid grid-cols-2 gap-2">
              {topVulnerabilities.map(([cue, count]) => (
                <div key={cue} className="flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg border border-black/5 dark:border-white/10 bg-background/60">
                  <span className="truncate flex-1 min-w-0">{t(cue)}</span>
                  <Badge variant="secondary" className="flex-shrink-0">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BadgeCard({ 
  badgeId, 
  earned,
  progress: badgeProgress 
}: { 
  badgeId: string; 
  earned: boolean;
  progress?: number;
}) {
  const { t } = useTranslation();
  const badge = BADGES[badgeId as keyof typeof BADGES];
  if (!badge) return null;

  const icons: Record<string, React.ElementType> = {
    Search: Search,
    CheckCircle: CheckCircle,
    Shield: Shield,
    Clock: Clock,
    Flame: Flame,
    Star: Star,
  };
  const Icon = icons[badge.icon] || Shield;

  return (
    <div 
      className={`p-4 rounded-2xl border border-black/5 dark:border-white/10 ${earned ? 'bg-card/70' : 'bg-background/60'} flex flex-col gap-3 transition hover:-translate-y-0.5`}
      data-testid={`card-badge-${badgeId}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${earned ? '' : 'text-muted-foreground'}`}>
            {t(`dashboard.badges.items.${badgeId}.name`)}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{t(`dashboard.badges.items.${badgeId}.description`)}</p>
        </div>
      </div>
      {!earned && badgeProgress !== undefined && (
        <div className="space-y-1">
          <Progress value={(badgeProgress / badge.requirement) * 100} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-right">
            {badgeProgress} / {badge.requirement}
          </p>
        </div>
      )}
    </div>
  );
}

function IncidentResponseCard() {
  const { t } = useTranslation();

  return (
    <Card className="border-2 border-destructive/20 bg-card/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-destructive" />
          {t("dashboard.incidentResponse.title")}
        </CardTitle>
        <CardDescription>
          {t("dashboard.incidentResponse.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("dashboard.incidentResponse.description")}
        </p>
        <Link href="/recover">
          <Button variant="outline" className="w-full" data-testid="link-recover-drill">
            <LifeBuoy className="w-4 h-4 mr-2" />
            {t("dashboard.incidentResponse.button")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function Dashboard({ 
  progress, 
  isLoading, 
  onStartShift,
  assignments = [],
  completions = [],
  onStartAssignment
}: DashboardProps) {
  const { t, i18n } = useTranslation();

  const accuracy = progress && progress.totalDecisions > 0 
    ? Math.round((progress.correctDecisions / progress.totalDecisions) * 100) 
    : 0;

  // Detection rate: correctly handled malicious messages / total malicious seen
  // "Correctly handled" = any action except proceed (report, delete, verify are all safe)
  const detectionRate = progress && progress.totalMaliciousSeen > 0
    ? Math.round((progress.correctMaliciousHandling / progress.totalMaliciousSeen) * 100)
    : 0;

  // Report accuracy: correct reports (reported malicious) / total reports made
  const reportAccuracy = progress && progress.totalReports > 0
    ? Math.round((progress.correctReports / progress.totalReports) * 100)
    : 0;

  // False positive rate: FP / (FP + correctly handled legitimate)
  // This is the standard FPR formula: FP / (FP + TN)
  const falsePositives = progress?.falsePositives || 0;
  const correctLegit = progress?.correctLegitimateHandling || 0;
  const falsePositiveRate = (falsePositives + correctLegit) > 0
    ? Math.round(falsePositives / (falsePositives + correctLegit) * 100)
    : 0;

  // Dual Scores: Security Score + Operations Score
  // Security Score: How well you detect and handle threats (weighted: detection is critical)
  // Operations Score: How well you avoid blocking legitimate work (weighted: discrimination matters)
  const securityScore = progress && progress.totalMaliciousSeen > 0
    ? Math.round((progress.correctMaliciousHandling / progress.totalMaliciousSeen) * 100)
    : 0;
  
  const operationsScore = progress && progress.totalLegitimateSeen > 0
    ? Math.round((progress.correctLegitimateHandling / progress.totalLegitimateSeen) * 100)
    : 0;

  const missedCuesEntries = progress?.missedCues 
    ? Object.entries(progress.missedCues as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  const completionMap = new Map(completions.map(c => [c.assignmentId, c]));

  const getAssignmentTitle = (assignment: Assignment) => {
    if (assignment.i18nKey) {
      return t(`assignments.${assignment.i18nKey}.title`);
    }
    if (i18n.language === "en") {
      return assignment.title;
    }
    return t("assignments.fallbackTitle");
  };

  const getAssignmentDescription = (assignment: Assignment) => {
    if (assignment.i18nKey) {
      return t(`assignments.${assignment.i18nKey}.description`);
    }
    if (i18n.language === "en") {
      return assignment.description || "";
    }
    return t("assignments.fallbackDescription");
  };

  const badgeCounts = (progress?.badgeCounts as Record<string, number> | undefined) || {};
  const streakProgress = Math.max(progress?.longestStreak || 0, progress?.currentStreak || 0);
  const badgeProgressMap: Record<string, number | undefined> = {
    domain_detective: badgeCounts.domain_detective || 0,
    verification_pro: badgeCounts.verification_pro || 0,
    bec_blocker: badgeCounts.bec_blocker || 0,
    urgency_immune: badgeCounts.urgency_immune || 0,
    streak_master: streakProgress,
    perfect_shift: progress?.earnedBadges?.includes("perfect_shift") ? 1 : 0,
  };
  const isFirstSession = (progress?.totalShifts || 0) === 0;
  const primaryActionLabel = isFirstSession
    ? t("dashboard.firstSession.primaryCta")
    : t("dashboard.startShift");

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <Card className="border border-sky-500/40 bg-sky-500/10">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-sky-600 dark:text-sky-400">{t("dashboard.sessionOnly.title")}</p>
              <p className="text-sm text-muted-foreground">{t("dashboard.sessionOnly.subtitle")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Button size="lg" onClick={onStartShift} data-testid="button-start-shift">
            <PlayCircle className="w-5 h-5 mr-2" />
            {primaryActionLabel}
          </Button>
          {isFirstSession && (
            <p className="max-w-xs text-xs text-muted-foreground sm:text-right">
              {t("dashboard.firstSession.ctaHint")}
            </p>
          )}
        </div>
      </div>

      {isFirstSession && (
        <Card className="border border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t("dashboard.firstSession.title")}
            </CardTitle>
            <CardDescription>{t("dashboard.firstSession.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="rounded-2xl border border-black/5 dark:border-white/10 bg-background/70 p-3"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t("dashboard.firstSession.stepLabel", { step })}
                  </p>
                  <p className="text-sm font-medium mt-1">{t(`dashboard.firstSession.steps.step${step}.title`)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(`dashboard.firstSession.steps.step${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.firstSession.note")}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border border-black/5 dark:border-white/10 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("dashboard.trainingTracks.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.trainingTracks.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("dashboard.trainingTracks.empty")}
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const completion = completionMap.get(assignment.id);
                const description = getAssignmentDescription(assignment);
                const statusLabel = completion
                  ? completion.passed ? t("dashboard.trainingTracks.status.passed") : t("dashboard.trainingTracks.status.completed")
                  : t("dashboard.trainingTracks.status.notStarted");
                const statusVariant = completion
                  ? completion.passed ? "default" : "secondary"
                  : "outline";
                const actionLabel = completion
                  ? completion.passed ? t("dashboard.trainingTracks.action.retake") : t("dashboard.trainingTracks.action.retry")
                  : t("dashboard.trainingTracks.action.start");

                return (
                  <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{getAssignmentTitle(assignment)}</span>
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      {description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span>{t("dashboard.trainingTracks.scenarioCount", { count: assignment.scenarioIds.length })}</span>
                        <span>{t("dashboard.trainingTracks.passingScore", { score: assignment.passingScore ?? 70 })}</span>
                      </div>
                      {completion && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {completion.passed
                            ? t("dashboard.trainingTracks.lastScorePassed", { score: completion.score ?? 0 })
                            : t("dashboard.trainingTracks.lastScoreNeedsRetry", { score: completion.score ?? 0 })}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => onStartAssignment?.(assignment.id)}
                      disabled={!onStartAssignment}
                      data-testid={`button-start-assignment-${assignment.id}`}
                    >
                      {actionLabel}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {!isFirstSession && (
        <>
          {/* Dual Score Display - Security vs Operations Balance */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-2 border-chart-2/30 bg-card/60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-chart-2/20 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-chart-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{t("dashboard.securityScore.title")}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold" data-testid="text-security-score">{securityScore}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("dashboard.securityScore.stopped", {
                        correct: progress?.correctMaliciousHandling || 0,
                        total: progress?.totalMaliciousSeen || 0
                      })}
                    </p>
                  </div>
                </div>
                <Progress value={securityScore} className="h-2 mt-4" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t("dashboard.securityScore.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-chart-3/30 bg-card/60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-chart-3" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{t("dashboard.operationsScore.title")}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold" data-testid="text-operations-score">{operationsScore}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("dashboard.operationsScore.processed", {
                        correct: progress?.correctLegitimateHandling || 0,
                        total: progress?.totalLegitimateSeen || 0
                      })}
                    </p>
                  </div>
                </div>
                <Progress value={operationsScore} className="h-2 mt-4" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t("dashboard.operationsScore.description")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("dashboard.stats.detectionRate")}
              value={`${detectionRate}%`}
              subtitle={t("dashboard.stats.detectionRateSubtitle", {
                correct: progress?.correctMaliciousHandling || 0,
                total: progress?.totalMaliciousSeen || 0
              })}
              icon={ShieldAlert}
              color="bg-chart-2"
              testId="detection-rate"
            />
            <StatCard
              title={t("dashboard.stats.reportAccuracy")}
              value={`${reportAccuracy}%`}
              subtitle={t("dashboard.stats.reportAccuracySubtitle", {
                total: progress?.totalReports || 0
              })}
              icon={Flag}
              color="bg-primary"
              testId="report-accuracy"
            />
            <StatCard
              title={t("dashboard.stats.falsePositiveRate")}
              value={`${falsePositiveRate}%`}
              subtitle={t("dashboard.stats.falsePositiveRateSubtitle", {
                count: progress?.falsePositives || 0
              })}
              icon={AlertTriangle}
              color="bg-chart-4"
              testId="false-positive-rate"
            />
            <StatCard
              title={t("dashboard.stats.currentStreak")}
              value={progress?.currentStreak || 0}
              subtitle={t("dashboard.stats.bestStreak", {
                count: progress?.longestStreak || 0
              })}
              icon={Flame}
              color="bg-chart-5"
              testId="current-streak"
            />
          </div>

          <Card className="border border-black/5 dark:border-white/10 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {t("dashboard.metrics.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.metrics.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t("dashboard.metrics.overallAccuracy")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-accuracy">{accuracy}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.metrics.correctDecisions", { count: progress?.correctDecisions || 0 })}
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t("dashboard.metrics.unsafeActions")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-unsafe-actions">{progress?.unsafeActions || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.metrics.threatsAllowed")}</p>
                </div>
                <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t("dashboard.metrics.compromised")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-compromised">{progress?.compromised || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.metrics.securityBreaches")}</p>
                </div>
                <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t("dashboard.metrics.highConfidenceErrors")}</span>
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-high-confidence-wrong">{progress?.highConfidenceWrong || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.metrics.wrongWithConfidence")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border border-black/5 dark:border-white/10 bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t("dashboard.badges.title")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.badges.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.keys(BADGES).map((badgeId) => (
                    <BadgeCard
                      key={badgeId}
                      badgeId={badgeId}
                      earned={progress?.earnedBadges?.includes(badgeId) || false}
                      progress={badgeProgressMap[badgeId]}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-black/5 dark:border-white/10 bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t("dashboard.areasToImprove.title")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.areasToImprove.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {missedCuesEntries.length > 0 ? (
                  <div className="space-y-3">
                    {missedCuesEntries.map(([cue, count]) => (
                      <div key={cue} className="flex items-center justify-between gap-3">
                        <span className="text-sm truncate flex-1 min-w-0">{t(cue)}</span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t("dashboard.areasToImprove.noData")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <RiskMeter progress={progress} />
        </>
      )}

      {isFirstSession ? (
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="border border-black/5 dark:border-white/10 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-chart-2" />
                {t("dashboard.firstSession.afterShiftTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.firstSession.afterShiftDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t("dashboard.firstSession.afterShiftPoint1")}</p>
              <p>{t("dashboard.firstSession.afterShiftPoint2")}</p>
              <p>{t("dashboard.firstSession.afterShiftPoint3")}</p>
            </CardContent>
          </Card>
          <IncidentResponseCard />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="border border-black/5 dark:border-white/10 bg-card/60">
            <CardHeader>
              <CardTitle>{t("dashboard.trainingSummary.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="text-2xl font-bold text-primary">{progress?.totalShifts || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t("dashboard.trainingSummary.shifts")}</p>
                </div>
                <div className="text-center p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="text-2xl font-bold text-chart-2">{progress?.totalDecisions || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t("dashboard.trainingSummary.messages")}</p>
                </div>
                <div className="text-center p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
                  <div className="text-2xl font-bold text-chart-3">{progress?.totalScore || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t("dashboard.trainingSummary.points")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <IncidentResponseCard />
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
