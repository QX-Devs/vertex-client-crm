"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  ShoppingBag,
  Settings,
  BarChart3,
  Radio,
  User,
  LogOut,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { useTranslation } from "@/lib/LanguageContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

export default function ClientSidebar({ isOpen, onClose, userName, userEmail }: ClientSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("nav.conversations"), href: "/conversations", icon: MessageSquare },
    { label: t("nav.leads"), href: "/leads", icon: Users },
    { label: t("nav.orders"), href: "/orders", icon: ShoppingBag },
    { label: t("nav.channels"), href: "/channels", icon: Radio },
    { label: t("nav.usage"), href: "/usage", icon: BarChart3 },
    { label: t("nav.settings"), href: "/settings", icon: Settings },
    { label: t("nav.profile"), href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 start-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-e border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg lg:shadow-none",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full ltr:-translate-x-full lg:translate-x-0 rtl:lg:translate-x-0 ltr:lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/80">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Vertex
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("nav.clientPortal")}</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-e-2 border-emerald-500 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 flex flex-col gap-3 border border-slate-200/40 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                {userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userName || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || "user@example.com"}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.signOut")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
