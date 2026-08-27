'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '@/lib/LanguageContext';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'button';
}

export function LanguageSwitcher({ className, variant = 'pill' }: LanguageSwitcherProps) {
  const { lang, setLang, toggleLang } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLang}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm select-none',
          'bg-white/80 dark:bg-slate-800/90 backdrop-blur border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
          className
        )}
        title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-inner',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLang('ar')}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1',
          lang === 'ar'
            ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        )}
      >
        <span>العربية</span>
      </button>

      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1',
          lang === 'en'
            ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        )}
      >
        <span>EN</span>
      </button>
    </div>
  );
}

export default LanguageSwitcher;
