'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const s = status.toLowerCase();
  
  let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
  let dotClass = 'bg-slate-400 dark:bg-slate-500';
  
  if (['active', 'connected', 'completed', 'converted'].includes(s)) {
    colorClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40';
    dotClass = 'bg-emerald-500';
  } else if (['new', 'pending', 'waiting'].includes(s)) {
    colorClass = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40';
    dotClass = 'bg-blue-500';
  } else if (['paused', 'contacted', 'assigned', 'in_progress'].includes(s)) {
    colorClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40';
    dotClass = 'bg-amber-500';
  } else if (['suspended', 'failed', 'lost', 'cancelled', 'disconnected'].includes(s)) {
    colorClass = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/40 dark:border-rose-800/40';
    dotClass = 'bg-rose-500';
  } else if (['qualified', 'booked'].includes(s)) {
    colorClass = 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200/40 dark:border-violet-800/40';
    dotClass = 'bg-violet-500';
  }

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        colorClass
      )}
    >
      <span className={cn('me-1.5 h-1.5 w-1.5 rounded-full', dotClass)}></span>
      {formattedStatus}
    </span>
  );
}

export default StatusBadge;
