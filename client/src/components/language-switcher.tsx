import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];
  
  const changeLanguage = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-language-switcher">
          <Languages className="w-4 h-4" />
          <span className="sr-only">{t('header.changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={lang.code === i18n.language ? 'bg-accent' : ''}
            data-testid={`menu-item-lang-${lang.code}`}
          >
            <span className="mr-2">{lang.nativeName}</span>
            {lang.code === i18n.language && (
              <span className="ml-auto text-xs text-muted-foreground">{t('common.active')}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
