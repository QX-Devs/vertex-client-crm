'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Zap, MessageSquare, Shield, Users, Radio, TrendingUp, AlertTriangle } from 'lucide-react';
import LoadingModal from '@/components/ui/LoadingModal';
import { useTranslation } from '@/lib/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function UsagePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/client/usage');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch usage data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingModal />;
  }

  if (!data) return <div className="p-8 text-center text-rose-500 dark:text-rose-400">{t('common.empty')}</div>;

  const { plan, currentUsage, monthlyHistory } = data;
  const used = currentUsage?.used_chats || 0;
  const limit = currentUsage?.monthly_limit || plan?.monthly_chat_limit || 1;
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700 dark:text-emerald-400";
  let alert = null;

  if (percentage >= 100) {
    barColor = "bg-rose-500";
    textColor = "text-rose-700 dark:text-rose-400";
    alert = { type: 'rose', message: t('usage.usageWarning100') };
  } else if (percentage >= 80) {
    barColor = "bg-amber-500";
    textColor = "text-amber-700 dark:text-amber-400";
    alert = { type: 'amber', message: t('usage.usageWarning80') };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('usage.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('usage.subtitle')}</p>
      </div>

      {/* Plan Information Card */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('usage.planInfo')}: {plan?.name || 'Standard Plan'}</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500"/> {t('usage.chatLimit')}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{plan?.monthly_chat_limit || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-slate-400 dark:text-slate-500"/> {t('usage.aiLevel')}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 capitalize text-base">{plan?.ai_level || 'standard'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <Radio className="w-4 h-4 text-slate-400 dark:text-slate-500"/> {t('usage.allowedChannels')}
            </span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {plan?.allowed_channels?.map((ch: string) => (
                <span key={ch} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full font-medium capitalize">{ch}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500"/> {t('usage.orderCapture')}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{plan?.order_capture_enabled ? t('common.yes') : t('common.no')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-slate-400 dark:text-slate-500"/> {t('usage.humanHandoff')}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{plan?.human_handoff_enabled ? t('common.yes') : t('common.no')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <BarChart3 className="w-4 h-4 text-slate-400 dark:text-slate-500"/> {t('usage.crmEnabled')}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{plan?.crm_enabled ? t('common.yes') : t('common.no')}</span>
          </div>
        </div>
      </div>

      {/* Usage Meter Card */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('usage.usageMeter')}</h3>
        
        {alert && (
          <div className={cn(
            "mb-4 p-4 rounded-xl flex items-start gap-3",
            alert.type === 'rose' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          )}>
            <AlertTriangle className={cn("w-5 h-5 shrink-0 mt-0.5", alert.type === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')} />
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        )}

        <div className="flex justify-between items-end mb-2">
          <span dir="ltr" className="text-sm text-slate-600 dark:text-slate-300 font-medium font-mono">{used} / {limit} {t('usage.usedChats')}</span>
          <span dir="ltr" className={cn("text-2xl font-bold font-mono", textColor)}>{percentage}%</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-500", barColor)} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>

      {/* Monthly History Card */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <span>{t('usage.monthlyHistory')}</span>
        </h3>
        
        <div className="space-y-4">
          {monthlyHistory && monthlyHistory.length > 0 ? monthlyHistory.map((item: any, idx: number) => {
            const histUsed = item.used_chats || 0;
            const histLimit = item.monthly_limit || 1;
            const histPct = Math.min(100, Math.round((histUsed / histLimit) * 100));
            const color = histPct >= 100 ? "bg-rose-500" : histPct >= 80 ? "bg-amber-500" : "bg-emerald-500";
            
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0 font-mono">{item.month}</div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full", color)} style={{ width: `${histPct}%` }}></div>
                  </div>
                  <div className="w-24 text-end text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{histUsed} {t('usage.usedChats')}</div>
                </div>
              </div>
            );
          }) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.empty')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
