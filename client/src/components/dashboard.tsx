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
  Briefcase,
  ShieldCheck,
  LifeBuoy,
  Gauge,
  ShieldX,
  ShieldOff
} from "lucide-react";
import type { UserProgress } from "@shared/schema";
import { BADGES } from "@shared/schema";
import { Link } from "wouter";

interface DashboardProps {
  progress: UserProgress | null;
  isLoading: boolean;
  onStartShift: () => void;
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-md ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RiskMeter({ progress }: { progress: UserProgress | null }) {
  const unsafeActions = progress?.unsafeActions || 0;
  const highConfWrong = progress?.highConfidenceWrong || 0;
  const totalDecisions = progress?.totalDecisions || 0;
  const totalMalicious = progress?.totalMaliciousSeen || 0;
  
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let riskScore = 0;
  let riskMessage = "Looking good! Keep practicing to maintain your skills.";
  
  if (totalDecisions > 0) {
    const unsafeRate = totalMalicious > 0 ? (unsafeActions / totalMalicious) * 100 : 0;
    const calibrationIssues = totalDecisions > 0 ? (highConfWrong / totalDecisions) * 100 : 0;
    
    riskScore = Math.min(100, Math.round(unsafeRate * 0.7 + calibrationIssues * 0.3));
    
    if (riskScore <= 10) {
      riskLevel = "low";
      riskMessage = "Excellent threat awareness. You're catching attacks effectively.";
    } else if (riskScore <= 30) {
      riskLevel = "medium";
      riskMessage = "Some areas need attention. Focus on the patterns you're missing.";
    } else if (riskScore <= 50) {
      riskLevel = "high";
      riskMessage = "Higher vulnerability detected. Review the attack patterns below.";
    } else {
      riskLevel = "critical";
      riskMessage = "Critical: You're allowing too many threats through. Focus training needed.";
    }
  } else {
    riskMessage = "Complete some training to see your risk profile.";
  }
  
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
    <Card className={`border-2 ${colors.border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Risk Meter
        </CardTitle>
        <CardDescription>Your vulnerability profile based on training performance</CardDescription>
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
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
              </Badge>
              {totalDecisions > 0 && (
                <span className="text-sm text-muted-foreground">Score: {riskScore}/100</span>
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
          <span className="flex-1 text-left">Low</span>
          <span className="flex-1 text-center">Medium</span>
          <span className="flex-1 text-center">High</span>
          <span className="flex-1 text-right">Critical</span>
        </div>
        
        {topVulnerabilities.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2">Top Vulnerabilities (missed cues)</p>
            <div className="grid grid-cols-2 gap-2">
              {topVulnerabilities.map(([cue, count]) => (
                <div key={cue} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                  <span className="truncate">{cue}</span>
                  <Badge variant="secondary">{count}</Badge>
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
      className={`p-4 rounded-lg border ${earned ? 'bg-card' : 'bg-muted/30'} flex flex-col gap-3`}
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
            {badge.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
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

export function Dashboard({ progress, isLoading, onStartShift }: DashboardProps) {
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
    : 100; // Perfect if no threats seen yet
  
  const operationsScore = progress && progress.totalLegitimateSeen > 0
    ? Math.round((progress.correctLegitimateHandling / progress.totalLegitimateSeen) * 100)
    : 100; // Perfect if no legitimate seen yet

  const missedCuesEntries = progress?.missedCues 
    ? Object.entries(progress.missedCues as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and start training</p>
        </div>
        <Button size="lg" onClick={onStartShift} data-testid="button-start-shift">
          <PlayCircle className="w-5 h-5 mr-2" />
          Start New Shift
        </Button>
      </div>

      {/* Dual Score Display - Security vs Operations Balance */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="border-2 border-chart-2/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-chart-2/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-chart-2" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Security Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" data-testid="text-security-score">{securityScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Stopped {progress?.correctMaliciousHandling || 0} of {progress?.totalMaliciousSeen || 0} threats
                </p>
              </div>
            </div>
            <Progress value={securityScore} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Measures your ability to detect and block malicious content
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-chart-3/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-chart-3" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Operations Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" data-testid="text-operations-score">{operationsScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Processed {progress?.correctLegitimateHandling || 0} of {progress?.totalLegitimateSeen || 0} legitimate correctly
                </p>
              </div>
            </div>
            <Progress value={operationsScore} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Measures your ability to keep legitimate work flowing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Detection Rate"
          value={`${detectionRate}%`}
          subtitle={`${progress?.correctMaliciousHandling || 0} of ${progress?.totalMaliciousSeen || 0} threats handled safely`}
          icon={ShieldAlert}
          color="bg-chart-2"
        />
        <StatCard
          title="Report Accuracy"
          value={`${reportAccuracy}%`}
          subtitle={`${progress?.totalReports || 0} total reports made`}
          icon={Flag}
          color="bg-primary"
        />
        <StatCard
          title="False Positive Rate"
          value={`${falsePositiveRate}%`}
          subtitle={`${progress?.falsePositives || 0} legitimate reported`}
          icon={AlertTriangle}
          color="bg-chart-4"
        />
        <StatCard
          title="Current Streak"
          value={progress?.currentStreak || 0}
          subtitle={`Best: ${progress?.longestStreak || 0}`}
          icon={Flame}
          color="bg-chart-5"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Key Performance Metrics
          </CardTitle>
          <CardDescription>
            Balance security vigilance with operational efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Overall Accuracy</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-accuracy">{accuracy}%</div>
              <p className="text-xs text-muted-foreground">{progress?.correctDecisions || 0} correct decisions</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Unsafe Actions</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-unsafe-actions">{progress?.unsafeActions || 0}</div>
              <p className="text-xs text-muted-foreground">Threats allowed through</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Compromised</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-compromised">{progress?.compromised || 0}</div>
              <p className="text-xs text-muted-foreground">Security breaches</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">High-Confidence Errors</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-high-confidence-wrong">{progress?.highConfidenceWrong || 0}</div>
              <p className="text-xs text-muted-foreground">Wrong with 85%+ confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Skill Badges
            </CardTitle>
            <CardDescription>
              Earn badges by demonstrating security awareness skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.keys(BADGES).map((badgeId) => (
                <BadgeCard
                  key={badgeId}
                  badgeId={badgeId}
                  earned={progress?.earnedBadges?.includes(badgeId) || false}
                  progress={0}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Areas to Improve
            </CardTitle>
            <CardDescription>
              Most frequently missed cues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {missedCuesEntries.length > 0 ? (
              <div className="space-y-3">
                {missedCuesEntries.map(([cue, count]) => (
                  <div key={cue} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{cue}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Complete some training shifts to see your improvement areas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RiskMeter progress={progress} />

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{progress?.totalShifts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Shifts</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-chart-2">{progress?.totalDecisions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Messages</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-chart-3">{progress?.totalScore || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-destructive" />
              Incident Response Training
            </CardTitle>
            <CardDescription>
              Learn what to do when something goes wrong
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Even experts make mistakes. Practice the critical steps for reporting and recovering from security incidents.
            </p>
            <Link href="/recover">
              <Button variant="outline" className="w-full" data-testid="link-recover-drill">
                <LifeBuoy className="w-4 h-4 mr-2" />
                Start Recovery Drill
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
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
