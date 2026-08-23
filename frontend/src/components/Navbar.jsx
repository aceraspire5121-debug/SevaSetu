import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import {
  ShoppingCart,
  User as UserIcon,
  ChevronDown,
  Globe,
  Video,
  LogOut,
  ShieldCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import InstantVideoCallModal from './InstantVideoCallModal';

const Navbar = () => {
  const { user, worker, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  const profileDropdownRef = useRef(null);

  // Fetch Live Active Bookings Count for Cart Badge
  useEffect(() => {
    if (!user) {
      setActiveBookingsCount(0);
      return;
    }

    const fetchActiveBookings = async () => {
      try {
        const res = await api.get('/bookings');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const active = res.data.data.filter(
            (b) => b && ['requested', 'accepted', 'in_progress'].includes(b.status)
          );
          setActiveBookingsCount(active.length);
        }
      } catch (err) {
        console.warn('Could not fetch active bookings count:', err.message);
      }
    };

    fetchActiveBookings();
    const pollInterval = setInterval(fetchActiveBookings, 8000);
    return () => clearInterval(pollInterval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleServicesClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('new-and-noteworthy');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#new-and-noteworthy');
    }
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'worker') {
      if (worker && worker.approvalStatus !== 'approved') return '/worker-pending';
      return '/worker-dashboard';
    }
    if (user.role === 'societyAdmin') return '/society-dashboard';
    if (user.role === 'federationAdmin') return '/federation-dashboard';
    return '/explore-services';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] font-sans transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 py-2 gap-4">
            
            {/* 1. LEFT: Crisp White 'SS' Logo & SevaSetu (No Subtitle) */}
            <div className="flex items-center gap-8 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-sm tracking-wider font-sans select-none">
                    SS
                  </span>
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  SevaSetu
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                </span>
              </Link>

              {/* Navigation Quick Links */}
              <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={handleServicesClick}
                  className="hover:text-teal-700 transition-colors py-1 hover:border-b-2 hover:border-teal-700 cursor-pointer"
                >
                  Services
                </button>
                <Link
                  to="/explore-services"
                  className="hover:text-teal-700 transition-colors py-1 hover:border-b-2 hover:border-teal-700"
                >
                  Explore Workers
                </Link>
                <Link
                  to="/explore-services?category=Electrician"
                  className="hover:text-teal-700 transition-colors py-1 hover:border-b-2 hover:border-teal-700"
                >
                  Electrician & Wiring
                </Link>
                <Link
                  to="/explore-services?category=House%20Cleaning"
                  className="hover:text-teal-700 transition-colors py-1 hover:border-b-2 hover:border-teal-700"
                >
                  Deep Cleaning
                </Link>
              </nav>
            </div>

            {/* 2. RIGHT: Video Help, Language Toggle, Dynamic Cart & Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              
              {/* Instant Video Consultation (₹49) */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer border border-slate-800"
                title="Connect with verified technician on live video call in 60s"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Video className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">Video Help</span>
                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md">
                  ₹49
                </span>
              </button>

              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
              </button>

              {/* Dynamic Cart / Active Bookings Button */}
              <Link
                to="/my-bookings"
                className="relative p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                title="My Bookings & Cart"
              >
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                {activeBookingsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {activeBookingsCount}
                  </span>
                )}
              </Link>

              {/* User Profile / Account Menu */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-1 rounded-xl border border-slate-200 hover:border-slate-400 flex items-center gap-2 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <img
                      src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover border border-teal-500"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email || user.phone}</p>
                        <span className="mt-1 inline-block px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold capitalize">
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to={getRoleDashboardLink()}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          Dashboard
                        </Link>
                        <Link
                          to="/my-bookings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-slate-600" />
                          My Bookings
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Login / Account"
                >
                  <UserIcon className="w-4 h-4 text-slate-700" />
                </Link>
              )}
            </div>

          </div>
        </div>
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
