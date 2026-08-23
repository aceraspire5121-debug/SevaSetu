import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import InstantVideoCallModal from './InstantVideoCallModal';

const Navbar = () => {
  const { user, worker, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenVideoCall = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'worker') {
      return;
    }
    setShowVideoModal(true);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'customer') return '/my-bookings';
    if (user.role === 'worker') {
      if (worker && worker.approvalStatus !== 'approved') {
        return '/worker-pending';
      }
      return '/worker-dashboard';
    }
    if (user.role === 'societyAdmin') return '/society-dashboard';
    if (user.role === 'federationAdmin') return '/federation-dashboard';
    return '/my-bookings';
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      {/* Sleek Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-sans transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-teal-950 to-teal-800 bg-clip-text text-transparent">
                  {t('brand')}
                </span>
                <span className="block text-[9px] font-black uppercase tracking-widest text-amber-600 -mt-1">
                  {t('tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
              {user && user.role === 'customer' && (
                <>
                  <Link
                    to="/"
                    className={`flex items-center gap-1.5 transition-colors ${
                      isActivePath('/') ? 'text-teal-800 font-black' : 'hover:text-teal-700'
                    }`}
                  >
                    <HomeIcon className="w-3.5 h-3.5" />
                    {t('home')}
                  </Link>
                  <Link
                    to="/explore-services"
                    className={`flex items-center gap-1.5 transition-colors ${
                      isActivePath('/explore-services') ? 'text-teal-800 font-black' : 'hover:text-teal-700'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    {t('exploreServices')}
                  </Link>
                  <Link
                    to="/my-bookings"
                    className={`flex items-center gap-1.5 transition-colors ${
                      isActivePath('/my-bookings') ? 'text-teal-800 font-black' : 'hover:text-teal-700'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {t('myBookings')}
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <Link
                    to="/"
                    className={`transition-colors ${
                      isActivePath('/') ? 'text-teal-800 font-black' : 'hover:text-teal-700'
                    }`}
                  >
                    {t('home')}
                  </Link>
                  <Link
                    to="/explore-services"
                    className={`transition-colors ${
                      isActivePath('/explore-services') ? 'text-teal-800 font-black' : 'hover:text-teal-700'
                    }`}
                  >
                    {t('exploreServices')}
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Video Help Button (Hidden for Worker Role) */}
              {user?.role !== 'worker' && (
                <button
                  type="button"
                  onClick={handleOpenVideoCall}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 hover:from-teal-900 hover:to-slate-800 text-white text-xs font-black shadow-sm transition-all border border-teal-500/40 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Video className="w-3.5 h-3.5 text-teal-300" />
                  <span>Video Help</span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                    ₹49
                  </span>
                </button>
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.role === 'customer' && 'Customer'}
                    {user.role === 'worker' && 'Worker'}
                    {user.role === 'societyAdmin' && 'Admin'}
                    {user.role === 'federationAdmin' && 'Super Admin'}
                  </span>

                  <Link
                    to={getRoleDashboardLink()}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-teal-600 shadow-2xs"
                    />
                    <span className="hidden lg:inline text-xs font-extrabold text-slate-800">
                      {user.name}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-black text-slate-700 hover:text-teal-700 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 rounded-xl shadow-sm transition-all"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header Bar Right: Language Switcher Button + Hamburger Menu Trigger */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Language Switcher on Mobile Header */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
              </button>

              {/* Hamburger Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ULTRA-MODERN SLIDING MOBILE DRAWER SHEET */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding Sheet Panel */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="space-y-6">
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span className="font-black text-slate-900 text-lg tracking-tight">{t('brand')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card inside Drawer (if logged in) */}
              {user && (
                <div className="p-3.5 bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl space-y-2 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-black truncate">{user.name}</h4>
                      <p className="text-[10px] text-teal-200 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                    <span className="font-bold text-amber-300 capitalize">Role: {user.role}</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 font-bold border border-teal-400/30">
                      Verified Member
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Drawer Navigation Links */}
              <div className="space-y-1 text-xs font-bold">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block px-1 mb-2">
                  Navigation Menu
                </span>

                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isActivePath('/') ? 'bg-teal-50 text-teal-900 font-black border border-teal-200' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HomeIcon className="w-4 h-4 text-teal-600" />
                    <span>{t('home')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/explore-services"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isActivePath('/explore-services') ? 'bg-teal-50 text-teal-900 font-black border border-teal-200' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-teal-600" />
                    <span>{t('exploreServices')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                {user && user.role === 'customer' && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isActivePath('/my-bookings') ? 'bg-teal-50 text-teal-900 font-black border border-teal-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                      <span>{t('myBookings')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                )}

                {user && (
                  <Link
                    to={getRoleDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white font-black shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-teal-300" />
                      <span>Role Dashboard</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </Link>
                )}
              </div>

              {/* Instant Video Guidance Banner in Drawer (Hidden for Worker Role) */}
              {user?.role !== 'worker' && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenVideoCall();
                  }}
                  className="w-full p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-black text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-amber-600" />
                      Instant Video Call Help
                    </span>
                    <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                      ₹49
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    Connect with verified technician in 60 seconds for live triage.
                  </p>
                </button>
              )}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Language: {language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold text-xs transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Account</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-black text-slate-700 bg-slate-100 rounded-xl"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-black text-white bg-teal-600 rounded-xl shadow-sm"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM MOBILE FLOATING NAVIGATION DOCK (Native iOS App Style) */}
      <div className="fixed bottom-3 inset-x-3 z-40 md:hidden bg-slate-950/90 text-white backdrop-blur-xl border border-slate-800/80 rounded-full px-2 py-2 shadow-2xl flex justify-around items-center text-[10px] font-bold">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors ${
            isActivePath('/') ? 'text-teal-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          to="/explore-services"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors ${
            isActivePath('/explore-services') ? 'text-teal-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Services</span>
        </Link>

        <Link
          to={getRoleDashboardLink()}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors ${
            isActivePath(getRoleDashboardLink()) ? 'text-teal-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          {user?.role === 'customer' ? (
            <CheckSquare className="w-4 h-4 text-teal-300" />
          ) : (
            <LayoutDashboard className="w-4 h-4 text-teal-300" />
          )}
          <span>{user?.role === 'customer' ? 'Bookings' : 'Dashboard'}</span>
        </Link>

        {user ? (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-300 rounded-full"
          >
            <User className="w-4 h-4 text-amber-300" />
            <span className="truncate max-w-[50px]">{user.name.split(' ')[0]}</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-amber-400 rounded-full font-black"
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </Link>
        )}
      </div>

      {/* Global Instant Video Call Modal */}
      <InstantVideoCallModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </>
  );
};

export default Navbar;
