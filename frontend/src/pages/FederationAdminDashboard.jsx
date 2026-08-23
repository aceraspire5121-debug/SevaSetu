import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DemandForecastChart from '../components/DemandForecastChart';
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

  // Active View Tab: 'analytics' | 'workers' | 'wages' | 'societies' | 'admins'
  const [activeTab, setActiveTab] = useState('analytics');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Super Admin Top Command Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-extrabold uppercase tracking-wider">
              👑 National Federation Super-Admin
            </span>
            <span className="px-2.5 py-1 bg-teal-500/20 text-teal-200 border border-teal-400/30 rounded-full text-xs font-bold">
              Global Platform Authority
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Federation Governance & Policy Command Center
          </h1>
          <p className="text-xs text-teal-200 max-w-2xl">
            Complete centralized access across all registered workers, affiliated society admins, digital skill passports, and statutory fair wage floor controls.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
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
        <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl shadow-xl border-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

      {/* Macro Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Affiliated Societies</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalSocieties || societies.length || 0}</p>
          <span className="text-[11px] text-slate-500">Autonomous Cooperatives</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Nationwide Workers</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-800">{allWorkers.length || stats.totalWorkers || 0}</p>
          <span className="text-[11px] text-slate-500">{stats.approvedWorkers || allWorkers.filter(w => w.approvalStatus === 'approved').length} Active & Approved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Society & Federation Admins</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{allAdmins.length || 0}</p>
          <span className="text-[11px] text-purple-700 font-semibold">Verified Admin Staff</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Gross Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{stats.totalRevenue || 0}</p>
          <span className="text-[11px] text-teal-700 font-semibold">85% Paid Directly to Workers</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'analytics', label: '📊 Demand Analytics & Forecast', icon: TrendingUp },
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
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DEMAND ANALYTICS & FORECAST */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" /> AI Demand Forecasting Engine (Mathematical Time-Series)
                </h3>
                <p className="text-xs text-slate-500">Predicted service booking demand over next 30 days based on seasonal trend math</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  <option value="">All Categories (Aggregated Demand)</option>
                  <option value="Cook">Cook / Maid Services</option>
                  <option value="House Cleaning">House Cleaning</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Caregiver">Elderly Caregiver</option>
                </select>
              </div>
            </div>

            <DemandForecastChart data={demandChartData} category={selectedCategoryFilter} />
          </div>
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

                <div className="pt-2 border-t border-slate-200 text-xs space-y-1 text-slate-700">
                  <p className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-700" /> Admin Email: <span className="font-extrabold">{soc.contactEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">{soc.address}</p>
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
