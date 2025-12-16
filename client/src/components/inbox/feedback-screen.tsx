import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Lightbulb,
  Target
} from "lucide-react";
import type { Scenario, ActionType, OutcomeType } from "@shared/schema";

interface FeedbackScreenProps {
  scenario: Scenario;
  userAction: ActionType;
  outcome: OutcomeType;
  pointsEarned: number;
  onContinue: () => void;
}

function getOutcomeConfig(outcome: OutcomeType) {
  switch (outcome) {
    case "safe":
      return {
        icon: CheckCircle,
        label: "Safe Decision",
        bgClass: "bg-chart-2/10",
        textClass: "text-chart-2",
        borderClass: "border-chart-2/30",
      };
    case "compromised":
      return {
        icon: XCircle,
        label: "Compromised",
        bgClass: "bg-destructive/10",
        textClass: "text-destructive",
        borderClass: "border-destructive/30",
      };
    case "delayed_work":
      return {
        icon: Clock,
        label: "Work Delayed",
        bgClass: "bg-chart-4/10",
        textClass: "text-chart-4",
        borderClass: "border-chart-4/30",
      };
    case "false_alarm":
      return {
        icon: AlertTriangle,
        label: "False Alarm",
        bgClass: "bg-chart-4/10",
        textClass: "text-chart-4",
        borderClass: "border-chart-4/30",
      };
  }
}

function getActionLabel(action: ActionType): string {
  switch (action) {
    case "report": return "Reported";
    case "delete": return "Deleted";
    case "verify": return "Verified";
    case "proceed": return "Proceeded";
  }
}

function highlightCues(text: string, cues: string[]): React.ReactNode {
  if (!cues.length) return text;
  
  let result = text;
  const highlighted: string[] = [];
  
  cues.forEach((cue, index) => {
    const marker = `[[CUE_${index}]]`;
    if (text.toLowerCase().includes(cue.toLowerCase())) {
      const regex = new RegExp(`(${cue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, marker);
      highlighted.push(cue);
    }
  });
  
  const parts = result.split(/(\[\[CUE_\d+\]\])/g);
  
  return parts.map((part, i) => {
    const match = part.match(/\[\[CUE_(\d+)\]\]/);
    if (match) {
      const cueIndex = parseInt(match[1]);
      return (
        <mark 
          key={i} 
          className="bg-chart-4/30 text-foreground px-1 rounded"
          title={`Suspicious cue: ${highlighted[cueIndex] || cues[cueIndex]}`}
        >
          {highlighted[cueIndex] || cues[cueIndex]}
        </mark>
      );
    }
    return part;
  });
}

export function FeedbackScreen({
  scenario,
  userAction,
  outcome,
  pointsEarned,
  onContinue,
}: FeedbackScreenProps) {
  const outcomeConfig = getOutcomeConfig(outcome);
  const Icon = outcomeConfig.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-2xl">
          <div className={`p-4 ${outcomeConfig.bgClass} border-b ${outcomeConfig.borderClass}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${outcomeConfig.bgClass} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${outcomeConfig.textClass}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${outcomeConfig.textClass}`} data-testid="text-outcome">
                  {outcomeConfig.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  You chose to {getActionLabel(userAction).toLowerCase()} this message
                </p>
              </div>
              <div className="ml-auto text-right">
                <div className={`text-2xl font-bold ${pointsEarned >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  {pointsEarned >= 0 ? '+' : ''}{pointsEarned}
                </div>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>

          <CardContent className="py-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                The Message (with highlighted cues)
              </h3>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{scenario.senderName}</span>
                    {scenario.senderEmail && (
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {scenario.senderEmail}
                      </code>
                    )}
                  </div>
                  {scenario.subject && (
                    <p className="text-sm text-muted-foreground">{scenario.subject}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {highlightCues(scenario.body, scenario.cues)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-chart-4" />
                Why This Matters
              </h3>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm leading-relaxed" data-testid="text-explanation">
                  {scenario.explanation}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Cues to Remember</h3>
              <div className="flex flex-wrap gap-2">
                {scenario.cues.map((cue, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cue}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Correct action was:</p>
                <Badge 
                  variant={userAction === scenario.correctAction ? "default" : "secondary"}
                  className="font-medium"
                >
                  {getActionLabel(scenario.correctAction as ActionType)}
                </Badge>
              </div>
              <Button onClick={onContinue} data-testid="button-continue">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
