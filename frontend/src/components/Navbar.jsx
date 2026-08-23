import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  User,
  LogOut,
  Globe,
  Zap,
  Building2,
  LayoutDashboard,
  HeartHandshake,
  Home as HomeIcon,
  Briefcase,
  CheckSquare,
  Video,
  Menu,
  X,
} from 'lucide-react';
import InstantVideoCallModal from './InstantVideoCallModal';

const Navbar = () => {
  const { user, worker, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm font-sans">
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
                    {t('myBookings')}
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
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Instant Live Video Help Button */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 hover:from-teal-800 hover:to-slate-800 text-white text-xs font-black shadow-sm transition-all border border-teal-500/40 cursor-pointer"
                title="Connect with verified technician on live video call in 60s"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Video className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">Video Help</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                  ₹49
                </span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
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
                    {user.role === 'societyAdmin' && 'Admin'}
                    {user.role === 'federationAdmin' && 'Super Admin'}
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
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-fadeIn">
            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-2 font-medium text-slate-700 text-sm">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-teal-50 hover:text-teal-800 transition-colors"
              >
                <HomeIcon className="w-4 h-4 text-teal-600" />
                {t('home')}
              </Link>
              <Link
                to="/explore-services"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-teal-50 hover:text-teal-800 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-teal-600" />
                {t('exploreServices')}
              </Link>

              {user && user.role === 'customer' && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-teal-50 hover:text-teal-800 transition-colors"
                >
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  {t('myBookings')}
                </Link>
              )}

              {user && (
                <Link
                  to={getRoleDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl bg-teal-50 font-bold text-teal-900 border border-teal-200 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-700" />
                  <span>Dashboard ({user.role})</span>
                </Link>
              )}
            </div>

            {/* Mobile Actions & User Status */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowVideoModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-md"
              >
                <Video className="w-4 h-4 text-teal-300" />
                <span>Instant Video Call Help (₹49)</span>
              </button>

              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Switch Language: {language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold text-xs transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout ({user.name})</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-white bg-teal-600 rounded-xl shadow-sm"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Instant Video Call Modal */}
      <InstantVideoCallModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </>
  );
};

export default Navbar;
