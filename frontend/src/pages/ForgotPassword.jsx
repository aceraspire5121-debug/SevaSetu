import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import {
  HeartHandshake,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Send,
} from 'lucide-react';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid registered email address');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      if (res.data.success) {
        setIsSubmitted(true);
        setSuccessMessage(
          res.data.message ||
            'If an account exists with this email address, a password reset link has been sent.'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to send password reset email. Please verify your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 mx-auto flex items-center justify-center border border-teal-400/30 shadow-inner">
              <KeyRound className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Reset Password</h2>
            <p className="text-xs text-teal-200 max-w-xs mx-auto">
              Democratic Cooperative Platform account security & recovery
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email (e.g. user@domain.com)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 transition-all font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  We'll send a secure, one-time password reset link to this email address valid for 15 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SUCCESS CONFIRMATION MODAL STATE */
            <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Check Your Inbox!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {successMessage}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-left space-y-1 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Next Steps:
                </span>
                <ul className="text-[11px] text-amber-950 space-y-0.5 list-disc pl-4">
                  <li>Click the secure link in the email to set your new password.</li>
                  <li>Link expires in <strong>15 minutes</strong> for your security.</li>
                  <li>If you don't see it, please check your <strong>Spam / Junk</strong> folder.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold hover:underline"
              >
                Send to another email address
              </button>
            </div>
          )}

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
