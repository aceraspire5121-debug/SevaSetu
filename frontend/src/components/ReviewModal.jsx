import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const ReviewModal = ({ booking, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment,
      });

      if (res.data.success) {
        onReviewSubmitted(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-base">Rate & Review Worker</h3>
          <button onClick={onClose} className="text-teal-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">How was your service with</p>
            <p className="text-base font-bold text-slate-900 mb-4">
              {booking.worker?.name || 'Worker'} ({booking.category})
            </p>

            {/* Star selector */}
            <div className="flex justify-center items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-700">
              {rating === 5 && 'Outstanding Service!'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Below Expectations'}
              {rating === 1 && 'Poor'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Feedback Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience to support our cooperative workers..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Rating & Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
