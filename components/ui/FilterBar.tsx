'use client';

import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <label htmlFor={`filter-${filter.key}`} className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline-block">
            {filter.label}
          </label>
          <select
            id={`filter-${filter.key}`}
            value={values[filter.key] || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-sm appearance-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default FilterBar;
