'use client';

import React, { useState, useEffect } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { MessageSquare, X, Phone, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingModal } from '@/components/ui/LoadingModal';
import { useTranslation } from '@/lib/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Conversation {
  id: string;
  customer_id: string;
  from_phone: string;
  channel: string;
  message_text: string;
  message_type: string;
  direction: 'inbound' | 'outbound';
  order_confirmed: boolean;
  created_at: string;
}

export default function ConversationsPage() {
  const { t, lang } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [timelineMessages, setTimelineMessages] = useState<Conversation[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (search) params.append('search', search);
      if (channelFilter) params.append('channel', channelFilter);

      const res = await fetch(`/api/client/conversations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConversations(data.conversations || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [search, channelFilter, page]);

  const fetchTimeline = async (customerId: string) => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/client/conversations?search=${encodeURIComponent(customerId)}&limit=100`);
      if (!res.ok) throw new Error('Failed to fetch timeline');
      const data = await res.json();
      setTimelineMessages([...(data.conversations || [])].reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchTimeline(selectedCustomerId);
    } else {
      setTimelineMessages([]);
    }
  }, [selectedCustomerId]);

  const getChannelColor = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'whatsapp': return 'bg-emerald-500';
      case 'messenger': return 'bg-blue-500';
      case 'instagram': return 'bg-pink-500';
      default: return 'bg-slate-400';
    }
  };

  const channelOptions = [
    { value: '', label: t('common.all') },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'instagram', label: 'Instagram' }
  ];

  return (
    <div className="space-y-6">
      {loading && <LoadingModal />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('conversations.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('conversations.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput 
            value={search} 
            onChange={(v) => { setSearch(v); setPage(1); }} 
            placeholder={t('conversations.searchPlaceholder')} 
            className="w-full sm:w-64" 
          />
          <FilterBar
            filters={[{
              key: 'channel',
              label: t('common.channel'),
              options: channelOptions
            }]}
            values={{ channel: channelFilter }}
            onChange={(_, val) => { setChannelFilter(val); setPage(1); }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
            <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p>{t('conversations.noConversations')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-start">{t('common.customer')}</th>
                  <th className="px-6 py-3.5 font-semibold text-start">{t('common.details')}</th>
                  <th className="px-6 py-3.5 font-semibold text-start">{t('common.date')}</th>
                  <th className="px-6 py-3.5 font-semibold text-start">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {conversations.map((conv) => (
                  <tr 
                    key={conv.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCustomerId(conv.customer_id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', getChannelColor(conv.channel))} />
                        <div dir="ltr" className="font-semibold text-slate-900 dark:text-slate-100 text-left font-mono">{conv.customer_id || conv.from_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 max-w-md">
                        {conv.direction === 'outbound' ? <ArrowLeft className="h-4 w-4 shrink-0 text-emerald-500" /> : <ArrowRight className="h-4 w-4 shrink-0 text-blue-500" />}
                        <span className="truncate">{conv.message_type !== 'text' ? `[${conv.message_type}]` : (conv.message_text || conv.from_phone)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(conv.created_at).toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US')}
                    </td>
                    <td className="px-6 py-4">
                      {conv.order_confirmed ? (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                          {t('conversations.orderCaptured')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                          {t('conversations.inbound')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Slide-in Panel */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedCustomerId(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-e border-slate-200 dark:border-slate-800 z-10 animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <span className={cn('h-3 w-3 rounded-full', getChannelColor(timelineMessages[0]?.channel))} />
                <div>
                  <h2 dir="ltr" className="font-bold text-base text-slate-900 dark:text-slate-100 truncate text-left font-mono">{selectedCustomerId}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('conversations.chatTimeline')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomerId(null)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {timelineLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : timelineMessages.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 my-auto flex flex-col items-center">
                  <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                  <p>{t('common.empty')}</p>
                </div>
              ) : (
                timelineMessages.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isInbound ? "self-start items-start" : "self-end items-end")}>
                      <div className={cn("px-4 py-2.5 rounded-2xl text-sm shadow-xs", isInbound ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-ss-xs" : "bg-emerald-600 text-white rounded-se-xs")}>
                        {msg.message_type !== 'text' ? (
                          <span className="font-semibold uppercase text-xs opacity-80">[{msg.message_type}]</span>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message_text}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-JO' : 'en-US', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
