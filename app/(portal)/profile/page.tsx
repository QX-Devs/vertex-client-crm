'use client';

import { useState, useEffect } from 'react';
import { User, Building2, Phone, Mail, Globe, Languages, Save, Shield, Calendar } from 'lucide-react';
import LoadingModal from '@/components/ui/LoadingModal';
import Toast from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import { useTranslation } from '@/lib/LanguageContext';

export default function ProfilePage() {
  const { t, lang } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/client/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.client);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: profile.business_name,
          owner_phone: profile.owner_phone,
          owner_email: profile.owner_email,
          timezone: profile.timezone,
          language: profile.language,
          reply_tone: profile.reply_tone
        })
      });
      
      if (res.ok) {
        showToast(t('common.savedSuccessfully'));
        const data = await res.json();
        setProfile(data.client);
      } else {
        showToast(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      showToast(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <LoadingModal />;
  }

  if (!profile) return <div className="p-8 text-center text-rose-500 dark:text-rose-400">{t('common.empty')}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('profile.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t('profile.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Editable Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('profile.businessName')}
                </label>
                <input 
                  type="text"
                  name="business_name"
                  value={profile.business_name || ''}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('profile.ownerEmail')}
                </label>
                <input 
                  dir="ltr"
                  type="email"
                  name="owner_email"
                  value={profile.owner_email || ''}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-left font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('profile.ownerPhone')}
                </label>
                <input 
                  dir="ltr"
                  type="tel"
                  name="owner_phone"
                  value={profile.owner_phone || ''}
                  onChange={handleChange}
                  placeholder="+962 7 XXXX XXXX"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-left font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.replyTone')}</label>
                <input 
                  type="text"
                  name="reply_tone"
                  value={profile.reply_tone || ''}
                  onChange={handleChange}
                  placeholder={t('profile.replyTonePlaceholder')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('profile.timezone')}
                </label>
                <select 
                  name="timezone"
                  value={profile.timezone || 'UTC'}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium transition-colors"
                >
                  <option value="Asia/Amman">Asia/Amman</option>
                  <option value="Asia/Riyadh">Asia/Riyadh</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Africa/Cairo">Africa/Cairo</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('profile.language')}
                </label>
                <select 
                  name="language"
                  value={profile.language || 'ar-JO'}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium transition-colors"
                >
                  <option value="ar-JO">العربية (الأردن)</option>
                  <option value="ar-SA">العربية (السعودية)</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:outline-none transition-all shadow-sm font-medium text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? t('common.saving') : t('profile.saveProfile')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Read-only Information Section */}
        <div className="bg-slate-50/70 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 self-start space-y-6 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 text-sm">{t('profile.accountInfo')}</h3>
          
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('profile.clientId')}</span>
              <code dir="ltr" className="text-xs px-2.5 py-1.5 bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg block w-full truncate font-mono text-left">
                {profile.client_id}
              </code>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('common.status')}</span>
              <StatusBadge status={profile.status} />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('usage.planName')}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
                {profile.plan_id}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('profile.serviceType')}</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{profile.service_type || 'N/A'}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {t('profile.memberSince')}
              </span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}
