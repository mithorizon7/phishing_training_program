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
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-[-6rem] h-80 w-80 rounded-full bg-chart-3/15 blur-3xl opacity-70 animate-pulse" />
          <div className="absolute top-40 left-[-8rem] h-96 w-96 rounded-full bg-chart-2/15 blur-3xl opacity-70 animate-pulse" />
          <div className="absolute bottom-[-10rem] right-10 h-72 w-72 rounded-full bg-chart-1/15 blur-3xl opacity-70 animate-pulse" />
        </div>

        <header className="relative z-10 h-16 border-b bg-background/80 backdrop-blur">
          <div className="h-full max-w-6xl mx-auto flex items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/15 blur" />
                <img
                  src={logoImage}
                  alt={t("landing.alt.logo")}
                  className="relative w-10 h-10 object-contain"
                  data-testid="img-logo-landing"
                />
              </div>
              <span className="font-semibold text-lg" data-testid="text-landing-title">
                {t("app.title")}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/" data-testid="link-landing-dashboard">
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
          <section className="px-6 pt-16 pb-12">
            <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <Badge variant="outline" className="mb-5">
                  {t("landing.badge")}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-semibold leading-tight" data-testid="text-landing-hero">
                  {t("landing.hero.title")}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                  {t("landing.hero.subtitle")}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" data-testid="button-landing-primary">
                    <Link href="/training">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      {t("landing.hero.primaryCta")}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" data-testid="button-landing-dashboard">
                    <Link href="/">
                      {t("landing.hero.secondaryCta")}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" data-testid="button-landing-recover">
                    <Link href="/recover">
                      {t("landing.hero.tertiaryCta")}
                    </Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{t("landing.hero.note")}</p>
                <div className="mt-6 grid gap-3">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-chart-2" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="relative border-card-border bg-card/80 backdrop-blur shadow-lg">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-chart-1/15 blur-3xl" />
                <CardHeader>
                  <CardTitle className="text-xl">{t("landing.snapshot.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {snapshot.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border bg-background/70 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                  <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      {t("landing.snapshot.callout")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="px-6 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{t("landing.flow.title")}</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {t("landing.flow.subtitle")}
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                {flow.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Card key={step.title} className="bg-card/80">
                      <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
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

          <section className="px-6 py-12 bg-muted/30 border-y">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-semibold">{t("landing.focus.title")}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
                {focusAreas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <Card key={area.title} className="bg-background/80">
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

          <section className="px-6 py-14">
            <div className="max-w-6xl mx-auto">
              <Card className="border-card-border bg-card/80">
                <CardContent className="py-10 px-6 md:px-10">
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
