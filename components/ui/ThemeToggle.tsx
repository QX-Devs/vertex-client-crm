'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/lib/ThemeContext';
import { useLanguage } from '@/lib/LanguageContext';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'pill' | 'icon-only';
}

export function ThemeToggle({ className, variant = 'button' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { lang } = useLanguage();

  const isDark = resolvedTheme === 'dark';

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'p-2 rounded-xl border transition-all duration-200 flex items-center justify-center',
          'bg-white/80 dark:bg-slate-800/80 backdrop-blur border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm',
          className
        )}
        title={isDark ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600 animate-fade-in" />
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm select-none',
          'bg-white/80 dark:bg-slate-800/90 backdrop-blur border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
          className
        )}
        title={isDark ? (lang === 'ar' ? 'التحويل إلى الوضع الفاتح' : 'Switch to Light Mode') : (lang === 'ar' ? 'التحويل إلى الوضع الداكن' : 'Switch to Dark Mode')}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ar' ? 'فاتح' : 'Light'}</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'ar' ? 'داكن' : 'Dark'}</span>
          </>
        )}
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
        onClick={() => !isDark || toggleTheme()}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1',
          !isDark
            ? 'bg-white dark:bg-slate-700 text-slate-900 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        )}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>{lang === 'ar' ? 'فاتح' : 'Light'}</span>
      </button>

      <button
        type="button"
        onClick={() => isDark || toggleTheme()}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1',
          isDark
            ? 'bg-slate-900 text-white shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        )}
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
        <span>{lang === 'ar' ? 'داكن' : 'Dark'}</span>
      </button>
    </div>
  );
}

export default ThemeToggle;
