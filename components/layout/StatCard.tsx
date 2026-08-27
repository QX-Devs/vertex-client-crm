'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
}

export function StatCard({ icon: Icon, label, value, trend, color = 'emerald' }: StatCardProps) {
  const colorStyles = {
    emerald: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    violet: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-2xl flex items-center justify-center", colorStyles[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend.positive ? (
            <TrendingUp className="w-4 h-4 text-emerald-500 rtl:ml-1 ltr:mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-500 rtl:ml-1 ltr:mr-1" />
          )}
          <span className={cn("font-medium", trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {trend.value}%
          </span>
          <span className="text-slate-500 dark:text-slate-400 rtl:mr-2 ltr:ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
