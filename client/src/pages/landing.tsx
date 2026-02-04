import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "wouter";
import {
  Target,
  PlayCircle,
  TrendingUp,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  CheckCircle,
} from "lucide-react";
import logoImage from "@/assets/images/logo.png";

export default function Landing() {
  const { t } = useTranslation();

  const highlights = [
    t("landing.highlights.feedback"),
    t("landing.highlights.decisions"),
    t("landing.highlights.confidence"),
  ];

  const flow = [
    {
      icon: Target,
      title: t("landing.flow.step1.title"),
      description: t("landing.flow.step1.description"),
    },
    {
      icon: PlayCircle,
      title: t("landing.flow.step2.title"),
      description: t("landing.flow.step2.description"),
    },
    {
      icon: TrendingUp,
      title: t("landing.flow.step3.title"),
      description: t("landing.flow.step3.description"),
    },
  ];

  const focusAreas = [
    {
      icon: Mail,
      title: t("landing.focus.email.title"),
      description: t("landing.focus.email.description"),
    },
    {
      icon: MessageSquare,
      title: t("landing.focus.sms.title"),
      description: t("landing.focus.sms.description"),
    },
    {
      icon: Phone,
      title: t("landing.focus.calls.title"),
      description: t("landing.focus.calls.description"),
    },
    {
      icon: Shield,
      title: t("landing.focus.oauth.title"),
      description: t("landing.focus.oauth.description"),
    },
  ];

  const snapshot = [
    t("landing.snapshot.shift"),
    t("landing.snapshot.actions"),
    t("landing.snapshot.insights"),
  ];

  return (
    <div className="min-h-screen bg-background app-shell">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-[-6rem] h-80 w-80 rounded-full bg-primary/20 blur-[120px] opacity-80 animate-float" />
          <div className="absolute top-40 left-[-8rem] h-96 w-96 rounded-full bg-chart-4/20 blur-[140px] opacity-70 animate-float" />
          <div className="absolute bottom-[-10rem] right-10 h-72 w-72 rounded-full bg-chart-3/20 blur-[110px] opacity-70 animate-float" />
        </div>

        <header className="relative z-10 h-[72px] border-b border-black/5 dark:border-white/10 bg-background/70 backdrop-blur-xl">
          <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex items-center justify-center rounded-2xl bg-primary/10 p-2">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/35 to-transparent blur" />
                <img
                  src={logoImage}
                  alt={t("landing.alt.logo")}
                  className="relative w-8 h-8 object-contain"
                  data-testid="img-logo-landing"
                />
              </div>
              <span className="font-display text-base sm:text-lg tracking-[0.08em]" data-testid="text-landing-title">
                {t("app.title")}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/dashboard" data-testid="link-landing-dashboard">
                  {t("landing.hero.secondaryCta")}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/training" data-testid="link-landing-start">
                  {t("landing.hero.primaryCta")}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section className="px-6 pt-20 pb-16">
            <div className="max-w-7xl mx-auto grid gap-14 lg:grid-cols-[1.15fr_0.85fr] items-center">
              <div>
                <Badge variant="outline" className="mb-6 chip animate-rise [animation-delay:40ms]">
                  {t("landing.badge")}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight animate-rise [animation-delay:120ms]" data-testid="text-landing-hero">
                  {t("landing.hero.title")}
                </h1>
                <p className="mt-5 text-lg text-muted-foreground max-w-xl animate-rise [animation-delay:200ms]">
                  {t("landing.hero.subtitle")}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise [animation-delay:260ms]">
                  <Button asChild size="lg" data-testid="button-landing-primary">
                    <Link href="/training">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      {t("landing.hero.primaryCta")}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" data-testid="button-landing-dashboard">
                    <Link href="/dashboard">
                      {t("landing.hero.secondaryCta")}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" data-testid="button-landing-recover">
                    <Link href="/recover">
                      {t("landing.hero.tertiaryCta")}
                    </Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground animate-rise [animation-delay:320ms]">{t("landing.hero.note")}</p>
                <div className="mt-6 grid gap-3 animate-rise [animation-delay:360ms]">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-full border border-black/5 dark:border-white/10 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-chart-2" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="relative overflow-hidden glass-panel animate-rise [animation-delay:180ms]">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-[100px]" />
                <CardHeader>
                  <CardTitle className="text-xl">{t("landing.snapshot.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {snapshot.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-background/70 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      {t("landing.snapshot.callout")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="px-6 py-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{t("landing.flow.title")}</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {t("landing.flow.subtitle")}
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {flow.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Card key={step.title} className="group relative overflow-hidden border border-black/5 dark:border-white/10 bg-card/60 transition hover:-translate-y-1 hover:shadow-[0_30px_70px_-50px_rgba(15,23,42,0.65)]">
                      <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {step.description}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-6 py-16 bg-background/70 border-y border-black/5 dark:border-white/10">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold">{t("landing.focus.title")}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
                {focusAreas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <Card key={area.title} className="relative overflow-hidden border border-black/5 dark:border-white/10 bg-card/60">
                      <CardContent className="pt-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">{area.title}</h3>
                        <p className="text-sm text-muted-foreground">{area.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-6 py-16">
            <div className="max-w-7xl mx-auto">
              <Card className="relative overflow-hidden glass-panel-strong">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-3/10 pointer-events-none" />
                <CardContent className="relative z-10 py-10 px-6 md:px-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-semibold">{t("landing.cta.title")}</h2>
                      <p className="text-muted-foreground mt-2 max-w-xl">
                        {t("landing.cta.subtitle")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild size="lg">
                        <Link href="/training">
                          <PlayCircle className="w-5 h-5 mr-2" />
                          {t("landing.cta.start")}
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link href="/recover">
                          {t("landing.cta.recover")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
