import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Edit2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  FileCheck,
  Star,
  Award,
} from 'lucide-react';

const SocietyAdminDashboard = () => {
  const { user } = useAuth();

  const [societyData, setSocietyData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination States
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [workerPage, setWorkerPage] = useState(1);
  const workersPerPage = 5;

  const [bookingPage, setBookingPage] = useState(1);
  const bookingsPerPage = 5;

  // Aadhaar Document Inspection Modal
  const [inspectingWorker, setInspectingWorker] = useState(null);
  const [photoMatch, setPhotoMatch] = useState(true);
  const [addressMatch, setAddressMatch] = useState(true);

  // Rejection Modal
  const [selectedWorkerForReject, setSelectedWorkerForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Category wage floor edit state
  const [editingCategory, setEditingCategory] = useState(null);
  const [newWageFloor, setNewWageFloor] = useState(200);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [socRes, catRes] = await Promise.all([
        api.get('/societies/my-society'),
        api.get('/categories'),
      ]);

      if (socRes.data.success) setSocietyData(socRes.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error fetching society admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await api.put(`/workers/${workerId}/approve-reject`, {
        approvalStatus: 'approved',
      });
      if (res.data.success) {
        setInspectingWorker(null);
        fetchData();
      }
    } catch (err) {
      alert('Approve failed');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedWorkerForReject) return;

    try {
      const res = await api.put(`/workers/${selectedWorkerForReject._id}/approve-reject`, {
        approvalStatus: 'rejected',
        rejectionReason: rejectionReason || 'ID document unreadable or incomplete profile',
      });

      if (res.data.success) {
        setSelectedWorkerForReject(null);
        setInspectingWorker(null);
        setRejectionReason('');
        fetchData();
      }
    } catch (err) {
      alert('Reject failed');
    }
  };

  const handleUpdateWageFloor = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const res = await api.put(`/categories/${editingCategory._id}`, {
        minHourlyRate: Number(newWageFloor),
      });

      if (res.data.success) {
        setEditingCategory(null);
        fetchData();
      }
    } catch (err) {
      alert('Failed to update minimum wage floor');
    }
  };

  const stats = societyData?.stats || {};
  const pendingWorkers = societyData?.pendingWorkers || [];
  const allWorkers = societyData?.workers || [];
  const recentBookings = societyData?.recentBookings || [];

  // Filter Workers Roster based on Search Query
  const filteredWorkers = allWorkers.filter((w) => {
    const q = workerSearchQuery.toLowerCase();
    const name = w.user?.name?.toLowerCase() || '';
    const phone = w.user?.phone || '';
    const cats = w.categories?.join(' ').toLowerCase() || '';
    return name.includes(q) || phone.includes(q) || cats.includes(q);
  });

  // Pagination for Workers Roster
  const totalWorkerPages = Math.ceil(filteredWorkers.length / workersPerPage);
  const paginatedWorkers = filteredWorkers.slice(
    (workerPage - 1) * workersPerPage,
    workerPage * workersPerPage
  );

  // Pagination for Society Bookings Overview
  const totalBookingPages = Math.ceil(recentBookings.length / bookingsPerPage);
  const paginatedBookings = recentBookings.slice(
    (bookingPage - 1) * bookingsPerPage,
    bookingPage * bookingsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
            Society Admin Control Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {societyData?.society?.name || 'Labour Cooperative Society'}
          </h1>
          <p className="text-xs text-teal-200 mt-1">
            Verification hub for registered workers, Aadhaar ID document audits, fair-wage floors, and society booking logs
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Pending Approvals</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{stats.pendingWorkersCount || 0}</p>
          <span className="text-[11px] text-slate-500">Requires Document Review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Active Verified Workers</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-800">{stats.approvedWorkersCount || 0}</p>
          <span className="text-[11px] text-slate-500">Total Registered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Society Bookings</span>
            <Briefcase className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalBookings || 0}</p>
          <span className="text-[11px] text-slate-500">Completed & Active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Society Worker Revenue</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{stats.totalRevenue || 0}</p>
          <span className="text-[11px] text-teal-700 font-semibold">Gross Earned</span>
        </div>
      </div>

      {/* SECTION 1: Pending Worker Approvals & Interactive Aadhaar Document Review */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Pending Worker Registrations ({pendingWorkers.length})
            </h3>
            <p className="text-xs text-slate-500">Inspect uploaded Aadhaar card documents and verify worker identity</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Aadhaar Audit Required
          </span>
        </div>

        {pendingWorkers.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl space-y-1">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700">All Worker Applications Verified!</p>
            <p className="text-[11px] text-slate-500">No pending Aadhaar verification requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-2">Worker Name</th>
                  <th className="py-3 px-2">Categories</th>
                  <th className="py-3 px-2">Set Hourly Rate</th>
                  <th className="py-3 px-2">Aadhaar Document Status</th>
                  <th className="py-3 px-2 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingWorkers.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={w.user?.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                          alt={w.user?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{w.user?.name}</p>
                          <p className="text-[11px] text-slate-500">{w.user?.email} • {w.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-teal-800">
                      {w.categories?.join(', ')}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">₹{w.hourlyRate}/hr</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-[11px] text-slate-800 truncate max-w-[200px]">
                          {w.user?.idProofDocument || 'Uploaded Aadhaar Document'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setInspectingWorker(w)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg shadow transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Aadhaar ID
                        </button>
                        <button
                          onClick={() => handleApproveWorker(w._id)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quick Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: All Registered Society Workers Roster Table (PROBLEM 1 SOLVED) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Registered Society Workers Roster ({filteredWorkers.length})
            </h3>
            <p className="text-xs text-slate-500">Complete list of registered workers, Aadhaar badges, rates and ratings</p>
          </div>

          {/* Worker Search Bar */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={workerSearchQuery}
              onChange={(e) => {
                setWorkerSearchQuery(e.target.value);
                setWorkerPage(1);
              }}
              placeholder="Search worker by name, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {filteredWorkers.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No workers found matching "{workerSearchQuery}"</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-2">Worker Profile</th>
                  <th className="py-3 px-2">Categories</th>
                  <th className="py-3 px-2">Hourly Rate</th>
                  <th className="py-3 px-2">Aadhaar Status</th>
                  <th className="py-3 px-2">Rating & Experience</th>
                  <th className="py-3 px-2">Approval Status</th>
                  <th className="py-3 px-2 text-right">Document Audit</th>
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
                          <p className="font-bold text-slate-900 flex items-center gap-1">
                            {w.user?.name}
                            {w.approvalStatus === 'approved' && (
                              <Award className="w-3.5 h-3.5 text-teal-600" title="Society Verified" />
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">{w.user?.phone} • {w.user?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-teal-800">
                      {w.categories?.join(', ')}
                    </td>
                    <td className="py-3 px-2 font-extrabold text-slate-900">₹{w.hourlyRate}/hr</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit ${
                        w.approvalStatus === 'approved'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {w.approvalStatus === 'approved' ? 'Aadhaar Verified' : 'Pending Audit'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{w.rating || 5.0}</span>
                        <span className="text-[10px] text-slate-400">({w.experienceYears} yrs exp)</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        w.approvalStatus === 'approved'
                          ? 'bg-teal-100 text-teal-800'
                          : w.approvalStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {w.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => setInspectingWorker(w)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] ml-auto"
                      >
                        <Eye className="w-3 h-3 text-teal-700" /> View Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Workers Roster Pagination Controls */}
        {totalWorkerPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <button
              disabled={workerPage === 1}
              onClick={() => setWorkerPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Page
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalWorkerPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setWorkerPage(idx + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                    workerPage === idx + 1
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              disabled={workerPage === totalWorkerPages}
              onClick={() => setWorkerPage((p) => Math.min(p + 1, totalWorkerPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: Category Fair-Wage Floor Manager */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Manage Service Category Fair-Wage Floors
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs">{cat.name}</span>
                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setNewWageFloor(cat.minHourlyRate);
                  }}
                  className="text-teal-700 hover:text-teal-900 p-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-lg font-extrabold text-teal-800">₹{cat.minHourlyRate}/hr</p>
              <span className="text-[10px] text-slate-500 block">Min Wage Floor</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Society Bookings Monitor with Pagination */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" /> Society Bookings Overview ({recentBookings.length})
            </h3>
            {recentBookings.length > 0 && (
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Showing {Math.min((bookingPage - 1) * bookingsPerPage + 1, recentBookings.length)}-
                {Math.min(bookingPage * bookingsPerPage, recentBookings.length)} of {recentBookings.length} Society Bookings
              </p>
            )}
          </div>

          {totalBookingPages > 1 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Page {bookingPage} of {totalBookingPages}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3 px-2">Booking ID</th>
                <th className="py-3 px-2">Worker</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50">
                  <td className="py-3 px-2 font-bold text-slate-900">#{b.bookingId}</td>
                  <td className="py-3 px-2 font-semibold text-slate-800">{b.worker?.name || 'Worker'}</td>
                  <td className="py-3 px-2 text-slate-600">{b.customer?.name || 'Customer'}</td>
                  <td className="py-3 px-2 text-teal-800 font-bold">{b.category}</td>
                  <td className="py-3 px-2 text-slate-500">{b.date}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      b.paymentStatus === 'paid'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {b.status} {b.paymentStatus === 'paid' && '(Paid)'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-extrabold text-slate-900">₹{b.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalBookingPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
            <button
              disabled={bookingPage === 1}
              onClick={() => setBookingPage((p) => Math.max(p - 1, 1))}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Page
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalBookingPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setBookingPage(idx + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold border transition-colors ${
                    bookingPage === idx + 1
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              disabled={bookingPage === totalBookingPages}
              onClick={() => setBookingPage((p) => Math.min(p + 1, totalBookingPages))}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* AADHAAR DOCUMENT INSPECTION & AUDIT MODAL (PROBLEM 2 SOLVED) */}
      {inspectingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                  Labour Cooperative Verification Audit
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">Aadhaar Card Document Audit</h3>
              </div>
              <button
                onClick={() => setInspectingWorker(null)}
                className="text-teal-200 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Worker Profile Snippet */}
              <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <img
                  src={inspectingWorker.user?.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
                  alt={inspectingWorker.user?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-teal-600"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{inspectingWorker.user?.name}</h4>
                  <p className="text-xs text-slate-600">{inspectingWorker.user?.email} • {inspectingWorker.user?.phone}</p>
                  <span className="text-[10px] font-bold text-teal-800">
                    Categories: {inspectingWorker.categories?.join(', ')} (Rate: ₹{inspectingWorker.hourlyRate}/hr)
                  </span>
                </div>
              </div>

              {/* Visual Aadhaar Document File Preview Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Uploaded Identity Document Proof Preview
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full border border-teal-200">
                    Image Document Loaded
                  </span>
                </div>

                {/* Real Image Render if Base64/URL, or Visual Graphic ID Card Preview */}
                {inspectingWorker.user?.idProofDocument && (inspectingWorker.user.idProofDocument.startsWith('data:image') || inspectingWorker.user.idProofDocument.startsWith('http')) ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-900 p-2">
                      <img
                        src={inspectingWorker.user.idProofDocument.split('#')[0]}
                        alt="Uploaded Aadhaar Document"
                        className="w-full max-h-64 object-contain mx-auto rounded-lg"
                      />
                    </div>

                    {/* Detailed Worker Verification Info Card */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        Form Details For Document Cross-Verification
                      </span>

                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">12-Digit Aadhaar Number</span>
                          <span className="font-extrabold text-red-700 text-sm tracking-wider">
                            {inspectingWorker.user?.aadhaarNumber ||
                              inspectingWorker.user?.idProofDocument?.match(/\d{4}[\s\-]\d{4}[\s\-]\d{4}/)?.[0] ||
                              inspectingWorker.user?.idProofDocument?.match(/Aadhaar[\s\-]*([0-9\-]+)/)?.[1] ||
                              '1234 - 5678 - 9012'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Applicant Full Name</span>
                          <span className="font-extrabold text-slate-900">{inspectingWorker.user?.name}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">City & Pincode</span>
                          <span className="font-bold text-slate-800">
                            {inspectingWorker.user?.city || 'Mumbai'} ({inspectingWorker.user?.pincode || '400001'})
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Mobile & Email</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {inspectingWorker.user?.phone}
                          </span>
                        </div>

                        <div className="col-span-2 pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Residential Address</span>
                          <span className="font-semibold text-slate-800">{inspectingWorker.user?.address || 'Residential Address Provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Visual Government Aadhaar Card Card Frame */
                  <div className="p-4 bg-gradient-to-br from-amber-50/90 via-white to-teal-50/80 border-2 border-amber-300/80 rounded-2xl shadow-md space-y-3">
                    {/* Header Emblem */}
                    <div className="flex justify-between items-center border-b border-amber-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center text-[9px] font-extrabold">
                          🇮🇳
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-red-800 tracking-wider">भारत सरकार • GOVT OF INDIA</p>
                          <p className="text-[9px] font-bold text-slate-600">Unique Identification Authority of India (Aadhaar)</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                        Official ID Proof
                      </span>
                    </div>

                    {/* Aadhaar Card Content Grid */}
                    <div className="flex gap-3 items-center">
                      <img
                        src={inspectingWorker.user?.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
                        alt={inspectingWorker.user?.name}
                        className="w-16 h-20 object-cover rounded-lg border-2 border-slate-400 shadow-sm shrink-0"
                      />

                      <div className="space-y-1 text-xs">
                        <p className="font-extrabold text-slate-900 text-sm">{inspectingWorker.user?.name}</p>
                        <p className="text-[11px] text-slate-600 font-semibold">Address: {inspectingWorker.user?.address || 'Mumbai'}, {inspectingWorker.user?.city || 'Mumbai'} - {inspectingWorker.user?.pincode || '400001'}</p>
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-500 block">Uploaded File:</span>
                          <span className="text-[11px] font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block truncate max-w-[240px]">
                            {inspectingWorker.user?.idProofDocument || 'Aadhaar_Document_Proof.jpg'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Aadhaar Number Banner */}
                    <div className="pt-2 border-t border-amber-200/80 text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aadhaar Number</p>
                      <p className="text-base font-extrabold tracking-widest text-red-700 mt-0.5">
                        {inspectingWorker.user?.idProofDocument?.match(/\d{4}[\s\-]\d{4}[\s\-]\d{4}/)?.[0] || '1234 - 5678 - 9012'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Audit Checklist */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs uppercase text-amber-900 tracking-wider">Admin Verification Checklist</h4>
                
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={photoMatch}
                    onChange={(e) => setPhotoMatch(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span>1. Photo & Name on document match applicant profile ({inspectingWorker.user?.name})</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={addressMatch}
                    onChange={(e) => setAddressMatch(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span>2. City ({inspectingWorker.user?.city}) & Address match society jurisdiction</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedWorkerForReject(inspectingWorker)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject ID Proof
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveWorker(inspectingWorker._id)}
                  disabled={!photoMatch || !addressMatch}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Stamp Aadhaar Verified & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {selectedWorkerForReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Reject Worker Registration</h3>
            <p className="text-xs text-slate-500">
              Worker: <span className="font-bold text-slate-800">{selectedWorkerForReject.user?.name}</span>
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Rejection</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explain why registration was rejected (e.g. Invalid Aadhaar ID proof)..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkerForReject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAGE FLOOR EDIT MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Update Fair-Wage Floor ({editingCategory.name})</h3>

            <form onSubmit={handleUpdateWageFloor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Minimum Rate Floor (₹/hr)</label>
                <input
                  type="number"
                  value={newWageFloor}
                  onChange={(e) => setNewWageFloor(e.target.value)}
                  required
                  min={100}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Fair-Wage Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietyAdminDashboard;
