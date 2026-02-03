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
    <header className="h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoImage} alt={t("app.title")} className="w-10 h-10 object-contain" data-testid="img-logo-header" />
            <span className="font-semibold text-lg hidden sm:inline" data-testid="text-header-title">
              {t('app.title')}
            </span>
          </Link>

          {showNav && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Button 
                variant={location === "/dashboard" ? "secondary" : "ghost"} 
                size="sm" 
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
