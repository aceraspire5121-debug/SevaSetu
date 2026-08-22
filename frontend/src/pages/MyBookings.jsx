import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';
import ReviewModal from '../components/ReviewModal';
import {
  Clock,
  CreditCard,
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
  Activity,
  Calendar,
  MapPin,
} from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { t } = useLanguage();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination for Past History
  const [historyPage, setHistoryPage] = useState(1);
  const historyPerPage = 5;

  // Modals
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('booking_status_changed', (updatedBooking) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
      );
      setNotificationMsg(`Booking #${updatedBooking.bookingId} status updated to ${updatedBooking.status.toUpperCase()}`);
      setTimeout(() => setNotificationMsg(''), 5000);
    });

    return () => {
      socket.off('booking_status_changed');
    };
  }, [socket]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRazorpay = async (booking) => {
    try {
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });

      if (orderRes.data.success) {
        const { order, keyId } = orderRes.data;

        const options = {
          key: keyId,
          amount: order.amount,
          currency: 'INR',
          name: 'SevaSetu Cooperative',
          description: `${booking.category} Service Booking #${booking.bookingId}`,
          order_id: order.id,
          handler: async function (response) {
            const verifyRes = await api.post('/payments/verify', {
              bookingId: booking._id,
              razorpayOrderId: response.razorpay_order_id || order.id,
              razorpayPaymentId: response.razorpay_payment_id || 'pay_simulated_123',
              razorpaySignature: response.razorpay_signature || '',
              simulatedSuccess: true,
            });

            if (verifyRes.data.success) {
              setBookings((prev) =>
                prev.map((b) => (b._id === booking._id ? verifyRes.data.booking : b))
              );
              fetchBookings();
              setNotificationMsg(`Payment of ₹${booking.price} successful! Invoice ready.`);
              setTimeout(() => setNotificationMsg(''), 5000);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: { color: '#0d9488' },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Direct fallback simulation for test environment
          const verifyRes = await api.post('/payments/verify', {
            bookingId: booking._id,
            razorpayOrderId: order.id,
            razorpayPaymentId: 'pay_test_' + Math.floor(Math.random() * 1000000),
            simulatedSuccess: true,
          });

          if (verifyRes.data.success) {
            setBookings((prev) =>
              prev.map((b) => (b._id === booking._id ? verifyRes.data.booking : b))
            );
            fetchBookings();
            setNotificationMsg(`Razorpay Test Payment of ₹${booking.price} Verified!`);
            setTimeout(() => setNotificationMsg(''), 5000);
          }
        }
      }
    } catch (err) {
      alert('Payment processing error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter Active vs Past Bookings
  const activeBookings = bookings.filter(
    (b) => b.paymentStatus !== 'paid' && ['requested', 'accepted', 'in_progress', 'completed'].includes(b.status)
  );

  const pastBookings = bookings.filter(
    (b) => b.paymentStatus === 'paid' || ['rejected', 'cancelled'].includes(b.status)
  );

  // Pagination for Past History
  const totalHistoryPages = Math.ceil(pastBookings.length / historyPerPage);
  const paginatedPastBookings = pastBookings.slice(
    (historyPage - 1) * historyPerPage,
    historyPage * historyPerPage
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

      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
            Customer Activity Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">My Service Bookings & Tracking</h1>
          <p className="text-xs text-teal-200 mt-1">
            Real-time worker status tracking, Razorpay payments, official PDF invoices & ratings
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-extrabold rounded-xl shadow flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-slate-800">No Service Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't placed any service requests yet. Go to Explore Services to find verified cooperative workers near you!
          </p>
        </div>
      ) : (
        <>
          {/* BOX 1: 🚨 ACTIVE SERVICES & LIVE REAL-TIME TRACKER */}
          <div className="bg-gradient-to-br from-teal-50/80 to-white rounded-3xl border-2 border-teal-500/40 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-teal-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <h3 className="font-extrabold text-teal-950 text-lg">
                    Active Services & Live Tracker ({activeBookings.length})
                  </h3>
                </div>
                <p className="text-xs text-teal-700">Real-time Socket.io status updates & payment trigger</p>
              </div>
            </div>

            {activeBookings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-teal-100 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Active / In-Progress Bookings Right Now</p>
                <p className="text-[11px] text-slate-500">All your previous services are completed and paid.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeBookings.map((b) => {
                  const statusSteps = ['requested', 'accepted', 'in_progress', 'completed'];
                  const currentStepIdx = statusSteps.indexOf(b.status);

                  return (
                    <div key={b._id} className="p-5 bg-white rounded-2xl border border-teal-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">#{b.bookingId}</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            {b.category}
                          </span>
                          {b.isEmergency && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Emergency
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          Worker: <span className="font-bold text-teal-900">{b.worker?.name || 'Worker'}</span> • Date: {b.date} ({b.timeSlot})
                        </p>
                        <p className="text-xs text-slate-500">Address: {b.address}, {b.city}</p>
                      </div>

                      {/* Status Stepper */}
                      <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                          {statusSteps.map((st, idx) => (
                            <div key={st} className="flex items-center gap-1">
                              <span
                                className={`px-2.5 py-0.5 rounded-full capitalize ${
                                  idx <= currentStepIdx
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </span>
                              {idx < statusSteps.length - 1 && <span className="text-slate-300">→</span>}
                            </div>
                          ))}
                        </div>

                        {/* Pay via Razorpay Button */}
                        {b.status === 'completed' && b.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => handlePayRazorpay(b)}
                            className="mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 animate-bounce"
                          >
                            <CreditCard className="w-4 h-4" /> Pay ₹{b.price} via Razorpay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOX 2: 📜 PAST SERVICES HISTORY & INVOICES (SEPARATE BOX) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-600" /> Past Services History & Invoices ({pastBookings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Completed payments, official receipts & reviews history
                </p>
              </div>
              {totalHistoryPages > 1 && (
                <span className="text-xs font-semibold text-slate-500">
                  Page {historyPage} of {totalHistoryPages}
                </span>
              )}
            </div>

            {pastBookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl space-y-1">
                <History className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No Past Completed Services Yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {paginatedPastBookings.map((b) => {
                  const isRejected = b.status === 'rejected';

                  return (
                    <div key={b._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">#{b.bookingId}</span>
                          <span className="text-xs font-semibold text-slate-700">{b.category}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            b.paymentStatus === 'paid'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isRejected ? 'Rejected' : b.paymentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Worker: <span className="font-semibold">{b.worker?.name || 'Worker'}</span> • Completed on: {b.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.paymentStatus === 'paid' && (
                          <>
                            <button
                              onClick={() => setSelectedInvoiceBooking(b)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-400" /> Invoice PDF
                            </button>

                            {!b.reviewed ? (
                              <button
                                onClick={() => setSelectedReviewBooking(b)}
                                className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rate Worker
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Reviewed
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* History Pagination Controls */}
            {totalHistoryPages > 1 && (
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                <button
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalHistoryPages }, (_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setHistoryPage(idx + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                        historyPage === idx + 1
                          ? 'bg-slate-800 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={historyPage === totalHistoryPages}
                  onClick={() => setHistoryPage((p) => Math.min(p + 1, totalHistoryPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

      {/* Review Modal */}
      {selectedReviewBooking && (
        <ReviewModal
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onReviewSubmitted={() => {
            setSelectedReviewBooking(null);
            fetchBookings();
            setNotificationMsg('Thank you for rating your worker!');
            setTimeout(() => setNotificationMsg(''), 5000);
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
