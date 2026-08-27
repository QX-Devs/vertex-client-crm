'use client';

import { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff, Clock, Shield, MessageSquare, MessageCircle, Camera } from 'lucide-react';
import LoadingModal from '@/components/ui/LoadingModal';
import StatusBadge from '@/components/ui/StatusBadge';
import { useTranslation } from '@/lib/LanguageContext';

export default function ChannelsPage() {
  const { t } = useTranslation();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch('/api/client/channels');
        if (res.ok) {
          const data = await res.json();
          setChannels(data.channels || []);
        }
      } catch (error) {
        console.error('Failed to fetch channels', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'whatsapp':
        return <MessageSquare className="w-8 h-8 text-emerald-500" />;
      case 'messenger':
        return <MessageCircle className="w-8 h-8 text-blue-500" />;
      case 'instagram':
        return <Camera className="w-8 h-8 text-pink-500" />;
      default:
        return <Radio className="w-8 h-8 text-slate-500" />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return t('common.empty');
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t('dashboard.justNow');
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('dashboard.minutesAgo')}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('dashboard.hoursAgo')}`;
    return `${Math.floor(diffInSeconds / 86400)} ${t('dashboard.daysAgo')}`;
  };

  if (loading) {
    return <LoadingModal />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('channels.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('channels.subtitle')}</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-dashed">
          <WifiOff className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">{t('channels.noChannels')}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('channels.adminManagedNotice')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-white dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden hover:shadow-md dark:hover:border-slate-700 transition-all">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {getPlatformIcon(channel.platform)}
                  </div>
                  <StatusBadge status={channel.status} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 capitalize mb-1">
                  {channel.platform === 'whatsapp' ? t('channels.whatsapp') : channel.platform === 'messenger' ? t('channels.messenger') : channel.platform === 'instagram' ? t('channels.instagram') : channel.platform}
                </h3>
                
                {channel.external_account_name && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-4">
                    {t('channels.accountName')}: <strong dir="ltr" className="text-slate-900 dark:text-slate-100 font-mono inline-block text-left">{channel.external_account_name}</strong>
                  </p>
                )}

                <div className="space-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('channels.webhookStatus')}
                    </span>
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{channel.webhook_status || 'Active'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {t('channels.lastValidated')}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{getRelativeTime(channel.last_validated_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('channels.adminManagedNotice')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
