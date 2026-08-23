import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HeartHandshake, LogIn, Key, Sparkles, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const user = res.user;
      if (user.role === 'worker') {
        if (res.worker && res.worker.approvalStatus === 'pending') {
          navigate('/worker-pending');
        } else {
          navigate('/worker-dashboard');
        }
      } else if (user.role === 'societyAdmin') {
        navigate('/society-dashboard');
      } else if (user.role === 'federationAdmin') {
        navigate('/federation-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword, roleLabel) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setInfoMsg(`Filled ${roleLabel} credentials into form below. Click 'Login' to enter.`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-8 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 mx-auto mb-3 flex items-center justify-center border border-teal-400/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold">{t('login')} to {t('brand')}</h2>
          <p className="text-xs text-teal-200 mt-1">Access your cooperative account portal</p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-teal-50 text-teal-800 text-xs rounded-xl border border-teal-200 flex items-start gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Quick Demo Credentials Autofill Box */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Autofill Demo Role Credentials:
              </span>
              <span className="text-[10px] text-amber-700 font-semibold">1-Tap Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'customer', label: '👤 Customer', email: 'customer@sevasetu.org', password: 'password123', name: 'Customer' },
                { id: 'worker_approved', label: '🛠 Worker (Approved)', email: 'worker.ramesh@sevasetu.org', password: 'password123', name: 'Approved Worker' },
                { id: 'worker_pending', label: '⏳ Worker (Pending)', email: 'worker.pending@sevasetu.org', password: 'password123', name: 'Pending Worker' },
                { id: 'admin_mumbai', label: '🏢 Admin (Mumbai)', email: 'societyadmin@sevasetu.org', password: 'password123', name: 'Admin (Mumbai)' },
                { id: 'admin_delhi', label: '🏛 Admin (Delhi)', email: 'delhi.admin@sevasetu.org', password: 'password123', name: 'Admin (Delhi)' },
                { id: 'super_admin', label: '👑 Super Admin', email: 'fedadmin@sevasetu.org', password: 'password123', name: 'Super Admin' },
              ].map((acc) => {
                const isSelected = email.toLowerCase().trim() === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleFillDemo(acc.email, acc.password, acc.name)}
                    className={`px-2.5 py-2 rounded-xl text-left transition-all truncate cursor-pointer font-bold border ${
                      isSelected
                        ? 'bg-slate-900 text-amber-300 border-slate-950 shadow-md ring-2 ring-teal-600 ring-offset-1 scale-[1.02]'
                        : 'bg-white hover:bg-amber-100/70 text-slate-800 border-amber-200 hover:border-amber-300 shadow-2xs'
                    }`}
                  >
                    {acc.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@sevasetu.org"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-700 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
