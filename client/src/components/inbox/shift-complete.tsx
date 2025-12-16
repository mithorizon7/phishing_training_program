import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  AlertTriangle, 
  Shield,
  Flame,
  Home,
  RotateCcw
} from "lucide-react";
import type { Shift } from "@shared/schema";

interface ShiftCompleteProps {
  shift: Shift;
  onGoHome: () => void;
  onPlayAgain: () => void;
}

export function ShiftComplete({ shift, onGoHome, onPlayAgain }: ShiftCompleteProps) {
  const totalMessages = shift.scenarioIds.length;
  const accuracy = totalMessages > 0 
    ? Math.round((shift.correctDecisions / totalMessages) * 100) 
    : 0;
  
  const isPerfect = shift.correctDecisions === totalMessages && shift.compromised === 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center pb-2">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isPerfect ? 'bg-chart-2/20' : accuracy >= 70 ? 'bg-primary/20' : 'bg-chart-4/20'
            }`}>
              <Trophy className={`w-10 h-10 ${
                isPerfect ? 'text-chart-2' : accuracy >= 70 ? 'text-primary' : 'text-chart-4'
              }`} />
            </div>
            <CardTitle className="text-2xl">Shift Complete!</CardTitle>
            {isPerfect && (
              <Badge className="mt-2 bg-chart-2 text-white">Perfect Shift!</Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2" data-testid="text-final-score">
                {shift.score}
              </div>
              <p className="text-muted-foreground">Total Points</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accuracy</span>
                <span className="font-semibold">{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-chart-2" />
                  <span className="text-2xl font-bold text-chart-2">
                    {shift.correctDecisions}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Correct Decisions</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-chart-4" />
                  <span className="text-2xl font-bold text-chart-4">
                    {shift.falsePositives}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">False Positives</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">
                    {shift.compromised}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Compromised</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {shift.verificationsUsed}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Verifications Used</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onGoHome}
                data-testid="button-go-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                className="flex-1"
                onClick={onPlayAgain}
                data-testid="button-play-again"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
