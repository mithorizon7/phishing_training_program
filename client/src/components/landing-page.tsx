import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Target, Brain, TrendingUp, Mail, MessageSquare, Phone, CheckCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg" data-testid="text-app-title">Inbox Arena</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-6">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Phishing Training Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
              Train Your Team to<br />Spot Real Threats
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Interactive simulations that teach your team to identify phishing, BEC scams, and social engineering attacks. 
              Build the decision-making skills that protect your organization.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started Free</a>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Why Traditional Training Fails</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Most phishing training teaches you to spot "sloppy fake emails." 
                Real attackers win by exploiting urgent workflows — often without any suspicious links.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-md bg-chart-1/10 flex items-center justify-center mb-2">
                    <Brain className="w-5 h-5 text-chart-1" />
                  </div>
                  <CardTitle className="text-lg">Decision-Based Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Train the right behavior: "What is the safest next action?" — not just "is this phishing?"
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-md bg-chart-2/10 flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">Realistic Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Email, SMS, and call simulations covering BEC, pretexting, spoofing, and modern attack patterns.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-md bg-chart-3/10 flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  <CardTitle className="text-lg">Adaptive Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    NIST Phish Scale methodology ensures learners build skills progressively, not get overwhelmed.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Multi-Channel Training</h2>
              <p className="text-muted-foreground">
                Real threats arrive via multiple channels. Train across all of them.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Classic phishing, credential theft, malicious attachments, and BEC attacks
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">SMS</h3>
                  <p className="text-sm text-muted-foreground">
                    Smishing attacks, wrong-number scams, and urgent action requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Calls</h3>
                  <p className="text-sm text-muted-foreground">
                    Vishing transcripts, tech support scams, and impersonation attempts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Key Training Behaviors</h2>
              <p className="text-muted-foreground">
                Three skills that actually prevent breaches
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-8 h-8 rounded-full bg-chart-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-chart-2-foreground">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pause + Inspect</h3>
                  <p className="text-sm text-muted-foreground">
                    Break the "21 seconds to click" habit. Users click phishing links in seconds — training the pause reflex is critical.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-8 h-8 rounded-full bg-chart-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-chart-2-foreground">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Classify the Request</h3>
                  <p className="text-sm text-muted-foreground">
                    Focus on what's being asked: money, credentials, access, permissions, or downloads. The request type determines the risk.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-8 h-8 rounded-full bg-chart-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-chart-2-foreground">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Verify via Known Channel</h3>
                  <p className="text-sm text-muted-foreground">
                    Don't reply to suspicious emails asking "is this real?" Use a verified contact method, then report.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Train Smarter?</h2>
            <p className="text-muted-foreground mb-8">
              Start building real security awareness skills today. No credit card required.
            </p>
            <Button size="lg" asChild data-testid="button-cta-signup">
              <a href="/api/login" className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Start Training Now
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Inbox Arena</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Training real security awareness, not trivia.
          </p>
        </div>
      </footer>
    </div>
  );
}
