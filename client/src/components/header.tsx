import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, PlayCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Link, useLocation } from "wouter";
import logoImage from "@/assets/images/logo.png";

interface HeaderProps {
  verificationsRemaining?: number;
  inShift?: boolean;
}

export function Header({ verificationsRemaining, inShift }: HeaderProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const showNav = !inShift;

  return (
    <header className="h-[72px] border-b border-black/5 dark:border-white/10 bg-background/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex items-center justify-center rounded-2xl bg-primary/10 p-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/35 to-transparent blur" />
              <img src={logoImage} alt={t("app.title")} className="relative w-11 h-11 object-contain" data-testid="img-logo-header" />
            </div>
            <span className="font-display text-sm uppercase tracking-[0.28em] hidden sm:inline" data-testid="text-header-title">
              {t('app.title')}
            </span>
          </Link>

          {showNav && (
            <nav className="hidden md:flex items-center gap-1 ml-4 rounded-full border border-black/5 dark:border-white/10 bg-background/60 px-2 py-1">
              <Button 
                variant={location === "/dashboard" ? "secondary" : "ghost"} 
                size="sm"
                className="rounded-full px-4"
                asChild
              >
                <Link href="/dashboard" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('header.dashboard')}
                </Link>
              </Button>
              <Button 
                variant={location === "/training" ? "secondary" : "ghost"} 
                size="sm"
                className="rounded-full px-4"
                asChild
              >
                <Link href="/training" data-testid="link-training">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {t('header.training')}
                </Link>
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {inShift && verificationsRemaining !== undefined && (
            <Badge variant="outline" className="hidden sm:flex" data-testid="badge-verifications">
              {t('header.verificationsLeft', { count: verificationsRemaining })}
            </Badge>
          )}
          
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
