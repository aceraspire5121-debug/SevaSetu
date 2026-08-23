import React, { useState } from 'react';
import { X, Zap, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const EmergencyBookingModal = ({ categories, userCity, onClose, onBookingSuccess }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'Cook');
  const [city, setCity] = useState(userCity || 'Mumbai');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/bookings/emergency', {
        category: selectedCategory,
        city,
        address,
        notes,
      });

      if (res.data.success) {
        onBookingSuccess(res.data.data, res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency auto-assign failed. Please try standard booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-white text-white" />
            <div>
              <h3 className="font-extrabold text-base">Emergency / On-Demand Booking</h3>
              <p className="text-[11px] text-amber-100">Auto-assigns first available verified worker</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Service Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name} (Min Floor: ₹{cat.minHourlyRate}/hr)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Surge Rate</label>
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> +25% Worker Priority Bonus
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exact Service Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={2}
              placeholder="Flat number, building name, street..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Urgency / Special Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Immediate pipe burst, urgent electrician needed"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              {loading ? (
                <span>Auto-Assigning Worker...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  Auto-Match & Book Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyBookingModal;
