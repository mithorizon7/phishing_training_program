import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ConfidenceRatingProps {
  action: string;
  onSubmit: (confidence: number) => void;
  onCancel: () => void;
}

function getConfidenceLabel(value: number): string {
  if (value <= 60) return "Somewhat sure";
  if (value <= 75) return "Fairly confident";
  if (value <= 90) return "Confident";
  return "Very confident";
}

function getActionLabel(action: string): string {
  switch (action) {
    case "report": return "Report this message";
    case "delete": return "Delete this message";
    case "verify": return "Verify via known channel";
    case "proceed": return "Proceed with the request";
    default: return action;
  }
}

export function ConfidenceRating({ action, onSubmit, onCancel }: ConfidenceRatingProps) {
  const [confidence, setConfidence] = useState(75);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            How confident are you?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Your decision:</p>
            <p className="font-medium">{getActionLabel(action)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence Level</span>
              <span className="font-semibold text-lg">{confidence}%</span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(values) => setConfidence(values[0])}
              min={50}
              max={100}
              step={5}
              className="w-full"
              data-testid="slider-confidence"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% - Guessing</span>
              <span>100% - Certain</span>
            </div>
            <p className="text-center text-sm font-medium text-primary">
              {getConfidenceLabel(confidence)}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
              data-testid="button-cancel-confidence"
            >
              Go Back
            </Button>
            <Button 
              className="flex-1"
              onClick={() => onSubmit(confidence)}
              data-testid="button-submit-confidence"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Decision
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
