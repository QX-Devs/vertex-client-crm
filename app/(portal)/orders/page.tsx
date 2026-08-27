'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Calendar, MapPin, DollarSign, 
  User, Phone, Edit3, Save, X, Clock, Package 
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

export default function OrdersPage() {
  const { t, lang } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal form states
  const [editStatus, setEditStatus] = useState('');
  const [editStaff, setEditStaff] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  const statusOptions = [
    { value: 'All', label: t('common.all') },
    { value: 'Pending', label: t('orders.statusPending') },
    { value: 'Confirmed', label: t('orders.statusConfirmed') },
    { value: 'Assigned', label: t('orders.statusAssigned') },
    { value: 'In Progress', label: t('orders.statusInProgress') },
    { value: 'Completed', label: t('orders.statusCompleted') },
    { value: 'Cancelled', label: t('orders.statusCancelled') },
    { value: 'Failed', label: t('orders.statusFailed') }
  ];

  const channelOptions = [
    { value: 'All', label: t('common.all') },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'instagram', label: 'Instagram' }
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (search) params.append('search', search);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (channelFilter !== 'All') params.append('channel', channelFilter);

      const res = await fetch(`/api/client/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter, channelFilter]);

  const handleRowClick = (order: any) => {
    setSelectedOrder(order);
    setEditStatus(order.order_status || 'Pending');
    setEditStaff(order.assigned_staff || '');
    setEditNotes(order.notes || '');
    setNewNote('');
    setIsModalOpen(true);
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    
    let updatedNotes = editNotes;
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US');
      updatedNotes = `${editNotes ? editNotes + '\n\n' : ''}[${timestamp}] ${newNote.trim()}`;
    }

    try {
      const res = await fetch(`/api/client/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: editStatus,
          assigned_staff: editStaff,
          notes: updatedNotes
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchOrders();
      } else {
        console.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingModal />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('orders.title')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('orders.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder')}
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
                <th className="px-6 py-4 text-start">{t('orders.orderDetails')}</th>
                <th className="px-6 py-4 text-start">{t('orders.assignedTo')}</th>
                <th className="px-6 py-4 text-start">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">{t('common.loading')}</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">{t('orders.noOrders')}</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => handleRowClick(order)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div dir="ltr" className="font-semibold text-slate-900 dark:text-slate-100 text-left font-mono">{order.customer_id || 'Customer'}</div>
                      <div dir="ltr" className="text-slate-500 dark:text-slate-400 text-xs text-left font-mono">{order.from_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {order.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.order_status || 'Pending'} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{order.order_payload?.service || '-'}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{order.order_payload?.date_time || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {order.assigned_staff || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
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
        title={t('orders.orderDetails')}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('common.customer')}
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.customer')}:</span> <span dir="ltr" className="font-semibold font-mono text-slate-900 dark:text-slate-100 text-left inline-block">{selectedOrder.customer_id}</span></p>
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.phone')}:</span> <span dir="ltr" className="font-mono text-slate-900 dark:text-slate-100 text-left inline-block">{selectedOrder.from_phone}</span></p>
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.channel')}:</span> <span className="capitalize text-slate-900 dark:text-slate-100">{selectedOrder.channel}</span></p>
                  {selectedOrder.order_payload?.customer_name && (
                    <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('common.customer')}:</span> <span className="text-slate-900 dark:text-slate-100">{selectedOrder.order_payload.customer_name}</span></p>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase">
                  <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('orders.orderDetails')}
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('leads.serviceRequested')}:</span> <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedOrder.order_payload?.service || '-'}</span></p>
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('leads.location')}:</span> <span className="text-slate-900 dark:text-slate-100">{selectedOrder.order_payload?.area || selectedOrder.order_payload?.location || '-'}</span></p>
                  <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('orders.bookingDateTime')}:</span> <span className="text-slate-900 dark:text-slate-100">{selectedOrder.order_payload?.date_time || '-'}</span></p>
                  {selectedOrder.order_payload?.total_price && (
                    <p><span className="text-slate-500 dark:text-slate-400 font-medium">{t('orders.totalPrice')}:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedOrder.order_payload.total_price}</span></p>
                  )}
                </div>
              </div>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('orders.assignedTo')}</label>
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
                onClick={handleSaveOrder}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{t('orders.updateOrder')}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
