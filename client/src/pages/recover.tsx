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

type ScenarioType = "clicked_link" | "entered_credentials" | "sent_money" | "downloaded_file";

interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  critical: boolean;
}

interface DrillScenario {
  id: ScenarioType;
  title: string;
  description: string;
  steps: RecoveryStep[];
}

const DRILL_SCENARIOS: DrillScenario[] = [
  {
    id: "clicked_link",
    title: "You Clicked a Suspicious Link",
    description: "You realized the link was suspicious after clicking. The page looked like a login portal.",
    steps: [
      { id: "disconnect", title: "Disconnect from network", description: "Turn off WiFi or unplug ethernet to stop any ongoing data transfer", icon: Wifi, critical: true },
      { id: "report", title: "Report to IT/Security", description: "Call your IT helpdesk or security team immediately using a known number", icon: Phone, critical: true },
      { id: "scan", title: "Run security scan", description: "Run antivirus/malware scan to check for drive-by downloads or exploits", icon: Shield, critical: true },
      { id: "document", title: "Document what happened", description: "Note the URL, what you saw, and any actions you took", icon: FileText, critical: false },
    ],
  },
  {
    id: "entered_credentials",
    title: "You Entered Your Password",
    description: "You entered your username and password on what turned out to be a fake login page.",
    steps: [
      { id: "change_password", title: "Change password immediately", description: "Go directly to the real site (type URL manually) and change your password", icon: Key, critical: true },
      { id: "report", title: "Report to IT/Security", description: "Call IT immediately - they may need to check for account compromise", icon: Phone, critical: true },
      { id: "mfa", title: "Enable/review MFA", description: "Ensure multi-factor authentication is enabled; review any new devices", icon: Shield, critical: true },
      { id: "check_accounts", title: "Check linked accounts", description: "If you reuse passwords (don't!), change them on other sites too", icon: Key, critical: false },
      { id: "monitor", title: "Monitor for suspicious activity", description: "Watch for unusual emails, login alerts, or account changes", icon: FileText, critical: false },
    ],
  },
  {
    id: "sent_money",
    title: "You Transferred Money",
    description: "You sent a wire transfer or payment based on what you now realize was a fraudulent request.",
    steps: [
      { id: "bank", title: "Contact your bank immediately", description: "Call your bank's fraud line RIGHT NOW - time is critical for recovery", icon: Phone, critical: true },
      { id: "report_it", title: "Report to IT/Security", description: "They need to know about the breach and may need to alert others", icon: Phone, critical: true },
      { id: "report_fbi", title: "File IC3 complaint (FBI)", description: "Report to ic3.gov - especially for business email compromise over $10,000", icon: Shield, critical: false },
      { id: "document", title: "Preserve all evidence", description: "Save emails, messages, and transaction records - do not delete anything", icon: FileText, critical: false },
      { id: "notify", title: "Notify affected parties", description: "If vendor/partner was impersonated, alert them about the fraud", icon: Phone, critical: false },
    ],
  },
  {
    id: "downloaded_file",
    title: "You Downloaded a File",
    description: "You downloaded and may have opened an attachment or file from a suspicious source.",
    steps: [
      { id: "disconnect", title: "Disconnect immediately", description: "Unplug network cable and disable WiFi to contain potential malware", icon: Wifi, critical: true },
      { id: "no_touch", title: "Don't try to fix it yourself", description: "Don't delete files or restart - this may make forensics harder", icon: XCircle, critical: true },
      { id: "report", title: "Report to IT/Security", description: "Call IT immediately - they have tools to assess and contain threats", icon: Phone, critical: true },
      { id: "scan", title: "Let IT run scans", description: "IT may need to run specialized tools or even reimage the device", icon: Shield, critical: false },
      { id: "change_passwords", title: "Change passwords (from clean device)", description: "After IT clears you, change passwords from a different device", icon: Key, critical: false },
    ],
  },
];

