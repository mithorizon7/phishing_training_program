import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Target, Brain, TrendingUp, Mail, MessageSquare, Phone, CheckCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg" data-testid="text-app-title">{t('app.title')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">{t('landing.hero.signIn')}</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-6">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('landing.hero.badge')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">{t('landing.hero.getStarted')}</a>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                {t('common.learnMore')}
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">{t('landing.whyTrainingFails.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('landing.whyTrainingFails.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-md bg-chart-1/10 flex items-center justify-center mb-2">
                    <Brain className="w-5 h-5 text-chart-1" />
                  </div>
                  <CardTitle className="text-lg">{t('landing.whyTrainingFails.decisionBased.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('landing.whyTrainingFails.decisionBased.description')}
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-md bg-chart-2/10 flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">{t('landing.whyTrainingFails.realistic.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('landing.whyTrainingFails.realistic.description')}
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-md bg-chart-3/10 flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  <CardTitle className="text-lg">{t('landing.whyTrainingFails.adaptive.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('landing.whyTrainingFails.adaptive.description')}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">{t('landing.channels.title')}</h2>
              <p className="text-muted-foreground">
                {t('landing.channels.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.channels.email.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.channels.email.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.channels.sms.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.channels.sms.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.channels.calls.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.channels.calls.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">{t('landing.behaviors.title')}</h2>
              <p className="text-muted-foreground">
                {t('landing.behaviors.subtitle')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-8 h-8 rounded-full bg-chart-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-chart-2-foreground">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.behaviors.pauseInspect.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.behaviors.pauseInspect.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-8 h-8 rounded-full bg-chart-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-chart-2-foreground">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.behaviors.classify.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.behaviors.classify.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-card border">
                <div className="w-8 h-8 rounded-full bg-chart-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-chart-2-foreground">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.behaviors.verify.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.behaviors.verify.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">{t('landing.cta.title')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <Button size="lg" asChild data-testid="button-cta-signup">
              <a href="/api/login" className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t('landing.cta.button')}
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('app.title')}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('landing.footer.tagline')}
          </p>
        </div>
      </footer>
    </div>
  );
}
