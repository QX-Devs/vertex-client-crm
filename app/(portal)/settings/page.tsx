'use client';

import { useState, useEffect } from 'react';
import { Settings, BookOpen, Plus, Edit3, Trash2, Save, ToggleLeft, ToggleRight, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import LoadingModal from '@/components/ui/LoadingModal';
import { useTranslation } from '@/lib/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'service' | 'kb'>('service');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  
  // KB Modal state
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentKbSection, setCurrentKbSection] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
        setKnowledgeBase(data.knowledgeBase || []);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getBookingFieldsArray = (fields: any): string[] => {
    if (!fields) return [];
    if (Array.isArray(fields)) return fields.map((f: any) => String(f).trim()).filter(Boolean);
    if (typeof fields === 'string') return fields.split(',').map((f) => f.trim()).filter(Boolean);
    return [];
  };

  const getBookingFieldsString = (fields: any): string => {
    if (!fields) return '';
    if (Array.isArray(fields)) return fields.join(', ');
    if (typeof fields === 'string') return fields;
    return '';
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        action: 'update_settings',
        ...settings,
        booking_required_fields: getBookingFieldsArray(settings.booking_required_fields),
      };

      const res = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(t('common.savedSuccessfully'));
      }
    } catch (error) {
      console.error('Failed to save settings', error);
      showToast(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleKbSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const action = currentKbSection.id ? 'update_kb_section' : 'add_kb_section';
      const res = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...currentKbSection })
      });
      if (res.ok) {
        showToast(t('common.savedSuccessfully'));
        setIsKbModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save KB section', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKbDelete = async () => {
    if (!currentKbSection?.id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_kb_section', id: currentKbSection.id })
      });
      if (res.ok) {
        showToast(t('common.savedSuccessfully'));
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete KB section', error);
    } finally {
      setSaving(false);
    }
  };

  const openAddKbModal = () => {
    setCurrentKbSection({ section_key: '', content: '', enabled: true });
    setIsKbModalOpen(true);
  };

  const openEditKbModal = (section: any) => {
    setCurrentKbSection({ ...section });
    setIsKbModalOpen(true);
  };

  const openDeleteKbModal = (section: any) => {
    setCurrentKbSection(section);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return <LoadingModal />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('settings.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.subtitle')}</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          className={cn(
            "flex items-center gap-2 py-3.5 px-6 border-b-2 font-semibold text-sm transition-all",
            activeTab === 'service' ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
          onClick={() => setActiveTab('service')}
        >
          <Settings className="w-4 h-4" />
          <span>{t('settings.tabService')}</span>
        </button>
        <button
          className={cn(
            "flex items-center gap-2 py-3.5 px-6 border-b-2 font-semibold text-sm transition-all",
            activeTab === 'kb' ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
          onClick={() => setActiveTab('kb')}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('settings.tabKnowledge')}</span>
        </button>
      </div>

      {activeTab === 'service' && (
        <form onSubmit={handleSettingsSave} className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 transition-colors">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.serviceDescLabel')}</label>
            <textarea 
              rows={4} 
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              placeholder={t('settings.serviceDescPlaceholder')}
              value={settings.service_description || ''}
              onChange={(e) => setSettings({...settings, service_description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.pricingRulesLabel')}</label>
              <textarea 
                rows={3} 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                placeholder={t('settings.pricingRulesPlaceholder')}
                value={settings.pricing_rules || ''}
                onChange={(e) => setSettings({...settings, pricing_rules: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.coverageRulesLabel')}</label>
              <textarea 
                rows={3} 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                placeholder={t('settings.coverageRulesPlaceholder')}
                value={settings.coverage_rules || ''}
                onChange={(e) => setSettings({...settings, coverage_rules: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.fallbackResponseLabel')}</label>
              <input 
                type="text" 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                placeholder={t('settings.fallbackResponsePlaceholder')}
                value={settings.fallback_response || ''}
                onChange={(e) => setSettings({...settings, fallback_response: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.escalationKeywordLabel')}</label>
              <input 
                type="text" 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                placeholder={t('settings.escalationKeywordPlaceholder')}
                value={settings.escalation_keyword || ''}
                onChange={(e) => setSettings({...settings, escalation_keyword: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.humanPhoneLabel')}</label>
              <input 
                dir="ltr"
                type="tel" 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-left font-mono transition-colors"
                placeholder={t('settings.humanPhonePlaceholder')}
                value={settings.human_agent_phone || ''}
                onChange={(e) => setSettings({...settings, human_agent_phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.bookingFieldsLabel')}</label>
              <input 
                dir="ltr"
                type="text" 
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-left font-mono transition-colors"
                placeholder={t('settings.bookingFieldsPlaceholder')}
                value={getBookingFieldsString(settings.booking_required_fields)}
                onChange={(e) => setSettings({...settings, booking_required_fields: e.target.value})}
              />
              <div className="flex gap-1.5 flex-wrap mt-2">
                {getBookingFieldsArray(settings.booking_required_fields).map((f: string, i: number) => (
                  <span key={i} dir="ltr" className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 rounded-full text-xs font-medium font-mono">{f}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium text-sm transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t('common.saving') : t('common.save')}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'kb' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('settings.knowledgeBase')}</h2>
            <button
              onClick={openAddKbModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('settings.addSection')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeBase.map((section) => (
              <div key={section.id} className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:shadow-md dark:hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{section.section_key}</h3>
                  <div className="flex items-center">
                    {section.enabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 flex-grow overflow-hidden text-ellipsis line-clamp-3 leading-relaxed">
                  {section.content}
                </p>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditKbModal(section)}
                    className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteKbModal(section)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {knowledgeBase.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p>{t('settings.noKnowledgeSections')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KB Modal */}
      <Modal isOpen={isKbModalOpen} onClose={() => setIsKbModalOpen(false)} title={currentKbSection?.id ? t('settings.editSection') : t('settings.addSection')}>
        <form onSubmit={handleKbSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.sectionKey')}</label>
            <input 
              type="text" 
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder={t('settings.sectionKeyPlaceholder')}
              value={currentKbSection?.section_key || ''}
              onChange={(e) => setCurrentKbSection({...currentKbSection, section_key: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.sectionContent')}</label>
            <textarea 
              rows={6} 
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder={t('settings.sectionContentPlaceholder')}
              value={currentKbSection?.content || ''}
              onChange={(e) => setCurrentKbSection({...currentKbSection, content: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="kb-enabled"
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              checked={currentKbSection?.enabled ?? true}
              onChange={(e) => setCurrentKbSection({...currentKbSection, enabled: e.target.checked})}
            />
            <label htmlFor="kb-enabled" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.sectionEnabled')}</label>
          </div>
          <div className="flex justify-end pt-4 gap-3 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="button" 
              onClick={() => setIsKbModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('settings.deleteConfirmTitle')}>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {t('settings.deleteConfirmDesc')}
          </p>
          <div className="flex justify-end pt-4 gap-3 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="button" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="button" 
              onClick={handleKbDelete}
              disabled={saving}
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
            >
              {saving ? t('common.saving') : t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}
