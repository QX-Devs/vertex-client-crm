'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/layout/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingModal } from '@/components/ui/LoadingModal';
import { MessageSquare, Users, ShoppingBag, BarChart3, Clock, Settings, Radio } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/LanguageContext';

interface DashboardStats {
  conversationsCount: number;
  leadsCount: number;
  ordersCount: number;
  usage: { used_chats: number; monthly_limit: number };
  recentActivity: any[];
  pendingLeadsCount: number;
}

export default function DashboardPage() {
  const { t, lang } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/client/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingModal />;
  }

  if (!stats) {
    return <div className="p-8 text-center text-rose-500 dark:text-rose-400">{t('common.empty')}</div>;
  }

  const { used_chats, monthly_limit } = stats.usage;
  const usagePercentage = monthly_limit > 0 ? Math.round((used_chats / monthly_limit) * 100) : 0;
  
  let progressColor = 'bg-emerald-500';
  if (usagePercentage >= 100) progressColor = 'bg-rose-500';
  else if (usagePercentage >= 80) progressColor = 'bg-amber-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.subtitle')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={MessageSquare} 
          label={t('dashboard.totalConversations')} 
          value={stats.conversationsCount} 
          color="blue" 
        />
        <StatCard 
          icon={Users} 
          label={t('dashboard.newLeads')} 
          value={stats.leadsCount} 
          color="emerald" 
        />
        <StatCard 
          icon={ShoppingBag} 
          label={t('dashboard.confirmedOrders')} 
          value={stats.ordersCount} 
          color="violet" 
        />
        <StatCard 
          icon={BarChart3} 
          label={t('dashboard.usageQuota')} 
          value={`${used_chats} / ${monthly_limit > 0 ? monthly_limit : '∞'}`} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('dashboard.usageProgress')}</h2>
            <div className="mb-2 flex justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>{used_chats} {t('dashboard.chatsUsedOfLimit')} {monthly_limit > 0 ? monthly_limit : '∞'} {t('dashboard.usedChats')}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{usagePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${progressColor} transition-all duration-500`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span>{t('dashboard.recentActivity')}</span>
            </h2>
            {stats.recentActivity.length === 0 ? (
              <EmptyState 
                icon={Clock}
                title={t('dashboard.noRecentActivity')}
                description={t('dashboard.recentActivityDesc')}
              />
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any) => {
                  const locale = lang === 'ar' ? 'ar-JO' : 'en-US';
                  const timeStr = new Date(activity.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 last:border-0 last:pb-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span dir="ltr" className="font-semibold text-slate-900 dark:text-slate-100 text-sm text-left font-mono inline-block">
                            {activity.from_phone || activity.customer_id}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{timeStr}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                          {activity.message_text || activity.public_customer_reply || '...'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('dashboard.quickActions')}</h2>
            <div className="space-y-3">
              <Link href="/leads" className="flex items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/60 group gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-950/70 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('dashboard.viewLeads')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.viewLeadsDesc')}</p>
                </div>
              </Link>
              
              <Link href="/orders" className="flex items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/60 group gap-3">
                <div className="bg-violet-100 dark:bg-violet-950/70 p-2 rounded-xl text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('dashboard.manageOrders')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.manageOrdersDesc')}</p>
                </div>
              </Link>

              <Link href="/settings" className="flex items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/60 group gap-3">
                <div className="bg-blue-100 dark:bg-blue-950/70 p-2 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('dashboard.configureAi')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.configureAiDesc')}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
