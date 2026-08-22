import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DemandForecastChart from '../components/DemandForecastChart';
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
} from 'lucide-react';

const FederationAdminDashboard = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [demandChartData, setDemandChartData] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [categoryWorkers, setCategoryWorkers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Society Modal
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
      const [dashRes, forecastRes, socRes] = await Promise.all([
        api.get('/admin/federation-dashboard'),
        api.get('/admin/demand-forecast', {
          params: { category: selectedCategoryFilter || undefined },
        }),
        api.get('/societies'),
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data);
      if (forecastRes.data.success) setDemandChartData(forecastRes.data.data);
      if (socRes.data.success) setSocieties(socRes.data.data);

      if (selectedCategoryFilter) {
        const catWorkerRes = await api.get(`/admin/workers/category/${selectedCategoryFilter}`);
        if (catWorkerRes.data.success) setCategoryWorkers(catWorkerRes.data.data);
      }
    } catch (err) {
      console.error('Federation dashboard error:', err);
    } finally {
      setLoading(false);
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
        setCreatedAdminCreds(res.data.adminCredentials || { email: newSocEmail, password: newSocPassword || 'password123' });
        setShowAddSocietyModal(false);
        setNewSocName('');
        setNewSocCode('');
        setNewSocCity('');
        setNewSocPincode('');
        setNewSocAddress('');
        setNewSocEmail('');
        setNewSocPhone('');
        setNewSocAdminName('');
        setNewSocPassword('password123');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add society');
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await api.put(`/workers/${workerId}/approve-reject`, {
        approvalStatus: 'approved',
      });
      if (res.data.success) fetchData();
    } catch (err) {
      alert('Approve failed');
    }
  };

  const stats = dashboardData?.stats || {};
  const pendingWorkers = dashboardData?.pendingWorkers || [];
  const societiesBreakdown = dashboardData?.societiesBreakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl border border-teal-800/30">
        <div>
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Apex Federation Governance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            National Labour Cooperative Federation
          </h1>
          <p className="text-xs text-teal-200 mt-1">
            Macro oversight for regional societies, AI demand forecasting, fair-wage compliance, and multi-tenant management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddSocietyModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Society & Admin
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </button>
        </div>
      </div>

      {/* CREATED ADMIN CREDENTIALS ALERT BANNER */}
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
            className="px-3 py-1 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg hover:bg-amber-300"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Top Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Affiliated Societies</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalSocieties || societies.length || 0}</p>
          <span className="text-[11px] text-slate-500">Active Cooperatives</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Verified Workers</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-800">{stats.totalWorkers || 0}</p>
          <span className="text-[11px] text-slate-500">Cross-Society Roster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Macro Bookings Count</span>
            <Briefcase className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalBookings || 0}</p>
          <span className="text-[11px] text-slate-500">Federation Platform Volume</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Gross Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{stats.totalRevenue || 0}</p>
          <span className="text-[11px] text-teal-700 font-semibold">Verified Transactions</span>
        </div>
      </div>

      {/* AI DEMAND FORECAST & ANALYTICS CHART */}
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

      {/* SOCIETIES MULTI-TENANT BREAKDOWN */}
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
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Society & Admin
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {societies.map((soc) => (
            <div key={soc._id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    Code: {soc.code}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-1">{soc.name}</h4>
                  <p className="text-xs text-slate-500">{soc.city} ({soc.pincode})</p>
                </div>
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

      {/* PENDING WORKER APPROVALS ACROSS ALL SOCIETIES */}
      {pendingWorkers.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-500" /> Federation Super-Admin Pending Approvals ({pendingWorkers.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-2">Worker</th>
                  <th className="py-3 px-2">Society</th>
                  <th className="py-3 px-2">Categories</th>
                  <th className="py-3 px-2">Hourly Rate</th>
                  <th className="py-3 px-2 text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingWorkers.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={w.user?.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
                          alt={w.user?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{w.user?.name}</p>
                          <p className="text-[11px] text-slate-500">{w.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-800">{w.society?.name || 'Society'}</td>
                    <td className="py-3 px-2 text-teal-800 font-bold">{w.categories?.join(', ')}</td>
                    <td className="py-3 px-2 font-extrabold text-slate-900">₹{w.hourlyRate}/hr</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleApproveWorker(w._id)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow text-xs flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Federation Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                className="text-slate-400 hover:text-white p-1 font-bold text-lg"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors"
                >
                  Register Society & Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FederationAdminDashboard;
