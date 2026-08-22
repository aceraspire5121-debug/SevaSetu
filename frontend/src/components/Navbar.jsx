import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, User, LogOut, Globe, Zap, Building2, LayoutDashboard, HeartHandshake, Home as HomeIcon, Briefcase, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const { user, worker, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'worker') {
      if (worker && worker.approvalStatus !== 'approved') {
        return '/worker-pending';
      }
      return '/worker-dashboard';
    }
    if (user.role === 'societyAdmin') return '/society-dashboard';
    if (user.role === 'federationAdmin') return '/federation-dashboard';
    return '/explore-services';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                {t('brand')}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-600 -mt-1">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {/* Customer Links */}
            {user && user.role === 'customer' && (
              <>
                <Link to="/" className="hover:text-teal-700 transition-colors flex items-center gap-1">
                  <HomeIcon className="w-3.5 h-3.5" />
                  {t('home')}
                </Link>
                <Link to="/explore-services" className="hover:text-teal-700 transition-colors flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {t('exploreServices')}
                </Link>
                <Link to="/my-bookings" className="hover:text-teal-700 transition-colors flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  My Bookings
                </Link>
              </>
            )}
            {!user && (
              <Link to="/" className="hover:text-teal-700 transition-colors">
                {t('home')}
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role === 'customer' && 'Customer'}
                  {user.role === 'worker' && 'Worker'}
                  {user.role === 'societyAdmin' && 'Society Admin'}
                  {user.role === 'federationAdmin' && 'Federation Admin'}
                </span>

                <Link
                  to={getRoleDashboardLink()}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-teal-500"
                  />
                  <span className="hidden lg:inline text-xs font-semibold text-slate-800">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
