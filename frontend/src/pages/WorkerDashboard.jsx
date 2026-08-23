import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import {
  ShieldCheck,
  Power,
  DollarSign,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Building2,
  Phone,
  MapPin,
  RefreshCw,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getCustomerName = (cust) => {
  if (!cust) return 'Customer';
  if (typeof cust === 'string') return cust;
  if (typeof cust === 'object') return cust.name || cust.email || 'Customer';
  return String(cust);
};

const getCustomerPhone = (cust) => {
  if (!cust || typeof cust !== 'object') return '';
  return cust.phone || '';
};

const WorkerDashboard = () => {
  const { user, worker, setWorker } = useAuth();
  const { socket } = useSocket();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(worker?.availabilityStatus || 'available');
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    if (worker && worker.approvalStatus !== 'approved') {
      navigate('/worker-pending');
      return;
    }
    fetchWorkerData();
  }, [worker]);

  useEffect(() => {
    if (!socket || !user) return;

    // Join Worker's City + Skills Dynamic Rooms for Targeted Dispatch
    socket.emit('join_worker_channel', {
      userId: user._id,
      city: user.city || worker?.society?.city || 'Delhi',
      categories: worker?.categories || [],
    });

    const handleNewBooking = (newBooking) => {
      if (!newBooking) return;

      // 1. Skill Match Guard: Ignore if worker does not possess this skill
      const workerCats = worker?.categories || [];
      if (workerCats.length > 0 && newBooking.category && !workerCats.includes(newBooking.category)) {
        return;
      }

      // 2. Prevent duplicate entries
      setBookings((prev) => {
        if (prev.some((b) => b._id === newBooking._id)) return prev;
        return [newBooking, ...prev];
      });

      const cat = typeof newBooking.category === 'string' ? newBooking.category : 'Service';
      const bId = newBooking.bookingId || '';
      const distInfo = newBooking.distanceKm ? ` (${newBooking.distanceKm} km away)` : '';
      setNotificationMsg(`🚨 New incoming local job #${bId} for ${cat}${distInfo}!`);
      setTimeout(() => setNotificationMsg(''), 7000);
    };

    const handleBookingStatusChanged = (updated) => {
      if (!updated || !updated._id) return;
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
    };

    socket.on('new_booking_request', handleNewBooking);
    socket.on('booking_status_changed', handleBookingStatusChanged);

    return () => {
      socket.off('new_booking_request', handleNewBooking);
      socket.off('booking_status_changed', handleBookingStatusChanged);
    };
  }, [socket, user, worker]);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingRes] = await Promise.all([
        api.get('/workers/stats/me'),
        api.get('/bookings'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setAvailability(statsRes.data.stats.availabilityStatus);
      }
      if (bookingRes.data.success && Array.isArray(bookingRes.data.data)) {
        setBookings(bookingRes.data.data);
      }
    } catch (err) {
      console.error('Error loading worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    const nextStatus = availability === 'available' ? 'busy' : 'available';
    try {
      const res = await api.put('/workers/availability', { status: nextStatus });
      if (res.data.success) {
        setAvailability(nextStatus);
        setWorker(res.data.data);
      }
    } catch (err) {
      alert('Failed to update availability status');
    }
  };

  const handleAcceptJob = async (booking) => {
    try {
      let res;
      if (booking.isBroadcast) {
        res = await api.put(`/bookings/${booking._id}/accept-broadcast`);
      } else {
        res = await api.put(`/bookings/${booking._id}/status`, { status: 'accepted' });
      }

      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === booking._id ? res.data.data : b))
        );
        fetchWorkerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept job.');
    }
  };

  const handleDeclineJob = async (booking) => {
    try {
      if (booking.isBroadcast) {
        const res = await api.put(`/bookings/${booking._id}/decline-broadcast`);
        if (res.data.success) {
          setBookings((prev) => prev.filter((b) => b._id !== booking._id));
        }
      } else {
        const res = await api.put(`/bookings/${booking._id}/status`, { status: 'rejected' });
        if (res.data.success) {
          setBookings((prev) =>
            prev.map((b) => (b._id === booking._id ? res.data.data : b))
          );
          fetchWorkerData();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline job.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.data : b))
        );
        fetchWorkerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const [completedPage, setCompletedPage] = useState(1);
  const completedPerPage = 5;

  const incomingRequests = bookings.filter((b) => b && b.status === 'requested');
  const activeJobs = bookings.filter((b) => b && ['accepted', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter((b) => b && b.status === 'completed');

  // Pagination for Completed Jobs
  const totalCompletedPages = Math.ceil(completedJobs.length / completedPerPage) || 1;
  const paginatedCompletedJobs = completedJobs.slice(
    (completedPage - 1) * completedPerPage,
    completedPage * completedPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time Notification Banner */}
      {Boolean(notificationMsg) && (
        <div className="p-4 bg-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2 text-sm">
            <Bell className="w-5 h-5 fill-slate-950" />
            <span>{typeof notificationMsg === 'string' ? notificationMsg : String(notificationMsg)}</span>
          </div>
          <button onClick={() => setNotificationMsg('')} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Profile & Availability Toggle Bar */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name || 'Worker'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400"
            />
            {worker?.verifiedBadge && (
              <span className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-1 rounded-full shadow" title="Verified">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{user?.name || 'Worker'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 border border-teal-400 text-teal-200">
                Cooperative Worker
              </span>
            </div>
            <p className="text-xs text-teal-200 mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> {worker?.society?.name || 'Labour Cooperative Society'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Array.isArray(worker?.categories) &&
                worker.categories.map((cat, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 text-teal-100 rounded text-[10px] font-semibold">
                    {typeof cat === 'string' ? cat : String(cat)}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Availability Toggle Switch */}
        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto justify-between">
          <div>
            <p className="text-xs text-teal-200 font-medium">Work Availability Status</p>
            <p className="text-sm font-extrabold flex items-center gap-1.5 capitalize">
              <span className={`w-2.5 h-2.5 rounded-full ${availability === 'available' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {availability === 'available' ? t('statusAvailable') : t('statusBusy')}
            </p>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 ${
              availability === 'available'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            Set to {availability === 'available' ? 'Busy' : 'Available'}
          </button>
        </div>
      </div>

      {/* Worker Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Earnings (Month)</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{typeof stats?.earningsThisMonth === 'number'
              ? stats.earningsThisMonth
              : (Array.isArray(stats?.earningsThisMonth)
                  ? stats.earningsThisMonth.reduce((sum, item) => sum + (item?.price || 0), 0)
                  : 0)}
          </p>
          <span className="text-[11px] text-teal-700 font-semibold">Total Payout Received</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Completed Jobs</span>
            <Briefcase className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.completedJobs || 0}</p>
          <span className="text-[11px] text-slate-500">Out of {stats?.totalBookings || 0} total</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Customer Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.rating || 5.0} / 5.0</p>
          <span className="text-[11px] text-slate-500">{stats?.totalRatings || 0} reviews</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Your Hourly Rate</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-800">₹{worker?.hourlyRate || 250}/hr</p>
          <span className="text-[11px] text-teal-700 font-semibold">Protected Fair Wage</span>
        </div>
      </div>

      {/* Section 1: Incoming Booking Requests (Accept / Reject) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Incoming Booking Requests ({incomingRequests.length})
          </h3>
          <button onClick={fetchWorkerData} className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Requests
          </button>
        </div>

        {incomingRequests.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No pending booking requests right now. Keep status set to Available!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map((b) => (
              <div key={b._id} className={`p-5 rounded-2xl space-y-3 border-2 ${
                b.isBroadcast
                  ? 'bg-gradient-to-br from-amber-50/90 to-teal-50/50 border-amber-300 shadow-md'
                  : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-slate-900">#{b.bookingId || ''}</span>
                      {b.isBroadcast && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider">
                          📢 Nearby Pool Broadcast
                        </span>
                      )}
                      {b.distanceKm !== undefined && (
                        <span className="px-2 py-0.5 bg-teal-800 text-teal-100 font-extrabold text-[9px] rounded-full flex items-center gap-1 shadow-2xs">
                          📍 {b.distanceKm} km away • ETA {b.estimatedEta || '15m'}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-teal-900">
                      {b.packageTitle || (typeof b.category === 'string' ? b.category : 'Service')}
                    </h4>
                    <p className="text-xs text-slate-600">Customer: {getCustomerName(b.customer)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-950">₹{b.price || 0}</span>
                    <p className="text-[10px] text-teal-700 font-bold">Guaranteed Payout</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white/90 p-3 rounded-xl border border-amber-100 shadow-2xs">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {typeof b.date === 'string' ? b.date : ''} ({typeof b.timeSlot === 'string' ? b.timeSlot : ''})
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {typeof b.address === 'string' ? b.address : ''}, {typeof b.city === 'string' ? b.city : ''}
                  </p>
                  {Boolean(b.notes) && typeof b.notes === 'string' && (
                    <p className="text-slate-500 italic pt-1 border-t border-slate-100 mt-1">"{b.notes}"</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
                  <button
                    onClick={() => handleDeclineJob(b)}
                    className="w-full sm:flex-1 py-2.5 bg-white hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" /> {b.isBroadcast ? 'Decline (Pass)' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleAcceptJob(b)}
                    className="w-full sm:flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Accept & Claim Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Accepted Jobs Stepper (Accepted -> In Progress -> Completed) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
          <PlayCircle className="w-5 h-5 text-teal-600" /> Active Jobs Stepper ({activeJobs.length})
        </h3>

        {activeJobs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No active jobs in progress.</p>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((b) => (
              <div key={b._id} className="p-5 bg-teal-50/50 border border-teal-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-sm text-slate-900">#{b.bookingId || ''}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-700 text-white uppercase">
                      {typeof b.status === 'string' ? b.status.replace('_', ' ') : ''}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {typeof b.category === 'string' ? b.category : 'Service'} • Customer: {getCustomerName(b.customer)} {getCustomerPhone(b.customer) ? `(${getCustomerPhone(b.customer)})` : ''}
                  </p>
                  <p className="text-xs text-slate-600">
                    {typeof b.address === 'string' ? b.address : ''}, {typeof b.city === 'string' ? b.city : ''} • Date: {typeof b.date === 'string' ? b.date : ''}
                  </p>
                </div>

                <div className="flex gap-2">
                  {b.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'in_progress')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
                    >
                      <PlayCircle className="w-4 h-4" /> Start Job (In Progress)
                    </button>
                  )}

                  {b.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Completed Earnings History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Completed Jobs & Earnings History
        </h3>

        {completedJobs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No completed jobs in your earnings history yet. Accept incoming requests to complete jobs and receive payouts!</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-2">Booking ID</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Payment Status</th>
                    <th className="py-3 px-2 text-right">Payout Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCompletedJobs.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-bold text-slate-900">#{b.bookingId || ''}</td>
                      <td className="py-3 px-2 font-semibold text-teal-800">{typeof b.category === 'string' ? b.category : 'Service'}</td>
                      <td className="py-3 px-2 text-slate-700">{getCustomerName(b.customer)}</td>
                      <td className="py-3 px-2 text-slate-500">{typeof b.date === 'string' ? b.date : ''}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.paymentStatus === 'paid' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {typeof b.paymentStatus === 'string' ? b.paymentStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-slate-900">
                        ₹{b.price || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            {completedJobs.length > completedPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                <span>
                  Showing {((completedPage - 1) * completedPerPage) + 1} to {Math.min(completedPage * completedPerPage, completedJobs.length)} of {completedJobs.length} completed jobs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={completedPage === 1}
                    onClick={() => setCompletedPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-slate-800 px-1">
                    Page {completedPage} of {totalCompletedPages}
                  </span>
                  <button
                    disabled={completedPage === totalCompletedPages}
                    onClick={() => setCompletedPage((p) => Math.min(totalCompletedPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
