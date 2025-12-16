import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Clock,
  ArrowLeft,
  Search
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

// Analytics types (matching server/storage.ts)
interface CohortAnalytics {
  totalLearners: number;
  activeLearners: number;
  totalDecisions: number;
  overallAccuracy: number;
  falsePositiveRate: number;
  compromiseRate: number;
  topMissedCues: Array<{ cue: string; count: number }>;
  mistakePatterns: Array<{ attackFamily: string; errorRate: number }>;
  recentActivity: Array<{
    date: string;
    decisions: number;
    accuracy: number;
  }>;
}

interface LearnerSummary {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  totalDecisions: number;
  accuracy: number;
  falsePositiveRate: number;
  lastPlayedAt: string | null;
}

export default function InstructorDashboard() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<{ role: string }>({
    queryKey: ["/api/user/me"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<CohortAnalytics>({
    queryKey: ["/api/instructor/analytics"],
    enabled: user?.role === "instructor",
  });

  const { data: learners, isLoading: learnersLoading } = useQuery<LearnerSummary[]>({
    queryKey: ["/api/instructor/learners"],
    enabled: user?.role === "instructor",
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/user/promote-instructor");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
    },
  });

  if (userLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (user?.role !== "instructor") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 gap-4">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">Instructor Access Required</h2>
          <p className="text-muted-foreground max-w-md">
            This dashboard is only available to instructors. If you are an instructor, 
            please contact an administrator to upgrade your account.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button onClick={() => promoteMutation.mutate()} disabled={promoteMutation.isPending}>
              {promoteMutation.isPending ? "Promoting..." : "Become Instructor (Demo)"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = analyticsLoading || learnersLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-instructor-title">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor cohort performance and identify training opportunities
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-learners">
                  {analytics?.totalLearners || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.activeLearners || 0} active in last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-overall-accuracy">
                  {analytics?.overallAccuracy.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {analytics?.totalDecisions || 0} total decisions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-false-positive-rate">
                  {analytics?.falsePositiveRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Legitimate messages reported as threats
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compromise Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="text-compromise-rate">
                  {analytics?.compromiseRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Phishing attempts that succeeded
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Top Missed Cues
                </CardTitle>
                <CardDescription>
                  The most commonly overlooked phishing indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.topMissedCues && analytics.topMissedCues.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topMissedCues.slice(0, 6).map((item, index) => (
                      <div key={item.cue} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-muted-foreground w-5">
                            {index + 1}.
                          </span>
                          <span className="text-sm truncate">{item.cue}</span>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {item.count} missed
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Mistake Patterns by Attack Type
                </CardTitle>
                <CardDescription>
                  Error rates across different attack families
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.mistakePatterns && analytics.mistakePatterns.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.mistakePatterns.map((pattern) => (
                      <div key={pattern.attackFamily} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium capitalize">
                            {pattern.attackFamily.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {pattern.errorRate.toFixed(1)}% error rate
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive/70 rounded-full transition-all"
                            style={{ width: `${Math.min(pattern.errorRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Training activity over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                <div className="grid grid-cols-7 gap-2">
                  {analytics.recentActivity.map((day) => (
                    <div key={day.date} className="text-center space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(day.date), "EEE")}
                      </div>
                      <div 
                        className="h-16 rounded-md flex items-end justify-center pb-1 transition-colors"
                        style={{
                          backgroundColor: day.decisions > 0 
                            ? `hsl(var(--primary) / ${Math.min(day.decisions / 20, 1)})`
                            : "hsl(var(--muted))"
                        }}
                      >
                        <span className="text-xs font-medium">
                          {day.decisions}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.accuracy.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Learner Overview
              </CardTitle>
              <CardDescription>
                Individual learner performance summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {learners && learners.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Learner</th>
                        <th className="text-center py-2 font-medium">Decisions</th>
                        <th className="text-center py-2 font-medium">Accuracy</th>
                        <th className="text-center py-2 font-medium">False Positives</th>
                        <th className="text-right py-2 font-medium">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learners.map((learner) => (
                        <tr key={learner.userId} className="border-b last:border-0">
                          <td className="py-3">
                            <div className="font-medium">
                              {learner.firstName || learner.lastName 
                                ? `${learner.firstName || ''} ${learner.lastName || ''}`.trim()
                                : 'Anonymous'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {learner.email || 'No email'}
                            </div>
                          </td>
                          <td className="text-center py-3">
                            {learner.totalDecisions}
                          </td>
                          <td className="text-center py-3">
                            <Badge 
                              variant={learner.accuracy >= 80 ? "default" : learner.accuracy >= 60 ? "secondary" : "destructive"}
                            >
                              {learner.accuracy.toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="text-center py-3">
                            {learner.falsePositiveRate.toFixed(1)}%
                          </td>
                          <td className="text-right py-3 text-muted-foreground">
                            {learner.lastPlayedAt 
                              ? format(new Date(learner.lastPlayedAt), "MMM d, yyyy")
                              : "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No learners yet</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