export default function RecoverDrill() {
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
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-recover-title">Report and Recover</h1>
            <p className="text-muted-foreground">Learn what to do when something goes wrong</p>
          </div>
          <Link href="/">
            <Button variant="outline" data-testid="link-back-dashboard">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Incident Response Training
            </CardTitle>
            <CardDescription>
              Even the best of us make mistakes. What matters is how quickly and effectively you respond. 
              Practice the critical steps for different scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {DRILL_SCENARIOS.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedScenario(scenario)}
                  data-testid={`card-scenario-${scenario.id}`}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline">
                        {scenario.steps.filter(s => s.critical).length} critical steps
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Why This Matters</h3>
                <p className="text-sm text-muted-foreground">
                  The FBI reports that quick action can help recover funds in Business Email Compromise cases. 
                  The difference between a minor incident and a major breach often comes down to how fast you 
                  report and respond. Practice these steps so they become second nature.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const score = getScore();
    const criticalCompleted = getCriticalStepsCompleted();
    const totalCritical = getTotalCriticalSteps();
    const allCriticalDone = criticalCompleted === totalCritical;

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <Card className={allCriticalDone ? "border-chart-2" : "border-destructive"}>
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
              {allCriticalDone ? "Great Response!" : "Some Critical Steps Missed"}
            </CardTitle>
            <CardDescription>
              {allCriticalDone 
                ? "You identified all the critical recovery steps. This quick action can make the difference between a close call and a disaster."
                : "In a real incident, missing critical steps could make things worse. Review the steps you missed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-recovery-score">{score}/100</div>
              <p className="text-muted-foreground">Recovery Score</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Critical Steps: {criticalCompleted}/{totalCritical}</p>
              {selectedScenario.steps.map((step) => {
                const completed = completedSteps.has(step.id);
                const Icon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      completed ? "bg-chart-2/10" : step.critical ? "bg-destructive/10" : "bg-muted/30"
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
                          {step.title}
                        </span>
                        {step.critical && (
                          <Badge variant={completed ? "default" : "destructive"}>Critical</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-medium mb-2">Key Takeaway</p>
                <p className="text-sm text-muted-foreground">
                  {selectedScenario.id === "clicked_link" && 
                    "Speed matters - disconnecting quickly can prevent malware from spreading or exfiltrating data. Always report even if you're unsure, as IT can assess the real risk."
                  }
                  {selectedScenario.id === "entered_credentials" && 
                    "Password changes must happen immediately from a trusted device. Enable MFA everywhere - it's your best protection even if credentials are stolen."
                  }
                  {selectedScenario.id === "sent_money" && 
                    "The first hour is critical for fund recovery. Banks can sometimes recall wire transfers if notified fast enough. Never delete any evidence."
                  }
                  {selectedScenario.id === "downloaded_file" && 
                    "Don't try to be a hero - well-meaning actions like deleting files or rebooting can destroy forensic evidence or trigger dormant malware."
                  }
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset} data-testid="button-try-again">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Another Scenario
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full" data-testid="button-back-training">
                  Back to Training
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{selectedScenario.title}</h1>
          <p className="text-muted-foreground text-sm">{selectedScenario.description}</p>
        </div>
        <Button variant="ghost" onClick={handleReset} data-testid="button-change-scenario">
          Change Scenario
        </Button>
      </div>

      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">What should you do next?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select all the steps you would take to respond to this incident. Critical steps are essential for damage control.
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
              className={`cursor-pointer transition-colors ${
                completed ? "border-chart-2 bg-chart-2/5" : "hover-elevate"
              }`}
              onClick={() => handleStepClick(step.id)}
              data-testid={`card-step-${step.id}`}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    completed ? "bg-chart-2/20" : "bg-muted"
                  }`}>
                    {completed ? (
                      <CheckCircle className="w-5 h-5 text-chart-2" />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{step.title}</span>
                      {step.critical && (
                        <Badge variant="outline">Critical</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {completedSteps.size} of {selectedScenario.steps.length} steps selected
          </span>
          <span className="text-sm font-medium">
            {getCriticalStepsCompleted()}/{getTotalCriticalSteps()} critical
          </span>
        </div>
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleSubmit}
          disabled={completedSteps.size === 0}
          data-testid="button-submit-recovery"
        >
          Check My Response
        </Button>
      </div>
    </div>
  );
}
