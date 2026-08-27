"use client";

import React from "react";
import { Loader2 } from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = "md", text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-emerald-500", className)} />
      {text && <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{text}</p>}
    </div>
  );
}

export { LoadingSpinner };
