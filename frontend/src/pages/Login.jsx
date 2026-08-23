import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col justify-between items-center px-4 py-8 font-sans">
      <div className="w-full max-w-sm mx-auto space-y-5">
        {/* 1. Centered Brand Logo (Matching Screenshot 3) */}
        <div className="flex justify-center pt-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-base tracking-wider font-sans select-none">
                SS
              </span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              SevaSetu
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            </span>
          </Link>
        </div>

        {/* 2. Amazon-style Clean Login Card (Matching Screenshot 2 & 4) */}
        <div className="bg-white border border-slate-300/80 rounded-2xl p-7 shadow-xs space-y-5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in
          </h1>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@sevasetu.org"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Password Input with Forgot Password Link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Password
                </label>
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
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Submit / Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Legal / Policy Note */}
          <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
            By continuing, you agree to SevaSetu's{' '}
            <span className="text-teal-700 hover:underline cursor-pointer">Conditions of Use</span> and{' '}
            <span className="text-teal-700 hover:underline cursor-pointer">Privacy Notice</span>.
          </p>

          <hr className="border-slate-200" />

          {/* Registration Link */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-700 font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Amazon-style Footer Links */}
      <footer className="w-full max-w-sm mx-auto text-center pt-8 pb-2 space-y-2 border-t border-slate-100 mt-6">
        <div className="flex items-center justify-center gap-6 text-xs text-teal-700 font-semibold">
          <Link to="/" className="hover:underline">Conditions of Use</Link>
          <Link to="/" className="hover:underline">Privacy Notice</Link>
          <Link to="/" className="hover:underline">Help</Link>
        </div>
        <p className="text-[11px] text-slate-400">
          © 2026 SevaSetu Cooperative Home Services Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Login;
