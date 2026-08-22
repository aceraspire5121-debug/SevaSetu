import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import WorkerCard from '../components/WorkerCard';
import EmergencyBookingModal from '../components/EmergencyBookingModal';
import {
  Search,
  Zap,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchCity, setSearchCity] = useState(user?.city || 'Mumbai');
  const [searchPincode, setSearchPincode] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Pagination State for Workers
  const [workerPage, setWorkerPage] = useState(1);
  const workersPerPage = 6;

  // Booking Modal State
  const [selectedWorkerForBook, setSelectedWorkerForBook] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [bookingAddress, setBookingAddress] = useState(user?.address || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Emergency Modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    setWorkerPage(1); // Reset pagination when filter changes
    fetchInitialData();
  }, [selectedCategory, searchCity, searchPincode, sortBy]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, workerRes] = await Promise.all([
        api.get('/categories'),
        api.get('/workers', {
          params: {
            category: selectedCategory || undefined,
            city: searchCity || undefined,
            pincode: searchPincode || undefined,
            sortBy,
          },
        }),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (workerRes.data.success) setWorkers(workerRes.data.data);
    } catch (err) {
      console.error('Customer dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedWorkerForBook) return;

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        workerId: selectedWorkerForBook.user._id,
        category: selectedWorkerForBook.categories[0] || 'Service',
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        address: bookingAddress || user?.address || 'Provided address',
        city: user?.city || 'Mumbai',
        pincode: user?.pincode || '400001',
        notes: bookingNotes,
        price: selectedWorkerForBook.hourlyRate,
      });

      if (res.data.success) {
        setSelectedWorkerForBook(null);
        setNotificationMsg(`Booking #${res.data.data.bookingId} created successfully! Track status under "My Bookings".`);
        setTimeout(() => setNotificationMsg(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking creation failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.name === selectedCategory);

  // Pagination Calculations for Workers Grid
  const totalWorkerPages = Math.ceil(workers.length / workersPerPage);
  const paginatedWorkers = workers.slice(
    (workerPage - 1) * workersPerPage,
    workerPage * workersPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time Notification Banner */}
      {notificationMsg && (
        <div className="p-4 bg-teal-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg('')} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner & Emergency Booking Trigger */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div>
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
            {t('customerDashboard')} • Service Discovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Book Verified Cooperative Workers</h1>
          <p className="text-xs text-teal-100 mt-1">
            Zero middleman markup • 95% direct payout to workers • Admin fair-wage floor protected
          </p>
        </div>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          {t('emergencyBooking')}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* City / Pincode Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search by city (e.g. Mumbai, Delhi)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
            />
          </div>

          <div className="w-full md:w-44">
            <input
              type="text"
              value={searchPincode}
              onChange={(e) => setSearchPincode(e.target.value)}
              placeholder="Pincode (e.g. 400001)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
            />
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 outline-none"
            >
              <option value="rating">{t('sortByRating')}</option>
              <option value="price_low">{t('sortByPriceLow')}</option>
              <option value="price_high">{t('sortByPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedCategory === ''
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories ({categories.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedCategory === cat.name
                  ? 'bg-teal-700 text-white border-teal-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name} (Floor: ₹{cat.minHourlyRate})
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid with Pagination */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Available Verified Workers {selectedCategory && `in ${selectedCategory}`}
            </h3>
            {workers.length > 0 && (
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Showing {Math.min((workerPage - 1) * workersPerPage + 1, workers.length)}-
                {Math.min(workerPage * workersPerPage, workers.length)} of {workers.length} Available Workers
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">{t('noWorkersFound')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing filters or click the Emergency Booking button to auto-match available workers across nearby societies.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginatedWorkers.map((w) => (
                <WorkerCard
                  key={w._id}
                  worker={w}
                  categoryMinWage={selectedCategoryObj?.minHourlyRate}
                  onBook={(wrk) => setSelectedWorkerForBook(wrk)}
                />
              ))}
            </div>

            {/* Workers Pagination Controls */}
            {totalWorkerPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-xs font-bold text-slate-600 bg-white p-4 rounded-2xl border shadow-sm">
                <button
                  disabled={workerPage === 1}
                  onClick={() => setWorkerPage((p) => Math.max(p - 1, 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Page
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: totalWorkerPages }, (_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setWorkerPage(idx + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold border transition-colors ${
                        workerPage === idx + 1
                          ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
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
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next Page <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* STANDARD BOOKING MODAL */}
      {selectedWorkerForBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Book {selectedWorkerForBook.user?.name}</h3>
                <p className="text-xs text-teal-200">
                  Rate: ₹{selectedWorkerForBook.hourlyRate}/hr • Verified Cooperative Worker
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkerForBook(null)}
                className="text-teal-200 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Time Slot</label>
                <select
                  value={bookingTimeSlot}
                  onChange={(e) => setBookingTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Address</label>
                <textarea
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Notes / Work Details</label>
                <input
                  type="text"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Specific requirements for the worker..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">Total Rate</span>
                  <span className="text-lg font-extrabold text-teal-800">₹{selectedWorkerForBook.hourlyRate}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerForBook(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition-all"
                  >
                    {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Booking Modal */}
      {showEmergencyModal && (
        <EmergencyBookingModal
          categories={categories}
          userCity={user?.city}
          onClose={() => setShowEmergencyModal(false)}
          onBookingSuccess={(booking, msg) => {
            setShowEmergencyModal(false);
            setNotificationMsg(msg);
            setTimeout(() => setNotificationMsg(''), 5000);
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
