'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, User, Phone, Calendar, 
  MapPin, MessageSquare, Edit3, Save, X 
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingModal } from '@/components/ui/LoadingModal';
import { useTranslation } from '@/lib/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function LeadsPage() {
  const { t, lang } = useTranslation();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal form states
  const [editStatus, setEditStatus] = useState('');
  const [editStaff, setEditStaff] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  const statusOptions = [
    { value: 'All', label: t('common.all') },
    { value: 'new', label: t('leads.statusNew') },
    { value: 'contacted', label: t('leads.statusContacted') },
    { value: 'qualified', label: t('leads.statusQualified') },
    { value: 'waiting', label: t('leads.statusWaiting') },
    { value: 'booked', label: t('leads.statusBooked') },
    { value: 'converted', label: t('leads.statusConverted') },
    { value: 'lost', label: t('leads.statusLost') },
    { value: 'closed', label: t('leads.statusClosed') }
  ];

  const channelOptions = [
    { value: 'All', label: t('common.all') },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'instagram', label: 'Instagram' }
  ];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (search) params.append('search', search);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (channelFilter !== 'All') params.append('channel', channelFilter);

      const res = await fetch(`/api/client/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search, statusFilter, channelFilter]);

  const handleRowClick = (lead: any) => {
    setSelectedLead(lead);
    setEditStatus(lead.lead_status || 'new');
    setEditStaff(lead.assigned_staff || '');
    setEditNotes(lead.notes || '');
    setNewNote('');
    setIsModalOpen(true);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    
    let updatedNotes = editNotes;
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US');
      updatedNotes = `${editNotes ? editNotes + '\n\n' : ''}[${timestamp}] ${newNote.trim()}`;
    }

    try {
      const res = await fetch(`/api/client/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_status: editStatus,
          assigned_staff: editStaff,
          notes: updatedNotes
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLeads();
      } else {
        console.error('Failed to update lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingModal />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('leads.title')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('leads.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('leads.searchPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full ps-9 pe-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-colors"
            >
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-colors"
            >
              {channelOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-start">{t('common.customer')}</th>
                <th className="px-6 py-4 text-start">{t('common.channel')}</th>
                <th className="px-6 py-4 text-start">{t('common.status')}</th>
                <th className="px-6 py-4 text-start">{t('leads.serviceRequested')}</th>
                <th className="px-6 py-4 text-start">{t('common.assignedStaff')}</th>
                <th className="px-6 py-4 text-start">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">{t('common.loading')}</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">{t('leads.noLeads')}</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => handleRowClick(lead)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div dir="ltr" className="font-semibold text-slate-900 dark:text-slate-100 text-left font-mono">{lead.customer_id || 'Customer'}</div>
                      <div dir="ltr" className="text-slate-500 dark:text-slate-400 text-xs text-left font-mono">{lead.from_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {lead.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.lead_status || 'new'} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {lead.order_payload?.service || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {lead.assigned_staff || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-800/60">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('leads.leadDetails')}
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('leads.leadDetails')}
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.customer')}:</span> <span dir="ltr" className="font-semibold font-mono text-slate-900 dark:text-slate-100 text-left inline-block">{selectedLead.customer_id}</span></p>
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.phone')}:</span> <span dir="ltr" className="font-mono text-slate-900 dark:text-slate-100 text-left inline-block">{selectedLead.from_phone}</span></p>
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.channel')}:</span> <span className="capitalize text-slate-900 dark:text-slate-100">{selectedLead.channel}</span></p>
                </div>
              </div>
              
              {selectedLead.order_payload && (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('leads.serviceRequested')}
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('leads.serviceRequested')}:</span> <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedLead.order_payload.service || '-'}</span></p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('leads.location')}:</span> <span className="text-slate-900 dark:text-slate-100">{selectedLead.order_payload.area || '-'}</span></p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.date')}:</span> <span className="text-slate-900 dark:text-slate-100">{selectedLead.order_payload.date_time || '-'}</span></p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('common.status')}</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {statusOptions.filter(s => s.value !== 'All').map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('common.assignedStaff')}</label>
                <input 
                  type="text"
                  value={editStaff}
                  onChange={(e) => setEditStaff(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('leads.notesHistory')}</label>
              <div className="w-full h-28 p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-y-auto whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                {editNotes || t('common.empty')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('leads.appendNote')}</label>
              <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('leads.appendNote')}
                className="w-full h-20 p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveLead}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{t('leads.saveLead')}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
