'use client';

import React from 'react';
import { Loader2, Sparkles, Database } from 'lucide-react';
import { useTranslation } from '@/lib/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface LoadingModalProps {
  isOpen?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function LoadingModal({
  isOpen = true,
  title,
  subtitle,
  className
}: LoadingModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const displayTitle = title || t('common.loadingData');
  const displaySubtitle = subtitle || t('common.loadingDataDesc');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Top glowing laser progress line */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse w-full"></div>
      </div>

      {/* Glassmorphic backdrop */}
      <div className="absolute inset-0 bg-slate-950/30 dark:bg-black/60 backdrop-blur-md transition-opacity animate-fade-in" />

      {/* Centered Futuristic Glass Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-sm rounded-3xl p-8",
          "bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800",
          "shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-950/30",
          "flex flex-col items-center text-center",
          "transition-all transform animate-slide-up",
          className
        )}
      >
        {/* Animated Glow Orb */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-xl animate-pulse"></div>
          
          {/* Orbital Spinner Ring */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center justify-center shadow-inner">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute" />
          </div>
        </div>

        {/* Text Details */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-2">
          <span>{displayTitle}</span>
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-4">
          {displaySubtitle}
        </p>

        {/* Shimmering Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full w-2/3 animate-[gradientShift_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;
