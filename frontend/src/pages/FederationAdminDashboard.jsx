import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DemandForecastChart from '../components/DemandForecastChart';
import SocietyRevenueChart from '../components/SocietyRevenueChart';
import SkillPassportModal from '../components/SkillPassportModal';
import {
  Building2,
  Users,
  Briefcase,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Filter,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Key,
  Mail,
  Lock,
  Edit2,
  Search,
  Award,
  Sparkles,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Layers,
  ExternalLink,
} from 'lucide-react';

const FederationAdminDashboard = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [demandChartData, setDemandChartData] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [societies, setSocieties] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active View Tab: 'analytics' | 'society-bookings' | 'workers' | 'wages' | 'societies' | 'admins'
  const [activeTab, setActiveTab] = useState('analytics');

  // TWO-LAYER SOCIETY BOOKINGS STATE (Super Admin)
  const [selectedSocietyForBookings, setSelectedSocietyForBookings] = useState(null); // null = Layer 1, society obj = Layer 2
  const [societyBookings, setSocietyBookings] = useState([]);
  const [societyBookingsLoading, setSocietyBookingsLoading] = useState(false);
  const [selectedWorkerInSociety, setSelectedWorkerInSociety] = useState('');
  const [societyBookingStatusFilter, setSocietyBookingStatusFilter] = useState('all');
  const [societyBookingSearchQuery, setSocietyBookingSearchQuery] = useState('');
  const [societyBookingPage, setSocietyBookingPage] = useState(1);
  const societyBookingsPerPage = 6;

  // Layer 1 Society Search & Pagination
  const [societyLayer1SearchQuery, setSocietyLayer1SearchQuery] = useState('');
  const [societyLayer1Page, setSocietyLayer1Page] = useState(1);
  const societiesPerPage = 6;

  // Search & Pagination for All Workers
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [workerSocietyFilter, setWorkerSocietyFilter] = useState('');
  const [workerPage, setWorkerPage] = useState(1);
  const workersPerPage = 6;

  // Wage Floor Editing State
  const [editingWageCategory, setEditingWageCategory] = useState(null);
  const [newWageFloorRate, setNewWageFloorRate] = useState(250);
  const [wageSuccessMsg, setWageSuccessMsg] = useState('');

  // Skill Passport Modal State
  const [passportWorker, setPassportWorker] = useState(null);

  // New Society Modal State
  const [showAddSocietyModal, setShowAddSocietyModal] = useState(false);
  const [newSocName, setNewSocName] = useState('');
  const [newSocCode, setNewSocCode] = useState('');
  const [newSocCity, setNewSocCity] = useState('');
  const [newSocPincode, setNewSocPincode] = useState('');
  const [newSocAddress, setNewSocAddress] = useState('');
  const [newSocEmail, setNewSocEmail] = useState('');
  const [newSocPhone, setNewSocPhone] = useState('');
  const [newSocAdminName, setNewSocAdminName] = useState('');
  const [newSocPassword, setNewSocPassword] = useState('password123');

  // Created Credentials Banner
  const [createdAdminCreds, setCreatedAdminCreds] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, forecastRes, socRes, workersRes, adminsRes, catsRes] = await Promise.all([
        api.get('/admin/federation-dashboard'),
        api.get('/admin/demand-forecast', {
          params: { category: selectedCategoryFilter || undefined },
        }),
        api.get('/societies'),
        api.get('/admin/workers/all'),
        api.get('/admin/admins/all'),
        api.get('/categories'),
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data);
      if (forecastRes.data.success) setDemandChartData(forecastRes.data.data);
      if (socRes.data.success) setSocieties(socRes.data.data);
      if (workersRes.data.success) setAllWorkers(workersRes.data.data);
      if (adminsRes.data.success) setAllAdmins(adminsRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);
    } catch (err) {
      console.error('Federation dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWageFloor = async (e) => {
    e.preventDefault();
    if (!editingWageCategory) return;
    try {
      const res = await api.put(`/admin/wage-floor/${editingWageCategory._id}`, {
        minHourlyRate: Number(newWageFloorRate),
      });

      if (res.data.success) {
        setWageSuccessMsg(res.data.message || 'Minimum wage floor updated successfully!');
        setEditingWageCategory(null);
        setTimeout(() => setWageSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update minimum wage floor.');
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await api.put(`/workers/${workerId}/approve-reject`, {
        approvalStatus: 'approved',
      });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve worker.');
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/societies', {
        name: newSocName,
        code: newSocCode,
        city: newSocCity,
        pincode: newSocPincode,
        address: newSocAddress,
        contactEmail: newSocEmail,
        contactPhone: newSocPhone,
        adminName: newSocAdminName || `${newSocName} Admin`,
        adminPassword: newSocPassword || 'password123',
      });

      if (res.data.success) {
        setCreatedAdminCreds(
          res.data.adminCredentials || {
            email: newSocEmail,
            password: newSocPassword || 'password123',
          }
        );
        setShowAddSocietyModal(false);
        setNewSocName('');
        setNewSocCode('');
        setNewSocCity('');
        setNewSocPincode('');
        setNewSocAddress('');
        setNewSocEmail('');
        setNewSocPhone('');
        setNewSocAdminName('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating society');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading Super Admin Federation Command Center...</p>
      </div>
    );
  }

  const handleSelectSocietyForBookings = async (soc) => {
    setSelectedSocietyForBookings(soc);
    setSelectedWorkerInSociety('');
    setSocietyBookingStatusFilter('all');
    setSocietyBookingSearchQuery('');
    setSocietyBookingPage(1);
    setSocietyBookingsLoading(true);
    try {
      const res = await api.get('/bookings', {
        params: { societyId: soc._id },
      });
      if (res.data.success) {
        setSocietyBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings for society:', err);
    } finally {
      setSocietyBookingsLoading(false);
    }
  };

  const handleRefreshSocietyBookings = async () => {
    if (!selectedSocietyForBookings) return;
    setSocietyBookingsLoading(true);
    try {
      const res = await api.get('/bookings', {
        params: { societyId: selectedSocietyForBookings._id },
      });
      if (res.data.success) {
        setSocietyBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error refreshing society bookings:', err);
    } finally {
      setSocietyBookingsLoading(false);
    }
  };

  const stats = dashboardData?.stats || {};
  const pendingWorkers = allWorkers.filter((w) => w.approvalStatus === 'pending');

  // Filtered workers list for Super Admin
  const filteredWorkers = allWorkers.filter((w) => {
    const nameMatch = (w.user?.name || '').toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      (w.user?.email || '').toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      (w.user?.phone || '').includes(workerSearchQuery);
    const socMatch = !workerSocietyFilter || (w.society?._id === workerSocietyFilter);
    return nameMatch && socMatch;
  });

  const totalWorkerPages = Math.ceil(filteredWorkers.length / workersPerPage) || 1;
  const paginatedWorkers = filteredWorkers.slice((workerPage - 1) * workersPerPage, workerPage * workersPerPage);

  // LAYER 1: Societies breakdown calculation & filtering
  const allSocietiesList = dashboardData?.societyBreakdown || societies;
  const filteredLayer1Societies = allSocietiesList.filter((soc) => {
    const q = societyLayer1SearchQuery.toLowerCase().trim();
    return (
      !q ||
      (soc.name || '').toLowerCase().includes(q) ||
      (soc.code || '').toLowerCase().includes(q) ||
      (soc.city || '').toLowerCase().includes(q) ||
      (soc.contactEmail || '').toLowerCase().includes(q)
    );
  });

  const totalLayer1Pages = Math.ceil(filteredLayer1Societies.length / societiesPerPage) || 1;
  const paginatedLayer1Societies = filteredLayer1Societies.slice(
    (societyLayer1Page - 1) * societiesPerPage,
    societyLayer1Page * societiesPerPage
  );

  // LAYER 2: Workers under selected society & worker-wise booking statistics
  const selectedSocietyWorkers = selectedSocietyForBookings
    ? allWorkers.filter((w) => {
        const sId = (w.society?._id || w.society || '').toString();
        return sId === selectedSocietyForBookings._id.toString();
      })
    : [];

  const layer2WorkerStats = selectedSocietyWorkers.map((w) => {
    const wUserId = w.user?._id?.toString();
    const wBookings = societyBookings.filter((b) => {
      const bWorkerId = (b.worker?._id || b.worker || '').toString();
      return bWorkerId === wUserId;
    });
    const completed = wBookings.filter((b) => b.status === 'completed').length;
    const active = wBookings.filter((b) => ['requested', 'accepted', 'in_progress'].includes(b.status)).length;
    const earnings = wBookings.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.price || 0), 0);

    return {
      worker: w,
      totalBookings: wBookings.length,
      completed,
      active,
      earnings,
    };
  });

  // LAYER 2: Filtered bookings list for selected society
  const filteredSocietyBookings = societyBookings.filter((b) => {
    const bWorkerId = (b.worker?._id || b.worker || '').toString();
    const matchesWorker = !selectedWorkerInSociety || bWorkerId === selectedWorkerInSociety;
    const matchesStatus = societyBookingStatusFilter === 'all' || b.status === societyBookingStatusFilter;
    const q = societyBookingSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.customer?.name || '').toLowerCase().includes(q) ||
      (b.worker?.name || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q) ||
      (b.city || '').toLowerCase().includes(q);

    return matchesWorker && matchesStatus && matchesQuery;
  });

  const totalSocietyBookingPages = Math.ceil(filteredSocietyBookings.length / societyBookingsPerPage) || 1;
  const paginatedSocietyBookings = filteredSocietyBookings.slice(
    (societyBookingPage - 1) * societyBookingsPerPage,
    societyBookingPage * societyBookingsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Super Admin Top Command Banner - Modern Executive Theme */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              👑 National Federation Super-Admin
            </span>
            <span className="px-2.5 py-1 bg-teal-500/20 text-teal-200 border border-teal-400/30 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Global Platform Authority
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              Live Registry Cockpit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Federation Governance & Policy Command Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Centralized platform intelligence across affiliated labour cooperatives, registered artisan rosters, digital skill passports, statutory wage floors, and multi-society booking streams.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-teal-900/40 transition-all flex items-center gap-2 cursor-pointer border border-teal-500/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert Banner */}
      {wageSuccessMsg && (
        <div className="p-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-500" />
            <span>{wageSuccessMsg}</span>
          </div>
          <button onClick={() => setWageSuccessMsg('')} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Created Admin Credentials Alert Banner */}
      {createdAdminCreds && (
        <div className="p-5 bg-gradient-to-r from-teal-950 to-slate-900 text-white rounded-2xl shadow-xl border-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
              ✅ New Society Admin Account Registered & Linked!
            </span>
            <h3 className="font-extrabold text-sm">Society Admin Login Credentials Created</h3>
            <p className="text-xs text-teal-200">
              Admin Login Email: <span className="font-extrabold text-amber-300 px-2 py-0.5 bg-black/40 rounded">{createdAdminCreds.email}</span> | Password: <span className="font-extrabold text-amber-300 px-2 py-0.5 bg-black/40 rounded">{createdAdminCreds.password}</span>
            </p>
          </div>
          <button
            onClick={() => setCreatedAdminCreds(null)}
            className="px-3 py-1 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg hover:bg-amber-300 cursor-pointer"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Macro Stats Grid - Modern Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span className="text-slate-600 uppercase tracking-wider text-[10px]">Affiliated Societies</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalSocieties || societies.length || 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Autonomous Cooperatives</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span className="text-slate-600 uppercase tracking-wider text-[10px]">Nationwide Workers</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-900 tracking-tight">
            {allWorkers.length || stats.totalWorkers || 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{stats.approvedWorkers || allWorkers.filter(w => w.approvalStatus === 'approved').length} Active & Aadhaar Audited</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span className="text-slate-600 uppercase tracking-wider text-[10px]">Administrative Staff</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {allAdmins.length || 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Verified Society & Federation Admins</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2 relative overflow-hidden group">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span className="text-slate-600 uppercase tracking-wider text-[10px]">Gross Platform Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>85% Direct Artisan Payouts</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'analytics', label: '📊 Demand Analytics & Forecast', icon: TrendingUp },
          { id: 'society-bookings', label: `📋 Society & Worker Bookings (${stats.totalBookings || 0})`, icon: Briefcase },
          { id: 'workers', label: `👷 Nationwide Workers Roster (${allWorkers.length})`, icon: Users },
          { id: 'wages', label: '⚖️ Minimum Wage Floor Governance', icon: DollarSign },
          { id: 'societies', label: `🏢 Affiliated Societies (${societies.length})`, icon: Building2 },
          { id: 'admins', label: `🛡️ Admin Staff Roster (${allAdmins.length})`, icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-teal-800 text-white shadow-md shadow-teal-950/20 ring-1 ring-teal-700'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS WITH SIDE-BY-SIDE MODERN GRAPHS (Dribbble Style) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* SIDE-BY-SIDE GRAPHS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* GRAPH 1 (Left): Society Revenue & Trade Capacity */}
            <SocietyRevenueChart
              societyBreakdown={dashboardData?.societyBreakdown || societies}
              categoryBreakdown={dashboardData?.categoryBreakdown || []}
            />

            {/* GRAPH 2 (Right): AI Predictive Demand Time-Series Forecast */}
            <DemandForecastChart
              data={demandChartData}
              category={selectedCategoryFilter}
              onCategoryChange={setSelectedCategoryFilter}
            />
          </div>

          {/* Dribbble Style Cooperative Health Cards Strip */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" /> Affiliated Cooperatives Quick Health & Revenue Share
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Realtime financial performance across all 5 regional unions</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('society-bookings')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full 2-Layer Bookings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {(dashboardData?.societyBreakdown || societies).map((soc, idx) => {
                const colors = [
                  'border-l-teal-500 bg-teal-50/30',
                  'border-l-blue-500 bg-blue-50/30',
                  'border-l-purple-500 bg-purple-50/30',
                  'border-l-amber-500 bg-amber-50/30',
                  'border-l-rose-500 bg-rose-50/30',
                ];
                return (
                  <div
                    key={soc._id || idx}
                    className={`p-4 rounded-2xl border border-slate-200/80 border-l-4 ${colors[idx % colors.length]} space-y-2 hover:shadow-xs transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] font-black px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-700">
                        {soc.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{soc.city}</span>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900 truncate" title={soc.name}>{soc.name}</h5>
                      <p className="text-sm font-black text-slate-900 mt-1">₹{(soc.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                      <span>{soc.totalWorkers || 0} Workers</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('society-bookings');
                          handleSelectSocietyForBookings(soc);
                        }}
                        className="text-teal-700 hover:underline cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1.5: TWO-LAYER SOCIETY & WORKER BOOKINGS GOVERNANCE */}
      {activeTab === 'society-bookings' && (
        <div className="space-y-6">
          {/* ========================================================= */}
          {/* LAYER 1: ALL AFFILIATED SOCIETIES OVERVIEW                */}
          {/* ========================================================= */}
          {!selectedSocietyForBookings ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-black uppercase rounded-full border border-teal-200">
                      Layer 1 of 2: Society-Wise Summary
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 mt-1">
                    <Building2 className="w-5 h-5 text-teal-600" /> Affiliated Labour Cooperative Societies ({filteredLayer1Societies.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Central governance across all societies. Click any society to drill down into its worker assignments, active jobs, and customer bookings.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={societyLayer1SearchQuery}
                      onChange={(e) => {
                        setSocietyLayer1SearchQuery(e.target.value);
                        setSocietyLayer1Page(1);
                      }}
                      placeholder="Search society name, city, code..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Society Overview Table */}
              {filteredLayer1Societies.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No Societies Found</p>
                  <p className="text-[11px] text-slate-500">No registered labour societies match your search filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <th className="py-3 px-3">Society & Jurisdiction</th>
                        <th className="py-3 px-3">Admin Contact</th>
                        <th className="py-3 px-3 text-center">Registered Workers</th>
                        <th className="py-3 px-3 text-center">Total Bookings</th>
                        <th className="py-3 px-3 text-center">Active Jobs</th>
                        <th className="py-3 px-3 text-right">Gross Revenue</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedLayer1Societies.map((soc) => (
                        <tr key={soc._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                                  {soc.code}
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-xs">{soc.name}</h4>
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {soc.city} ({soc.pincode})
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-teal-600 shrink-0" />
                                {soc.contactEmail}
                              </p>
                              {soc.contactPhone && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  {soc.contactPhone}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-black text-slate-900 text-xs">
                                {soc.totalWorkers !== undefined
                                  ? soc.totalWorkers
                                  : allWorkers.filter((w) => (w.society?._id || w.society) === soc._id).length}
                              </span>
                              <span className="text-[10px] text-teal-700 font-semibold">
                                {soc.approvedWorkers !== undefined
                                  ? `${soc.approvedWorkers} verified`
                                  : 'Active'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-3 text-center">
                            <span className="font-black text-slate-900 text-xs">
                              {soc.totalBookings !== undefined ? soc.totalBookings : '—'}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-center">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-full font-extrabold text-[10px]">
                              {soc.activeBookings !== undefined ? `${soc.activeBookings} active` : '—'}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-right">
                            <span className="font-black text-slate-900 text-sm">
                              ₹{soc.totalRevenue !== undefined ? soc.totalRevenue : 0}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectSocietyForBookings(soc)}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <span>Inspect Bookings</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Layer 1 Pagination Controls */}
              {totalLayer1Pages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <button
                    disabled={societyLayer1Page === 1}
                    onClick={() => setSocietyLayer1Page((p) => Math.max(p - 1, 1))}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Page
                  </button>

                  <div className="flex gap-1.5">
                    {Array.from({ length: totalLayer1Pages }, (_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setSocietyLayer1Page(idx + 1)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          societyLayer1Page === idx + 1
                            ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={societyLayer1Page === totalLayer1Pages}
                    onClick={() => setSocietyLayer1Page((p) => Math.min(p + 1, totalLayer1Pages))}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    Next Page <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* LAYER 2: SELECTED SOCIETY WORKERS & BOOKINGS DRILLDOWN   */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Back to Layer 1 Navigation Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSocietyForBookings(null)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to All Societies
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span>Societies (Layer 1)</span>
                      <span>›</span>
                      <span className="font-extrabold text-teal-800">{selectedSocietyForBookings.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                    Society Code: {selectedSocietyForBookings.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshSocietyBookings}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${societyBookingsLoading ? 'animate-spin text-teal-600' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Society Highlight Banner Card */}
              <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                    Labour Cooperative Society Drilldown
                  </span>
                  <h2 className="text-2xl font-black mt-0.5">{selectedSocietyForBookings.name}</h2>
                  <p className="text-xs text-teal-200 mt-1 flex items-center gap-2">
                    <span>{selectedSocietyForBookings.city} ({selectedSocietyForBookings.pincode})</span>
                    <span>•</span>
                    <span>Admin: {selectedSocietyForBookings.contactEmail}</span>
                  </p>
                </div>

                {/* Quick 4 KPI Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
                    <span className="text-[10px] text-teal-200 font-semibold block">Workers</span>
                    <span className="text-lg font-black text-white">{selectedSocietyWorkers.length}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
                    <span className="text-[10px] text-teal-200 font-semibold block">Bookings</span>
                    <span className="text-lg font-black text-white">{societyBookings.length}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
                    <span className="text-[10px] text-teal-200 font-semibold block">Active Jobs</span>
                    <span className="text-lg font-black text-amber-300">
                      {societyBookings.filter((b) => ['requested', 'accepted', 'in_progress'].includes(b.status)).length}
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
                    <span className="text-[10px] text-teal-200 font-semibold block">Gross Paid</span>
                    <span className="text-lg font-black text-teal-300">
                      ₹{societyBookings.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.price || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: WORKER SELECTOR & PERFORMANCE CARDS IN THIS SOCIETY */}
              {selectedSocietyWorkers.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" /> Society Workers ({selectedSocietyWorkers.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">Filter bookings by clicking any worker card below</p>
                    </div>

                    {selectedWorkerInSociety && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkerInSociety('');
                          setSocietyBookingPage(1);
                        }}
                        className="text-xs text-teal-700 hover:text-teal-900 font-extrabold underline cursor-pointer"
                      >
                        Show All {selectedSocietyWorkers.length} Workers
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* All Workers Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWorkerInSociety('');
                        setSocietyBookingPage(1);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedWorkerInSociety === ''
                          ? 'bg-teal-900 text-white border-teal-950 shadow-md ring-2 ring-teal-600'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            selectedWorkerInSociety === '' ? 'bg-teal-800 text-teal-200' : 'bg-slate-200 text-slate-700'
                          }`}>
                            🏢
                          </div>
                          <span className="font-extrabold text-xs">All Society Workers</span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          selectedWorkerInSociety === '' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {societyBookings.length} Jobs
                        </span>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-[11px]">
                        <span className={selectedWorkerInSociety === '' ? 'text-teal-200' : 'text-slate-500'}>
                          Total Workers: <strong>{selectedSocietyWorkers.length}</strong>
                        </span>
                        <span className={`font-bold ${selectedWorkerInSociety === '' ? 'text-amber-300' : 'text-teal-700'}`}>
                          ₹{societyBookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.price || 0), 0)}
                        </span>
                      </div>
                    </button>

                    {/* Individual Worker Cards */}
                    {layer2WorkerStats.map((item) => {
                      const isSelected = selectedWorkerInSociety === item.worker.user?._id?.toString();
                      return (
                        <button
                          key={item.worker._id}
                          type="button"
                          onClick={() => {
                            setSelectedWorkerInSociety(isSelected ? '' : (item.worker.user?._id?.toString() || ''));
                            setSocietyBookingPage(1);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-teal-800 text-white border-teal-900 shadow-md ring-2 ring-teal-500'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.worker.user?.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
                              alt={item.worker.user?.name}
                              className="w-8 h-8 rounded-full object-cover border border-teal-400 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-xs truncate flex items-center gap-1">
                                {item.worker.user?.name}
                                {item.worker.approvalStatus === 'approved' && (
                                  <Award className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-300' : 'text-teal-600'}`} />
                                )}
                              </p>
                              <p className={`text-[10px] truncate ${isSelected ? 'text-teal-200' : 'text-slate-500'}`}>
                                {item.worker.categories?.join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className={`mt-2.5 pt-2 border-t flex justify-between items-center text-[11px] ${
                            isSelected ? 'border-teal-700/50 text-teal-200' : 'border-slate-200 text-slate-500'
                          }`}>
                            <span>
                              Jobs: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{item.totalBookings}</strong> ({item.active} active)
                            </span>
                            <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-teal-700'}`}>
                              ₹{item.earnings}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BOOKINGS MONITOR WITH SEARCH, STATUS FILTER & PAGINATION */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                {/* Search & Status Bar */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={societyBookingSearchQuery}
                      onChange={(e) => {
                        setSocietyBookingSearchQuery(e.target.value);
                        setSocietyBookingPage(1);
                      }}
                      placeholder="Search by customer name, worker name, booking ID (#SSB-...), address..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'requested', label: 'Requested' },
                        { id: 'accepted', label: 'Accepted' },
                        { id: 'in_progress', label: 'In Progress' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'cancelled', label: 'Cancelled' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setSocietyBookingStatusFilter(st.id);
                            setSocietyBookingPage(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            societyBookingStatusFilter === st.id
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bookings Table / Results */}
                {societyBookingsLoading ? (
                  <div className="text-center py-12 space-y-2">
                    <RefreshCw className="w-7 h-7 text-teal-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Fetching society worker bookings...</p>
                  </div>
                ) : filteredSocietyBookings.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No Bookings Found</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      {selectedWorkerInSociety || societyBookingStatusFilter !== 'all' || societyBookingSearchQuery
                        ? 'Try resetting your filter or search query.'
                        : 'No bookings logged yet for this society.'}
                    </p>
                    {(selectedWorkerInSociety || societyBookingStatusFilter !== 'all' || societyBookingSearchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkerInSociety('');
                          setSocietyBookingStatusFilter('all');
                          setSocietyBookingSearchQuery('');
                          setSocietyBookingPage(1);
                        }}
                        className="mt-2 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                          <th className="py-3 px-3">Booking ID & Date</th>
                          <th className="py-3 px-3">Assigned Worker</th>
                          <th className="py-3 px-3">Customer & Location</th>
                          <th className="py-3 px-3">Service Category</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Fare & Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedSocietyBookings.map((b) => {
                          const statusColors = {
                            requested: 'bg-amber-100 text-amber-900 border-amber-200',
                            accepted: 'bg-blue-100 text-blue-900 border-blue-200',
                            in_progress: 'bg-purple-100 text-purple-900 border-purple-200',
                            completed: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                            cancelled: 'bg-red-100 text-red-900 border-red-200',
                            rejected: 'bg-rose-100 text-rose-900 border-rose-200',
                          };

                          return (
                            <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-3">
                                <div className="space-y-0.5">
                                  <span className="font-mono font-black text-slate-900 block text-xs">
                                    #{b.bookingId || b._id?.substring(0, 8)}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{b.date}</span>
                                    {b.timeSlot && <span className="text-slate-400">• {b.timeSlot}</span>}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                    {b.worker?.name ? b.worker.name.charAt(0) : 'W'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{b.worker?.name || 'Worker'}</p>
                                    <p className="text-[11px] text-slate-500">{b.worker?.phone || 'No phone'}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="space-y-0.5 max-w-xs">
                                  <p className="font-bold text-slate-900">{b.customer?.name || 'Customer'}</p>
                                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {b.customer?.phone || b.phone || 'N/A'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate" title={`${b.address}, ${b.city}`}>
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {b.address || b.city}
                                  </p>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg inline-block text-[11px]">
                                  {b.category}
                                </span>
                                {b.notes && (
                                  <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-1" title={b.notes}>
                                    "{b.notes}"
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-3">
                                <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border tracking-wide inline-block ${
                                  statusColors[b.status] || 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                  {b.status?.replace('_', ' ')}
                                </span>
                              </td>

                              <td className="py-3.5 px-3 text-right">
                                <div className="space-y-0.5">
                                  <p className="font-black text-slate-900 text-sm">₹{b.price}</p>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                    b.paymentStatus === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {b.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Layer 2 Pagination Controls */}
                {totalSocietyBookingPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                    <button
                      disabled={societyBookingPage === 1}
                      onClick={() => setSocietyBookingPage((p) => Math.max(p - 1, 1))}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous Page
                    </button>

                    <div className="flex gap-1.5">
                      {Array.from({ length: totalSocietyBookingPages }, (_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setSocietyBookingPage(idx + 1)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            societyBookingPage === idx + 1
                              ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={societyBookingPage === totalSocietyBookingPages}
                      onClick={() => setSocietyBookingPage((p) => Math.min(p + 1, totalSocietyBookingPages))}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      Next Page <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NATIONWIDE WORKERS ROSTER & SKILL PASSPORTS */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" /> Nationwide Workers Directory ({filteredWorkers.length})
              </h3>
              <p className="text-xs text-slate-500">Super Admin can inspect any worker's Digital Skill Passport, Aadhaar verification, and performance</p>
            </div>

            {/* Search & Society Filter */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={workerSearchQuery}
                  onChange={(e) => {
                    setWorkerSearchQuery(e.target.value);
                    setWorkerPage(1);
                  }}
                  placeholder="Search worker by name, email..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <select
                value={workerSocietyFilter}
                onChange={(e) => {
                  setWorkerSocietyFilter(e.target.value);
                  setWorkerPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-600 outline-none"
              >
                <option value="">All Societies</option>
                {societies.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>
          </div>

          {filteredWorkers.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No workers found matching your search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-2">Worker Profile</th>
                    <th className="py-3 px-2">Affiliated Society</th>
                    <th className="py-3 px-2">Categories</th>
                    <th className="py-3 px-2">Hourly Rate</th>
                    <th className="py-3 px-2">Customer Rating</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Digital Skill Passport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedWorkers.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={w.user?.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
                            alt={w.user?.name}
                            className="w-8 h-8 rounded-full object-cover border border-teal-500"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{w.user?.name}</p>
                            <p className="text-[11px] text-slate-500">{w.user?.email} • {w.user?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-800">
                        {w.society?.name || 'Central Labour Cooperative'}
                      </td>
                      <td className="py-3 px-2 font-bold text-teal-800">
                        {w.categories?.join(', ')}
                      </td>
                      <td className="py-3 px-2 font-extrabold text-slate-900">
                        ₹{w.hourlyRate}/hr
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 font-bold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{Number(w.rating || 5.0).toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({w.totalRatings || 0} reviews)</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          w.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.approvalStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {w.approvalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => setPassportWorker(w)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer text-xs ml-auto border border-slate-800"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>View Skill Passport</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Workers Pagination */}
          {totalWorkerPages > 1 && (
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
              <button
                disabled={workerPage === 1}
                onClick={() => setWorkerPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span>Page {workerPage} of {totalWorkerPages}</span>
              <button
                disabled={workerPage === totalWorkerPages}
                onClick={() => setWorkerPage((p) => Math.min(totalWorkerPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATUTORY MINIMUM FAIR WAGE FLOOR GOVERNANCE */}
      {activeTab === 'wages' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" /> Super Admin Minimum Fair Wage Floor Governance
              </h3>
              <p className="text-xs text-slate-500">
                Fix and update mandatory minimum wage floors across trade categories. Updating auto-elevates all workers below floor.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
              Cooperative Anti-Exploitation Policy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">{cat.name}</h4>
                  <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-lg">
                    Floor: ₹{cat.minHourlyRate || 150}/hr
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {cat.description || `Standard ${cat.name} repair and installation services across all cooperatives.`}
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    Active Workers: {allWorkers.filter((w) => w.categories?.includes(cat.name)).length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWageCategory(cat);
                      setNewWageFloorRate(cat.minHourlyRate || 150);
                    }}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Fix Minimum Wage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SOCIETIES DIRECTORY */}
      {activeTab === 'societies' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" /> Affiliated Societies Directory & Admin Accounts
              </h3>
              <p className="text-xs text-slate-500">Each society operates with its own isolated Admin Email & Password login</p>
            </div>
            <button
              onClick={() => setShowAddSocietyModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Society & Admin
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {societies.map((soc) => (
              <div key={soc._id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    Code: {soc.code}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-1">{soc.name}</h4>
                  <p className="text-xs text-slate-500">{soc.city} ({soc.pincode})</p>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs space-y-2 text-slate-700">
                  <p className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-700" /> Admin Email: <span className="font-extrabold">{soc.contactEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">{soc.address}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('society-bookings');
                      handleSelectSocietyForBookings(soc);
                    }}
                    className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <span>Inspect Society Bookings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN STAFF ROSTER */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" /> System Admins & Cooperative Executives Roster ({allAdmins.length})
            </h3>
            <p className="text-xs text-slate-500">List of all registered Society Admins and Federation Executives nationwide</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-2">Admin Profile</th>
                  <th className="py-3 px-2">Role Level</th>
                  <th className="py-3 px-2">Assigned Society / Jurisdiction</th>
                  <th className="py-3 px-2">City & Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAdmins.map((adm) => (
                  <tr key={adm._id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-xs">
                          {adm.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{adm.name}</p>
                          <p className="text-[11px] text-slate-500">{adm.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        adm.role === 'federationAdmin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {adm.role === 'federationAdmin' ? 'Super Admin' : 'Society Admin'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-800">
                      {adm.society?.name || 'All Cooperatives (Nationwide)'}
                    </td>
                    <td className="py-3 px-2 text-slate-600">
                      {adm.city} • {adm.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MINIMUM WAGE FLOOR MODAL */}
      {editingWageCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                  Fair Wage Authority
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">Fix Minimum Wage Floor</h3>
              </div>
              <button
                onClick={() => setEditingWageCategory(null)}
                className="text-slate-400 hover:text-white p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateWageFloor} className="p-6 space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 font-semibold">
                Category: <span className="font-black text-slate-900">{editingWageCategory.name}</span>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  Saving this will automatically raise the minimum wage for all registered workers in this trade across India.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  New Minimum Fair Wage Floor (₹/hour)
                </label>
                <input
                  type="number"
                  min={50}
                  max={2000}
                  value={newWageFloorRate}
                  onChange={(e) => setNewWageFloorRate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base font-bold focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWageCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save & Apply Nationwide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW SOCIETY & REGISTER ADMIN LOGIN MODAL */}
      {showAddSocietyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 space-y-4">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                  Federation Governance
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">Register New Society & Admin Account</h3>
              </div>
              <button
                onClick={() => setShowAddSocietyModal(false)}
                className="text-slate-400 hover:text-white p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSociety} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600 shrink-0" />
                <span>This form will automatically create both the Society and its Admin Login Account!</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Society Name</label>
                <input
                  type="text"
                  value={newSocName}
                  onChange={(e) => setNewSocName(e.target.value)}
                  required
                  placeholder="e.g. Pune Skilled Workers Cooperative"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Society Code</label>
                  <input
                    type="text"
                    value={newSocCode}
                    onChange={(e) => setNewSocCode(e.target.value)}
                    required
                    placeholder="e.g. PSWC-03"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={newSocCity}
                    onChange={(e) => setNewSocCity(e.target.value)}
                    required
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newSocPincode}
                    onChange={(e) => setNewSocPincode(e.target.value)}
                    required
                    placeholder="411001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newSocPhone}
                    onChange={(e) => setNewSocPhone(e.target.value)}
                    required
                    placeholder="9820011223"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Office Address</label>
                <input
                  type="text"
                  value={newSocAddress}
                  onChange={(e) => setNewSocAddress(e.target.value)}
                  required
                  placeholder="FC Road, Shivajinagar, Pune"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              {/* DEDICATED SOCIETY ADMIN LOGIN CREDENTIALS FIELDS */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-teal-700" /> Society Admin Login Credentials Setup
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    value={newSocAdminName}
                    onChange={(e) => setNewSocAdminName(e.target.value)}
                    placeholder="e.g. Prakash Deshmukh (Pune Admin)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Admin Login Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newSocEmail}
                    onChange={(e) => setNewSocEmail(e.target.value)}
                    required
                    placeholder="pune.admin@sevasetu.org"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-teal-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Admin Login Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSocPassword}
                    onChange={(e) => setNewSocPassword(e.target.value)}
                    required
                    placeholder="password123"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSocietyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  Register Society & Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL SKILL PASSPORT MODAL (SUPER ADMIN INSPECTION) */}
      <SkillPassportModal
        worker={passportWorker}
        isOpen={!!passportWorker}
        onClose={() => setPassportWorker(null)}
      />
    </div>
  );
};

export default FederationAdminDashboard;
