import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Clock,
  ArrowLeft,
  Search,
  Plus,
  FileText,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Phone,
  Download,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Hash
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate, formatDateTime, formatWeekday, formatDateISO } from "@/lib/formatting";
import type { Assignment, Scenario } from "@shared/schema";

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

function AnalyticsTab({ analytics, learners, isLoading }: { 
  analytics: CohortAnalytics | undefined; 
  learners: LearnerSummary[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                    {formatWeekday(day.date)}
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
                          ? formatDate(learner.lastPlayedAt, "medium")
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
    </div>
  );
}

function AssignmentsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scenarioIds: [] as string[],
    difficultyMin: 1,
    difficultyMax: 5,
    targetChannels: [] as string[],
    targetAttackFamilies: [] as string[],
    passingScore: 70,
    verificationBudget: 3,
    isPublished: false,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/instructor/assignments"],
  });

  const { data: scenarios } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/instructor/assignments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/assignments"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return apiRequest("PATCH", `/api/instructor/assignments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/assignments"] });
      setEditingAssignment(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/instructor/assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/assignments"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scenarioIds: [],
      difficultyMin: 1,
      difficultyMax: 5,
      targetChannels: [],
      targetAttackFamilies: [],
      passingScore: 70,
      verificationBudget: 3,
      isPublished: false,
    });
  };

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      scenarioIds: assignment.scenarioIds || [],
      difficultyMin: assignment.difficultyMin || 1,
      difficultyMax: assignment.difficultyMax || 5,
      targetChannels: assignment.targetChannels || [],
      targetAttackFamilies: assignment.targetAttackFamilies || [],
      passingScore: assignment.passingScore || 70,
      verificationBudget: assignment.verificationBudget || 3,
      isPublished: assignment.isPublished || false,
    });
  };

  const handleSubmit = () => {
    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleScenario = (scenarioId: string) => {
    setFormData(prev => ({
      ...prev,
      scenarioIds: prev.scenarioIds.includes(scenarioId)
        ? prev.scenarioIds.filter(id => id !== scenarioId)
        : [...prev.scenarioIds, scenarioId]
    }));
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      targetChannels: prev.targetChannels.includes(channel)
        ? prev.targetChannels.filter(c => c !== channel)
        : [...prev.targetChannels, channel]
    }));
  };

  const toggleAttackFamily = (family: string) => {
    setFormData(prev => ({
      ...prev,
      targetAttackFamilies: prev.targetAttackFamilies.includes(family)
        ? prev.targetAttackFamilies.filter(f => f !== family)
        : [...prev.targetAttackFamilies, family]
    }));
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="w-4 h-4" />;
      case "sms": return <MessageSquare className="w-4 h-4" />;
      case "call": return <Phone className="w-4 h-4" />;
      case "teams": return <Users className="w-4 h-4" />;
      case "slack": return <Hash className="w-4 h-4" />;
      default: return null;
    }
  };

  const channels = ["email", "sms", "call", "teams", "slack"];
  const attackFamilies = ["phishing", "bec", "spoofing", "smishing", "vishing", "qr_phishing", "oauth_phishing"];

  const filteredScenarios = scenarios?.filter(s => {
    const difficultyMatch = s.difficultyScore >= formData.difficultyMin && s.difficultyScore <= formData.difficultyMax;
    const channelMatch = formData.targetChannels.length === 0 || formData.targetChannels.includes(s.channel);
    const familyMatch = formData.targetAttackFamilies.length === 0 || 
      (s.attackFamily && formData.targetAttackFamilies.includes(s.attackFamily));
    return difficultyMatch && channelMatch && familyMatch;
  }) || [];

  if (assignmentsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Training Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Create custom training modules for your learners
          </p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingAssignment} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingAssignment(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-assignment">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
              </DialogTitle>
              <DialogDescription>
                Build a custom training module with specific scenarios and difficulty targeting
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., BEC Attack Recognition"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-assignment-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the learning objectives..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    data-testid="input-assignment-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Range: {formData.difficultyMin} - {formData.difficultyMax}</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Easy</span>
                    <Slider
                      value={[formData.difficultyMin, formData.difficultyMax]}
                      onValueChange={([min, max]) => setFormData(prev => ({ 
                        ...prev, 
                        difficultyMin: min, 
                        difficultyMax: max 
                      }))}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                      data-testid="slider-difficulty"
                    />
                    <span className="text-sm text-muted-foreground">Hard</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Channels</Label>
                  <div className="flex gap-2 flex-wrap">
                    {channels.map((channel) => (
                      <Button
                        key={channel}
                        variant={formData.targetChannels.includes(channel) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleChannel(channel)}
                        className="capitalize"
                        data-testid={`button-channel-${channel}`}
                      >
                        {getChannelIcon(channel)}
                        <span className="ml-2">{channel}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Attack Families</Label>
                  <div className="flex gap-2 flex-wrap">
                    {attackFamilies.map((family) => (
                      <Button
                        key={family}
                        variant={formData.targetAttackFamilies.includes(family) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAttackFamily(family)}
                        className="capitalize"
                        data-testid={`button-family-${family}`}
                      >
                        {family.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min={0}
                      max={100}
                      value={formData.passingScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                      data-testid="input-passing-score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verificationBudget">Verification Budget</Label>
                    <Input
                      id="verificationBudget"
                      type="number"
                      min={0}
                      max={10}
                      value={formData.verificationBudget}
                      onChange={(e) => setFormData(prev => ({ ...prev, verificationBudget: parseInt(e.target.value) || 3 }))}
                      data-testid="input-verification-budget"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Scenarios ({formData.scenarioIds.length} selected)</Label>
                    <span className="text-sm text-muted-foreground">
                      {filteredScenarios.length} matching scenarios
                    </span>
                  </div>
                  <ScrollArea className="h-48 border rounded-md p-2">
                    <div className="space-y-2">
                      {filteredScenarios.map((scenario) => (
                        <div
                          key={scenario.id}
                          className="flex items-start gap-3 p-2 rounded-md hover-elevate"
                        >
                          <Checkbox
                            id={scenario.id}
                            checked={formData.scenarioIds.includes(scenario.id)}
                            onCheckedChange={() => toggleScenario(scenario.id)}
                            data-testid={`checkbox-scenario-${scenario.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={scenario.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {scenario.subject || scenario.senderName}
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {scenario.channel}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Difficulty: {scenario.difficultyScore}
                              </Badge>
                              {scenario.attackFamily && (
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {scenario.attackFamily.replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredScenarios.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No scenarios match your filters
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked as boolean }))}
                    data-testid="checkbox-published"
                  />
                  <label
                    htmlFor="isPublished"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Publish assignment (make visible to learners)
                  </label>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingAssignment(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.title || formData.scenarioIds.length === 0 || createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-assignment"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingAssignment ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} data-testid={`card-assignment-${assignment.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    {assignment.isPublished ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </Badge>
                    )}
                  </div>
                  {assignment.description && (
                    <CardDescription className="mt-1">
                      {assignment.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(assignment)}
                    data-testid={`button-edit-${assignment.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(assignment.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${assignment.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {assignment.scenarioIds?.length || 0} scenarios
                  </span>
                  <span>
                    Difficulty: {assignment.difficultyMin}-{assignment.difficultyMax}
                  </span>
                  <span>
                    Passing: {assignment.passingScore}%
                  </span>
                  <span>
                    Verifications: {assignment.verificationBudget}
                  </span>
                  <span className="text-xs">
                    Created {formatDate(assignment.createdAt, "medium")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No assignments yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mt-2">
              Create your first assignment to build a custom training module for your learners.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface DebriefItem {
  scenarioId: string;
  channel: string;
  attackFamily: string | null;
  subject: string | null;
  senderName: string;
  correctAction: string;
  explanation: string;
  cues: string[];
  difficultyScore: number;
  totalAttempts: number;
  errorRate: number;
  compromiseRate: number;
  falsePositiveRate: number;
  frequentlyMissedCues: string[];
}

interface DebriefPack {
  generatedAt: string;
  totalScenarios: number;
  items: DebriefItem[];
}

function DebriefTab() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const { data: debriefPack, isLoading } = useQuery<DebriefPack>({
    queryKey: ["/api/instructor/debrief-pack"],
  });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadDebrief = () => {
    if (!debriefPack) return;
    
    const content = debriefPack.items.map((item, index) => {
      return `
## ${index + 1}. ${item.subject || item.senderName}

**Channel:** ${item.channel}
**Attack Type:** ${item.attackFamily?.replace(/_/g, " ") || "N/A"}
**Difficulty:** ${item.difficultyScore}/5
**Error Rate:** ${item.errorRate}%

### Phishing Cues to Discuss
${item.cues.map(cue => `- ${cue}`).join("\n")}

### Frequently Missed Cues
${item.frequentlyMissedCues.map(cue => `- ${cue}`).join("\n") || "None recorded"}

### Correct Action: ${item.correctAction.toUpperCase()}

### Why This Matters
${item.explanation}

### Training Statistics
- Total Attempts: ${item.totalAttempts}
- Compromise Rate: ${item.compromiseRate}%
- False Positive Rate: ${item.falsePositiveRate}%

---
`;
    }).join("\n");
    
    const header = `# Phishing Training Debrief Pack
Generated: ${formatDateTime(debriefPack.generatedAt, "long", "short")}
Total Teachable Moments: ${debriefPack.totalScenarios}

---
`;
    
    const blob = new Blob([header + content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debrief-pack-${formatDateISO()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Debrief Pack Generator</h2>
          <p className="text-sm text-muted-foreground">
            Anonymized teachable moments based on common mistakes for classroom discussion
          </p>
        </div>
        <Button 
          onClick={downloadDebrief}
          disabled={!debriefPack || debriefPack.items.length === 0}
          data-testid="button-download-debrief"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Pack
        </Button>
      </div>

      {debriefPack && debriefPack.items.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>
              {debriefPack.totalScenarios} scenarios with high error rates
              {" | "}
              Generated {formatDate(debriefPack.generatedAt, "medium")}
            </span>
          </div>
          
          {debriefPack.items.map((item, index) => (
            <Card key={item.scenarioId} data-testid={`card-debrief-${item.scenarioId}`}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleExpand(item.scenarioId)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <CardTitle className="text-base">
                        {item.subject || item.senderName}
                      </CardTitle>
                      <Badge variant="destructive" className="shrink-0">
                        {item.errorRate}% error rate
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {item.channel}
                      </Badge>
                      {item.attackFamily && (
                        <Badge variant="secondary" className="capitalize">
                          {item.attackFamily.replace(/_/g, " ")}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Difficulty: {item.difficultyScore}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.totalAttempts} attempts
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    {expandedItems.has(item.scenarioId) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedItems.has(item.scenarioId) && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Correct Action</p>
                      <Badge variant="default" className="uppercase">
                        {item.correctAction}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Compromise Rate</p>
                      <p className="text-lg font-bold text-destructive">
                        {item.compromiseRate}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">False Positive Rate</p>
                      <p className="text-lg font-bold text-muted-foreground">
                        {item.falsePositiveRate}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Phishing Cues to Discuss</p>
                    <div className="flex flex-wrap gap-2">
                      {item.cues.map((cue, i) => (
                        <Badge key={i} variant="outline">
                          {cue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {item.frequentlyMissedCues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-destructive">
                        Frequently Missed Cues
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.frequentlyMissedCues.map((cue, i) => (
                          <Badge key={i} variant="destructive">
                            {cue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Teaching Point</p>
                    <p className="text-sm text-muted-foreground">
                      {item.explanation}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Not enough data yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mt-2">
              The debrief pack requires at least 3 attempts per scenario to generate meaningful insights.
              Once your learners complete more training, teachable moments will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-instructor-title">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor cohort performance and create training assignments
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">
            <FileText className="w-4 h-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="debrief" data-testid="tab-debrief">
            <BookOpen className="w-4 h-4 mr-2" />
            Debrief
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsTab 
            analytics={analytics} 
            learners={learners} 
            isLoading={analyticsLoading || learnersLoading} 
          />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentsTab />
        </TabsContent>

        <TabsContent value="debrief">
          <DebriefTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
