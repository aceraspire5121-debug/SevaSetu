import React, { useRef } from 'react';
import { X, Printer, HeartHandshake, CheckCircle2, ShieldCheck } from 'lucide-react';

const InvoiceModal = ({ booking, invoiceData, onClose }) => {
  const printRef = useRef(null);

  if (!booking) return null;

  const inv = invoiceData || {
    invoiceNumber: `INV-${booking.bookingId}`,
    invoiceDate: new Date().toLocaleDateString(),
    platformFee: Math.round(booking.price * 0.05),
    workerPayout: Math.round(booking.price * 0.95),
  };

  const handlePrint = () => {
    window.print();
  };

  const c = booking.customer || {};
  const w = booking.worker || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto my-auto">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">SevaSetu Official Cooperative Receipt</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 space-y-6 text-slate-800" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-teal-800">SevaSetu</h1>
              <p className="text-xs text-slate-500 font-medium">Labour Cooperative Federation Marketplace</p>
              <p className="text-xs text-slate-400 mt-1">GSTIN: 27AAAAA0000A1Z5</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full mb-2">
                {inv.invoiceNumber}
              </span>
              <p className="text-xs text-slate-500">Date: {new Date(inv.invoiceDate || Date.now()).toLocaleDateString()}</p>
              <p className="text-xs text-slate-500">Payment Method: Razorpay Test Mode</p>
            </div>
          </div>

          {/* Customer & Worker Info Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 mb-1">Billed To (Customer)</h4>
              <p className="font-bold text-sm text-slate-900">{c.name || 'Customer'}</p>
              <p className="text-xs text-slate-600">{c.phone}</p>
              <p className="text-xs text-slate-600">{booking.address}, {booking.city} - {booking.pincode}</p>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 mb-1">Service Provided By (Worker)</h4>
              <p className="font-bold text-sm text-slate-900 flex items-center gap-1">
                {w.name || 'Cooperative Worker'}
                <ShieldCheck className="w-4 h-4 text-teal-600 inline" />
              </p>
              <p className="text-xs text-slate-600">Category: {booking.category}</p>
              <p className="text-xs text-slate-600">Status: <span className="font-semibold uppercase text-teal-700">{booking.status}</span></p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2">Service Description</th>
                <th className="py-2 text-center">Type</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3">
                  <p className="font-bold text-slate-800">{booking.category} Service</p>
                  <p className="text-[11px] text-slate-500">
                    Booking ID: {booking.bookingId} ({booking.date} | {booking.timeSlot})
                  </p>
                </td>
                <td className="py-3 text-center">
                  {booking.isEmergency ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Emergency Surge</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">Standard</span>
                  )}
                </td>
                <td className="py-3 text-right font-bold text-slate-900">₹{booking.price}</td>
              </tr>
            </tbody>
          </table>

          {/* Breakdown & Totals */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Worker Direct Payout (95%)</span>
              <span>₹{inv.workerPayout}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Cooperative Federation Platform Fee (5%)</span>
              <span>₹{inv.platformFee}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-3">
              <span>Total Paid</span>
              <span className="text-teal-700">₹{booking.price}</span>
            </div>
          </div>

          {/* Paid Stamp */}
          <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-teal-800">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-bold text-xs">Payment Complete</p>
                <p className="text-[11px] text-teal-600">Ref: {booking.razorpayPaymentId || 'RP-TEST-VERIFIED'}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-white px-3 py-1 rounded-full border border-teal-200">
              Cooperative Fair-Wage Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
