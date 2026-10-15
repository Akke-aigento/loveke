import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import nl from '@/i18n/nl.json';
import en from '@/i18n/en.json';
import fr from '@/i18n/fr.json';
import { setSellqoLocale } from '@/integrations/sellqo/client';

type Locale = 'nl' | 'en' | 'fr';

const translations = { nl, en, fr } as const;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

const LOCALE_KEY = 'loveke-locale';
const isLocale = (v: unknown): v is Locale => v === 'nl' || v === 'en' || v === 'fr';

// LOVEKE-LAUNCH-1: taalkeuze onthouden (localStorage, defensief) zodat een refresh niet terugspringt naar NL.
function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (isLocale(saved)) return saved;
  } catch { /* opslag geblokkeerd: val terug op NL */ }
  return 'nl';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const l = initialLocale();
    if (l !== 'nl') {
      setSellqoLocale(l);
      document.documentElement.lang = l;
    }
    return l;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setSellqoLocale(newLocale);
    document.documentElement.lang = newLocale;
    try { localStorage.setItem(LOCALE_KEY, newLocale); } catch { /* geen opslag beschikbaar */ }
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[locale] as unknown as Record<string, unknown>, key);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
