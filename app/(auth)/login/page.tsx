'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Key,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Modal from '@/components/ui/Modal';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { useTranslation } from '@/lib/LanguageContext';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, dir } = useTranslation();

  // Modals state
  const [isEmailCodeModalOpen, setIsEmailCodeModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Main login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Email Code Modal fields
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpCodeSent, setOtpCodeSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // Forgot Password Modal fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotCodeSent, setForgotCodeSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotResendTimer, setForgotResendTimer] = useState(0);

  // Cooldown timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpResendTimer > 0) {
      interval = setInterval(() => setOtpResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (forgotResendTimer > 0) {
      interval = setInterval(() => setForgotResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [forgotResendTimer]);

  // Helper to validate email or silent admin username
  const isValidEmailOrAdmin = (input: string): boolean => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === 'admin') return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  // 1. Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!isValidEmailOrAdmin(loginEmail)) {
      setLoginError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'فشل تسجيل الدخول. تحقق من صحة البيانات المدخلة.' : 'Invalid credentials. Please verify your email and password.'));
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setLoginError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during sign in'));
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. Open Email Code Modal
  const openEmailCodeModal = () => {
    setOtpEmail(loginEmail);
    setOtpCode('');
    setOtpCodeSent(false);
    setOtpError('');
    setOtpSuccess('');
    setIsEmailCodeModalOpen(true);
  };

  // Send OTP Code
  const handleSendOtpCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    if (!otpEmail || !otpEmail.includes('@')) {
      setOtpError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, type: 'login_code' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'تعذر إرسال رمز التحقق' : 'Failed to send verification code'));
      }

      setOtpCodeSent(true);
      setOtpResendTimer(60);
      setOtpSuccess(data.message || (lang === 'ar' ? 'تم إرسال رمز الدخول المكون من 6 أرقام إلى بريدك الإلكتروني' : 'Verification code sent to your email address'));
    } catch (err: any) {
      setOtpError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء إرسال الرمز' : 'An error occurred sending the code'));
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP Code & Login
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the 6-digit verification code');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' : 'Invalid or expired verification code'));
      }

      setIsEmailCodeModalOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setOtpError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء التحقق من الرمز' : 'An error occurred verifying the code'));
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Open Forgot Password Modal
  const openForgotModal = () => {
    setForgotEmail(loginEmail);
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotCodeSent(false);
    setForgotError('');
    setForgotSuccess('');
    setIsForgotModalOpen(true);
  };

  // Send Reset Password Code
  const handleSendForgotCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, type: 'reset_password' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'تعذر إرسال رمز إعادة التعيين' : 'Failed to send reset code'));
      }

      setForgotCodeSent(true);
      setForgotResendTimer(60);
      setForgotSuccess(data.message || (lang === 'ar' ? 'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني' : 'Password reset code sent to your email'));
    } catch (err: any) {
      setForgotError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء إرسال الرمز' : 'An error occurred sending the reset code'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Verify Reset Code & Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotCode || forgotCode.trim().length !== 6) {
      setForgotError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the 6-digit verification code');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError(t('auth.passwordTooShort'));
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'فشل إعادة تعيين كلمة المرور' : 'Failed to reset password'));
      }

      setForgotSuccess(t('auth.resetSuccess'));
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setLoginEmail(forgotEmail);
        setLoginPassword('');
      }, 1200);

    } catch (err: any) {
      setForgotError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء إعادة تعيين كلمة المرور' : 'An error occurred resetting password'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Interactive 3D Card Tilt Physics
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const normY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      // Subtle 3D tilt angles
      targetTiltX = -normY * 10;
      targetTiltY = normX * 10;
    };

    const handleMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const updateTilt = () => {
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(10px)`;
      }
      rafId = requestAnimationFrame(updateTilt);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(updateTilt);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden" style={{ perspective: '1200px' }}>
      {/* Interactive 3D Background with Canvas Particles & 3D Icons */}
      <AnimatedBackground />

      {/* Top Floating Language Switcher & Dark Mode Toggle */}
      <div className="fixed top-5 end-5 z-20 flex items-center gap-2">
        <ThemeToggle variant="button" />
        <LanguageSwitcher variant="button" />
      </div>

      {/* Main Interactive 3D Login Card */}
      <div 
        ref={cardRef}
        className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60 dark:border-slate-800 transition-transform duration-150 ease-out relative z-10 will-change-transform"
        style={{
          boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.7), 0 10px 30px -10px rgba(0, 0, 0, 0.08)',
          transformStyle: 'preserve-3d'
        }}
      >
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 mb-1 tracking-tight">
            {t('auth.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {loginError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-sm rounded-xl border border-rose-200 dark:border-rose-800 text-center font-medium animate-fade-in">
            <span>{loginError}</span>
          </div>
        )}

        {/* Standard Password Login Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block" htmlFor="email">
              {t('auth.emailLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="text"
                required
                className="w-full ps-10 pe-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                placeholder={t('auth.emailPlaceholder')}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block" htmlFor="password">
                {t('auth.passwordLabel')}
              </label>
              {/* BUTTON 1: Forgot Password Modal Trigger */}
              <button
                type="button"
                onClick={openForgotModal}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full ps-10 pe-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                placeholder={t('auth.passwordPlaceholder')}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className={cn(
              "w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium text-sm transition-all shadow-sm",
              "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]",
              loginLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loginLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('auth.signInLoading')}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>{t('auth.signIn')}</span>
              </>
            )}
          </button>

          {/* Separator */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">{t('auth.or')}</span>
            </div>
          </div>

          {/* BUTTON 2: Login with Email Code Modal Trigger */}
          <button
            type="button"
            onClick={openEmailCodeModal}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('auth.loginWithCode')}</span>
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL 1: LOGIN WITH EMAIL CODE (OTP)                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEmailCodeModalOpen}
        onClose={() => setIsEmailCodeModalOpen(false)}
        title={t('auth.otpTitle')}
        size="md"
      >
        <div className="space-y-4">
          {otpError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 text-center font-medium">
              {otpError}
            </div>
          )}

          {otpSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 text-center font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{otpSuccess}</span>
            </div>
          )}

          {!otpCodeSent ? (
            // Step 1: Request Code
            <form onSubmit={handleSendOtpCode} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('auth.otpDesc')}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block" htmlFor="popup-otp-email">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="popup-otp-email"
                    type="email"
                    required
                    autoFocus
                    className="w-full ps-10 pe-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                    placeholder={t('auth.emailPlaceholder')}
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className={cn(
                  "w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium text-sm transition-all shadow-sm",
                  "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]",
                  otpLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('auth.sendingCode')}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>{t('auth.sendCodeBtn')}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Step 2: Enter & Verify Code
            <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
              <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/50 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  {t('auth.codeSentTo')} <strong className="text-slate-900 dark:text-slate-100 dir-ltr font-mono">{otpEmail}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCodeSent(false);
                    setOtpCode('');
                  }}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block text-center" htmlFor="popup-otp-code">
                  {t('auth.otpCodeLabel')}
                </label>
                <input
                  id="popup-otp-code"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full py-3 text-center tracking-[8px] font-mono text-2xl font-bold bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100"
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className={cn(
                  "w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium text-sm transition-all shadow-sm",
                  "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]",
                  (otpLoading || otpCode.length !== 6) && "opacity-70 cursor-not-allowed"
                )}
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('auth.verifying')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t('auth.verifyAndLoginBtn')}</span>
                  </>
                )}
              </button>

              {/* Resend button */}
              <div className="text-center pt-1">
                {otpResendTimer > 0 ? (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {t('auth.resendIn')} <strong className="text-slate-600 dark:text-slate-300">{otpResendTimer}</strong> {t('auth.seconds')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtpCode()}
                    disabled={otpLoading}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('auth.resendCodeBtn')}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* POPUP MODAL 2: FORGOT PASSWORD                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title={t('auth.forgotTitle')}
        size="md"
      >
        <div className="space-y-4">
          {forgotError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 text-center font-medium">
              {forgotError}
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 text-center font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {!forgotCodeSent ? (
            // Step 1: Request Reset Code
            <form onSubmit={handleSendForgotCode} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('auth.forgotDesc')}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block" htmlFor="popup-forgot-email">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="popup-forgot-email"
                    type="email"
                    required
                    autoFocus
                    className="w-full ps-10 pe-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                    placeholder={t('auth.emailPlaceholder')}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className={cn(
                  "w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium text-sm transition-all shadow-sm",
                  "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]",
                  forgotLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('auth.sendingCode')}</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    <span>{t('auth.sendResetCodeBtn')}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Step 2: Enter Code and New Passwords
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  {t('auth.codeSentTo')} <strong className="text-slate-900 dark:text-slate-100 dir-ltr font-mono">{forgotEmail}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotCodeSent(false);
                    setForgotCode('');
                  }}
                  className="text-emerald-800 dark:text-emerald-400 hover:underline font-semibold"
                >
                  {t('auth.changeEmail')}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block text-center" htmlFor="popup-forgot-code">
                  {t('auth.otpCodeLabel')}
                </label>
                <input
                  id="popup-forgot-code"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full py-2.5 text-center tracking-[6px] font-mono text-xl font-bold bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100"
                  placeholder="••••••"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block" htmlFor="popup-new-password">
                  {t('auth.newPasswordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="popup-new-password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full ps-10 pe-3 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                    placeholder={t('auth.newPasswordPlaceholder')}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block" htmlFor="popup-confirm-password">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="popup-confirm-password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full ps-10 pe-3 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading || forgotCode.length !== 6 || forgotNewPassword.length < 6}
                className={cn(
                  "w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-white font-medium text-sm transition-all shadow-sm mt-2",
                  "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]",
                  (forgotLoading || forgotCode.length !== 6 || forgotNewPassword.length < 6) && "opacity-70 cursor-not-allowed"
                )}
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('auth.updatingPassword')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('auth.resetPasswordBtn')}</span>
                  </>
                )}
              </button>

              {/* Resend button */}
              <div className="text-center pt-1">
                {forgotResendTimer > 0 ? (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {t('auth.resendIn')} <strong className="text-slate-600 dark:text-slate-300">{forgotResendTimer}</strong> {t('auth.seconds')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendForgotCode()}
                    disabled={forgotLoading}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('auth.resendCodeBtn')}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </Modal>

    </div>
  );
}
