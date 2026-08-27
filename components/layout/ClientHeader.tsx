"use client";

import React, { useState } from "react";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";

import { useTranslation } from "@/lib/LanguageContext";
import Link from "next/link";

interface ClientHeaderProps {
  title: string;
  subtitle?: string;
  businessName?: string;
  userName?: string;
  onMenuToggle: () => void;
}

export default function ClientHeader({
  title,
  subtitle,
  businessName,
  userName,
  onMenuToggle
}: ClientHeaderProps) {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const initials = userName?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ms-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Theme Toggle */}
        <ThemeToggle variant="icon-only" />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {businessName && (
          <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{businessName}</span>
          </div>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 pe-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userName || "User"}</p>
                </div>
                <Link
                  href="/profile"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-4 h-4" />
                  <span>{t("nav.profile")}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("nav.signOut")}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
