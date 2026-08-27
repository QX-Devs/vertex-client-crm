"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ClientSidebar from "@/components/layout/ClientSidebar";
import ClientHeader from "@/components/layout/ClientHeader";
import NavigationProgress from "@/components/layout/NavigationProgress";
import LoadingModal from "@/components/ui/LoadingModal";

import { useTranslation } from "@/lib/LanguageContext";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [clientData, setClientData] = useState<{ business_name: string } | null>(null);

  const getPageTitle = (path: string): string => {
    if (path.startsWith("/conversations")) return t("nav.conversations");
    if (path.startsWith("/leads")) return t("nav.leads");
    if (path.startsWith("/orders")) return t("nav.orders");
    if (path.startsWith("/settings")) return t("nav.settings");
    if (path.startsWith("/usage")) return t("nav.usage");
    if (path.startsWith("/channels")) return t("nav.channels");
    if (path.startsWith("/profile")) return t("nav.profile");
    return t("nav.dashboard");
  };

  useEffect(() => {
    let isMounted = true;
    
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUser({ name: data.user?.name || "Owner", email: data.user?.email || "" });
            setClientData({ business_name: data.client?.business_name || "My Business" });
            setLoading(false);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        if (isMounted) {
          router.push("/login"); 
        }
      }
    }
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return <LoadingModal />;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Top Navigation progress bar for instant click feedback */}
      <NavigationProgress />
      {/* Sidebar fixed to start (right in RTL, left in LTR) */}
      <ClientSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userName={user?.name}
        userEmail={user?.email}
      />
      
      {/* Main Content Area offset by ms-64 so it is never obscured */}
      <main className="flex-1 lg:ms-64 flex flex-col min-h-screen min-w-0 overflow-x-hidden transition-all duration-300">
        <ClientHeader 
          title={pageTitle} 
          businessName={clientData?.business_name}
          userName={user?.name}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
