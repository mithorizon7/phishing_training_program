import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfidenceRatingProps {
  action: string;
  onSubmit: (confidence: number) => void;
  onCancel: () => void;
}

function getConfidenceLabel(value: number, t: (key: string) => string): string {
  if (value <= 60) return t("training.confidencePanel.labels.somewhatSure");
  if (value <= 75) return t("training.confidencePanel.labels.fairlyConfident");
  if (value <= 90) return t("training.confidencePanel.labels.confident");
  return t("training.confidencePanel.labels.veryConfident");
}

function getActionLabel(action: string, t: (key: string) => string): string {
  switch (action) {
    case "report": return t("training.confidencePanel.actions.report");
    case "delete": return t("training.confidencePanel.actions.delete");
    case "verify": return t("training.confidencePanel.actions.verify");
    case "proceed": return t("training.confidencePanel.actions.proceed");
    default: return action;
  }
}

export function ConfidenceRating({ action, onSubmit, onCancel }: ConfidenceRatingProps) {
  const { t } = useTranslation();
  const [confidence, setConfidence] = useState(75);

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-panel-strong">
        <CardHeader>
          <CardTitle className="flex min-w-0 items-start gap-2 text-lg sm:items-center">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />
            <span className="min-w-0 break-words">{t("training.confidencePanel.title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60">
            <p className="text-sm text-muted-foreground mb-1">{t("training.confidencePanel.decisionLabel")}</p>
            <p className="font-medium">{getActionLabel(action, t)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{t("training.confidencePanel.levelLabel")}</span>
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
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>{t("training.confidencePanel.rangeLow")}</span>
              <span>{t("training.confidencePanel.rangeHigh")}</span>
            </div>
            <p className="text-center text-sm font-medium text-primary">
              {getConfidenceLabel(confidence, t)}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button 
              variant="outline" 
              className="h-auto min-h-10 min-w-0 flex-1 whitespace-normal px-2 py-2 sm:min-h-9 sm:px-4"
              onClick={onCancel}
              data-testid="button-cancel-confidence"
            >
              {t("training.confidencePanel.goBack")}
            </Button>
            <Button 
              className="h-auto min-h-10 min-w-0 flex-1 whitespace-normal px-2 py-2 sm:min-h-9 sm:px-4"
              onClick={() => onSubmit(confidence)}
              data-testid="button-submit-confidence"
            >
              <CheckCircle className="w-4 h-4 shrink-0 mr-2" />
              {t("training.confidencePanel.confirmDecision")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
