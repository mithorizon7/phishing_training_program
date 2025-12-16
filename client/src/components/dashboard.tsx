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
  Star
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Accuracy"
          value={`${accuracy}%`}
          subtitle={`${progress?.correctDecisions || 0} correct decisions`}
          icon={Target}
          color="bg-chart-2"
        />
        <StatCard
          title="Safe Decisions"
          value={progress?.correctDecisions || 0}
          subtitle="Messages handled correctly"
          icon={Shield}
          color="bg-primary"
        />
        <StatCard
          title="False Positives"
          value={progress?.falsePositives || 0}
          subtitle="Legitimate messages reported"
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

      <Card>
        <CardHeader>
          <CardTitle>Training Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold text-primary">{progress?.totalShifts || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">Shifts Completed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold text-chart-2">{progress?.totalDecisions || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">Messages Processed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold text-chart-3">{progress?.totalScore || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Points</p>
            </div>
          </div>
        </CardContent>
      </Card>
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
