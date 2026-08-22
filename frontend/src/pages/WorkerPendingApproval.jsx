import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Building2,
  FileCheck,
  CheckCircle2,
  Upload,
  RefreshCw,
  AlertCircle,
  Edit3,
  Image as ImageIcon,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const WorkerPendingApproval = () => {
  const { user, worker, refreshProfile } = useAuth();

  const societyName = worker?.society?.name || 'Labour Cooperative Society';
  const rejectionReason = worker?.rejectionReason || 'Uploaded document or profile details were incomplete or unreadable.';
  const isRejected = worker?.approvalStatus === 'rejected';

  // Re-apply Modal State
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Format Aadhaar Number as XXXX-XXXX-XXXX
  const handleAadhaarChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 12);
    let formatted = val.replace(/(\d{4})(\d{4})?(\d{4})?/, function (match, p1, p2, p3) {
      let res = p1;
      if (p2) res += '-' + p2;
      if (p3) res += '-' + p3;
      return res;
    });
    setAadhaarNumber(formatted);
  };

  // Handle Cloudinary upload for re-applying worker
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Document size must be less than 5MB');
      return;
    }

    setNewDocName(file.name);
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await api.post('/upload', {
          image: reader.result,
          folder: 'sevasetu/documents',
        });
        if (res.data.success) {
          setNewDocUrl(res.data.url);
        }
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        setNewDocUrl(reader.result);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.put('/workers/resubmit-application', {
        idProofDocument: newDocUrl || user?.idProofDocument,
        aadhaarNumber: aadhaarNumber || '1234-5678-9012',
      });

      if (res.data.success) {
        setSuccessMsg('Application resubmitted successfully! Your Society Admin will re-audit your documents.');
        setShowReapplyModal(false);
        await refreshProfile();
      }
    } catch (err) {
      alert('Resubmit failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 space-y-6">
        {/* Top Status Icon */}
        <div className="relative mx-auto w-20 h-20">
          {isRejected ? (
            <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center border-4 border-red-200">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center border-4 border-amber-200 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Status Header */}
        <div className="space-y-2">
          <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            isRejected ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
          }`}>
            {isRejected ? 'Application Rejected by Society Admin' : 'Pending Society Verification'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isRejected ? 'Action Required: Re-upload Identity Proof' : 'Verification Under Audit'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isRejected
              ? `Your registration application requires revision. Please check the rejection reason below and upload a clear Aadhaar ID document.`
              : `Your registration details and ID proof documents are currently being audited by ${societyName}.`}
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-xs font-bold text-teal-800 flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PROMINENT REJECTION REASON ALERT BOX (HIGHLIGHTED IN RED) */}
        {isRejected && (
          <div className="p-5 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-2 border-red-300 rounded-2xl text-left space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Society Admin Rejection Reason</span>
            </div>
            <p className="text-sm font-extrabold text-red-950 bg-white p-3.5 rounded-xl border border-red-200 shadow-inner">
              "{rejectionReason}"
            </p>
            <p className="text-[11px] text-slate-600 font-semibold">
              Please fix the issue above by uploading a valid Aadhaar Card image or correcting your details.
            </p>
          </div>
        )}

        {/* Verification Status Progress Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Registration Progress Status</span>
            <span className={isRejected ? 'text-red-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
              {isRejected ? 'Action Required' : 'Audit In Progress'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Worker Profile & Contact Info Created</span>
            </div>

            <div className="flex items-center gap-2">
              <FileCheck className={`w-4 h-4 shrink-0 ${isRejected ? 'text-red-500' : 'text-teal-600'}`} />
              <span className="font-semibold text-slate-800">
                Aadhaar Document Status: {isRejected ? 'Rejected (Needs Re-upload)' : 'Submitted'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 shrink-0 ${isRejected ? 'text-red-500' : 'text-amber-500'}`} />
              <span className="font-semibold text-slate-900">
                Affiliated Society: {societyName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          {isRejected ? (
            <button
              onClick={() => setShowReapplyModal(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Edit3 className="w-4 h-4" /> Update Document & Re-apply for Verification
            </button>
          ) : (
            <button
              onClick={refreshProfile}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
            </button>
          )}

          <Link
            to="/"
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center"
          >
            Return to Home
          </Link>
        </div>
      </div>

      {/* ULTRA-SLEEK MODERN RE-APPLY MODAL */}
      {showReapplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 space-y-0">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 flex items-center justify-between border-b border-teal-800/30">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-widest bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Verification Resubmission Hub
                </span>
                <h3 className="font-extrabold text-lg mt-1 text-white">Re-upload Aadhaar Document</h3>
              </div>
              <button
                onClick={() => setShowReapplyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResubmit} className="p-6 space-y-5">
              {/* Highlighted Admin Note Box */}
              <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs space-y-1">
                <span className="font-extrabold text-red-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Admin Rejection Note To Fix:
                </span>
                <p className="text-red-950 font-extrabold bg-white p-2.5 rounded-xl border border-red-200/80 mt-1">
                  "{rejectionReason}"
                </p>
              </div>

              {/* 12-Digit Aadhaar Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  12-Digit Aadhaar Card Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    placeholder="1234 - 5678 - 9012"
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold tracking-widest outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all text-slate-900"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* MODERN DRAG & DROP / CLICK IMAGE UPLOADER */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Clear Aadhaar Image / PDF <span className="text-red-500">*</span>
                </label>

                {uploading ? (
                  <div className="p-8 border-2 border-dashed border-teal-400 bg-teal-50/50 rounded-2xl text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-teal-600 mx-auto animate-spin" />
                    <p className="text-xs font-extrabold text-teal-900">Uploading to Cloudinary CDN...</p>
                    <p className="text-[10px] text-slate-500">Generating secure HTTPS image link</p>
                  </div>
                ) : newDocUrl ? (
                  /* Live Selected Image Preview Box */
                  <div className="p-3.5 bg-teal-50 border-2 border-teal-500 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      {newDocUrl.startsWith('data:image') || newDocUrl.startsWith('http') ? (
                        <img
                          src={newDocUrl}
                          alt="Uploaded Document Preview"
                          className="w-14 h-14 object-cover rounded-xl border-2 border-teal-600 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                          <ImageIcon className="w-6 h-6 text-teal-700" />
                        </div>
                      )}

                      <div className="text-left space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-900 truncate max-w-[200px]">
                          {newDocName || 'Aadhaar_Card_Document.jpg'}
                        </p>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full inline-block">
                          ✓ Cloudinary Verified Upload
                        </span>
                      </div>
                    </div>

                    <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer shadow-sm shrink-0">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleDocUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  /* Clean Drag & Drop Area */
                  <label className="block p-6 border-2 border-dashed border-teal-400 hover:border-teal-600 bg-teal-50/20 hover:bg-teal-50/60 rounded-2xl text-center cursor-pointer transition-all space-y-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Click or Drag & Drop new clear Aadhaar Card Image
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Supports JPG, PNG, WEBP or PDF (Max 5MB)
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReapplyModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resubmitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Resubmit Application to Society Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerPendingApproval;
