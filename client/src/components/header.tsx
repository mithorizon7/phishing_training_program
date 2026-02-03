import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, LayoutDashboard, PlayCircle, GraduationCap, UserCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { UserAvatar } from "./user-avatar";
import { useGuestMode } from "@/hooks/use-guest-mode";
import type { User as UserType } from "@shared/models/auth";
import { Link, useLocation } from "wouter";
import logoImage from "@/assets/images/logo.png";

interface HeaderProps {
  user: UserType | null | undefined;
  verificationsRemaining?: number;
  inShift?: boolean;
  isGuestMode?: boolean;
}

export function Header({ user, verificationsRemaining, inShift, isGuestMode: propGuestMode }: HeaderProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { isGuestMode: storeGuestMode, exitGuestMode } = useGuestMode();
  const isGuestMode = propGuestMode ?? storeGuestMode;
  
  const showNav = (user || isGuestMode) && !inShift;

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoImage} alt="Inbox Arena" className="w-10 h-10 object-contain" data-testid="img-logo-header" />
            <span className="font-semibold text-lg hidden sm:inline" data-testid="text-header-title">
              {t('app.title')}
            </span>
          </Link>

          {showNav && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Button 
                variant={location === "/" ? "secondary" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link href="/" data-testid="link-dashboard">
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
              {user?.role === "instructor" && (
                <Button 
                  variant={location === "/instructor" ? "secondary" : "ghost"} 
                  size="sm" 
                  asChild
                >
                  <Link href="/instructor" data-testid="link-instructor">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {t('header.instructor')}
                  </Link>
                </Button>
              )}
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

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <UserAvatar user={user} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" />
                    {t('header.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/training" className="flex items-center gap-2 cursor-pointer">
                    <PlayCircle className="w-4 h-4" />
                    {t('header.training')}
                  </Link>
                </DropdownMenuItem>
                {user.role === "instructor" && (
                  <DropdownMenuItem asChild>
                    <Link href="/instructor" className="flex items-center gap-2 cursor-pointer">
                      <GraduationCap className="w-4 h-4" />
                      {t('header.instructorDashboard')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" />
                    {t('header.signOut')}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isGuestMode && !user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-guest-menu">
                  <UserCircle className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium" data-testid="text-guest-label">
                    Guest User
                  </p>
                  <p className="text-xs text-muted-foreground">Progress is temporary</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" />
                    {t('header.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/training" className="flex items-center gap-2 cursor-pointer">
                    <PlayCircle className="w-4 h-4" />
                    {t('header.training')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/login" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Sign in to save progress
                  </a>
                </DropdownMenuItem>
                  <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await fetch('/api/guest/session', { method: 'DELETE', credentials: 'include' });
                    } catch (e) {
                      // Continue even if request fails
                    }
                    exitGuestMode();
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Exit Guest Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
