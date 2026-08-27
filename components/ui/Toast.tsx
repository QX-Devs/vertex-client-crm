"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible?: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = "success", visible = true, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const typeConfig = {
    success: {
      bg: "bg-emerald-500",
      icon: CheckCircle2,
    },
    error: {
      bg: "bg-rose-500",
      icon: XCircle,
    },
    info: {
      bg: "bg-blue-500",
      icon: Info,
    }
  };

  const Icon = typeConfig[type].icon;

  return (
    <div className="fixed top-4 left-4 z-50 animate-in slide-in-from-left fade-in duration-300">
      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white min-w-[280px]", typeConfig[type].bg)}>
        <Icon className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { Toast };
