import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import {
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  Wrench,
  X,
  RefreshCw,
  User,
  Star,
  ChevronRight,
  Zap,
  Droplets,
  Wind,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import InstantVideoCallModal from './InstantVideoCallModal';

const CATEGORY_OPTIONS = [
  { id: 'Auto', label: 'Auto-detect', icon: <Sparkles className="w-4 h-4 shrink-0" /> },
  { id: 'Electrician', label: 'Electrician', icon: <Zap className="w-4 h-4 shrink-0" /> },
  { id: 'Plumber', label: 'Plumbing', icon: <Droplets className="w-4 h-4 shrink-0" /> },
  { id: 'Technician', label: 'AC & Appliances', icon: <Wind className="w-4 h-4 shrink-0" /> },
];

const SCAN_STEPS = [
  'Uploading photo to SevaVision Neural Engine...',
  'Analyzing visual damage, material wear & severity...',
  'Calculating Indian cooperative fair-wage pricing...',
];

const AiDiagnosticModal = ({ isOpen, onClose, selectedLocation }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('Auto');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [recommendedWorkers, setRecommendedWorkers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [rejectedMsg, setRejectedMsg] = useState('');
  const [aiSource, setAiSource] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);

  if (!isOpen) return null;

  const compressImage = (dataUrl, maxDim = 800, quality = 0.78) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const orig = reader.result;
      setImagePreview(orig);
      const compressed = await compressImage(orig);
      setSelectedImage(compressed);
      setDiagnosis(null);
      setErrorMsg('');
      setRejectedMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadedFileName('');
    setDiagnosis(null);
    setErrorMsg('');
    setRejectedMsg('');
  };

  const triggerDiagnosis = async () => {
    if (!selectedImage) {
      setErrorMsg('Please take a photo or upload an image first.');
      return;
    }
    setErrorMsg('');
    setRejectedMsg('');
    setIsScanning(true);
    setScanStep(0);
    const t1 = setTimeout(() => setScanStep(1), 1800);
    const t2 = setTimeout(() => setScanStep(2), 4000);
    try {
      const res = await api.post('/ai/diagnose-image', {
        image: selectedImage,
        description: customDescription,
        categoryHint: selectedCategory === 'Auto' ? '' : selectedCategory,
        fileName: uploadedFileName,
        userCity: selectedLocation || 'Mumbai',
      });
      clearTimeout(t1);
      clearTimeout(t2);
      if (res.data?.success && res.data?.diagnosis) {
        setDiagnosis(res.data.diagnosis);
        setRecommendedWorkers(res.data.recommendedWorkers || []);
        setAiSource(res.data.source || 'SevaVision AI');
        setIsScanning(false);
        return;
      }
      throw new Error(res.data?.message || 'Unexpected AI response');
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsScanning(false);
      if (err.response?.status === 422 && err.response?.data?.rejected) {
        setRejectedMsg(err.response.data.message);
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'SevaVision AI diagnosis call failed.');
      }
    }
  };

  const handleBookWorker = (workerObj) => {
    onClose();
    navigate(
      `/explore-services?category=${encodeURIComponent(diagnosis?.category || 'Electrician')}&issue=${encodeURIComponent(
        diagnosis?.title || 'AI Diagnosed Issue'
      )}`
    );
  };

  const getSeverityStyle = (sev = '') => {
    if (sev.toLowerCase().includes('low')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (sev.toLowerCase().includes('high')) return 'bg-red-50 text-red-800 border-red-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
        
        {/* Modal Shell (Clean Light Aesthetic matching media_1789994838809.png) */}
        <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* REJECTED IMAGE CARD */}
          {rejectedMsg && (
            <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">🚫</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-950">Irrelevant Image Detected</h4>
                  <p className="text-xs text-amber-900 leading-relaxed">{rejectedMsg}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['🔌 Burnt Socket', '🚰 Leaking Tap', '❄️ Dusty AC', '🧱 Damp Wall', '🪵 Broken Door'].map((ex) => (
                  <span
                    key={ex}
                    className="px-2.5 py-1 bg-white text-slate-700 text-[11px] font-semibold rounded-lg border border-amber-200"
                  >
                    {ex}
                  </span>
                ))}
              </div>
              <button
                onClick={handleClearImage}
                className="mt-1 px-4 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Upload a Different Photo
              </button>
            </div>
          )}

          {/* =========================================================================
              STATE 1: SCANNING / ANALYZING STATE
             ========================================================================= */}
          {isScanning ? (
            <div className="py-14 flex flex-col items-center gap-5 text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-spin" />
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-bold text-slate-900">SevaVision AI is analyzing...</h4>
                <p className="text-xs font-medium text-teal-700">{SCAN_STEPS[scanStep]}</p>
                <div className="flex justify-center gap-1.5 pt-2">
                  {SCAN_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: i <= scanStep ? 20 : 8,
                        background: i <= scanStep ? '#0d9488' : '#e2e8f0',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : !diagnosis ? (
            /* =========================================================================
                STATE 2: INPUT FORM STATE (Exact replica of media_1789994838809.png)
               ========================================================================= */
            <div className="space-y-6">
              
              {/* SECTION 1: ADD A PHOTO OF THE ISSUE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#112233] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#112233] tracking-wide uppercase">
                    ADD A PHOTO OF THE ISSUE
                  </h3>
                </div>

                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-teal-500 p-2 bg-slate-900 shadow-sm">
                    <img
                      src={imagePreview}
                      alt="Uploaded Problem"
                      className="w-full h-48 object-contain rounded-xl mx-auto"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-950/80 text-teal-300 text-xs font-bold rounded-full backdrop-blur-md">
                        {uploadedFileName || 'Photo Loaded'}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Action 1: Take photo */}
                    <label className="group flex flex-col items-center justify-center p-6 bg-[#eaf5f0] hover:bg-[#def0e7] rounded-2xl border-2 border-[#14b8a6] transition-all cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Camera className="w-8 h-8 text-[#0d9488] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm text-slate-900">Take photo</span>
                      <span className="text-xs text-slate-500 mt-0.5 font-medium">Use your camera</span>
                    </label>

                    {/* Action 2: Upload file */}
                    <label className="group flex flex-col items-center justify-center p-6 bg-[#f8fafc] hover:bg-slate-100/70 rounded-2xl border border-slate-200 transition-all cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm text-slate-900">Upload file</span>
                      <span className="text-xs text-slate-500 mt-0.5 font-medium">Gallery or device</span>
                    </label>
                  </div>
                )}
              </div>

              {/* SECTION 2: CHOOSE A SERVICE CATEGORY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#112233] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#112233] tracking-wide uppercase">
                    CHOOSE A SERVICE CATEGORY
                  </h3>
                </div>

                {/* Category Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#eaf5f0] border-2 border-[#14b8a6] text-[#0f766e] font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description (optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Describe the issue <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="For example: water leak under the kitchen sink, burnt socket, unusual AC sound..."
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 focus:bg-white resize-none"
                />
              </div>

              {/* Bottom Footer Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Your photo is used only for this assessment</span>
                </div>

                <button
                  type="button"
                  onClick={triggerDiagnosis}
                  disabled={!selectedImage}
                  className="px-6 py-3.5 bg-[#0a7a66] hover:bg-[#086353] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with SevaVision AI</span>
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
                STATE 3: DIAGNOSIS REPORT VIEW
               ========================================================================= */
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>SevaVision™ AI Diagnostic Assessment</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDiagnosis(null);
                    setErrorMsg('');
                  }}
                  className="flex items-center gap-1 text-teal-800 hover:text-teal-950 underline text-xs font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Scan Another Photo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                {/* Photo Preview + Severity */}
                <div className="sm:col-span-5 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={imagePreview || selectedImage}
                      alt={diagnosis.title}
                      className="w-full h-44 object-contain"
                    />
                    <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg text-white text-[10px] font-bold flex justify-between items-center">
                      <span>Confidence: {diagnosis.confidence || 98.5}%</span>
                      <span className="text-teal-300">Verified AI</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#f8fafc] border border-slate-200 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Detected Issue:
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {diagnosis.title}
                    </h4>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${getSeverityStyle(diagnosis.severity)}`}>
                        {diagnosis.severity}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md">
                        ⏱ {diagnosis.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Technical Explanation & Pricing */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="p-3.5 bg-[#f8fafc] border border-slate-200 rounded-2xl space-y-1.5">
                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-teal-700" /> AI Technical Diagnosis:
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{diagnosis.description}</p>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="p-4 bg-[#eaf5f0] border border-[#14b8a6]/40 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f766e]">
                      Cooperative Fair-Wage Cost Breakdown:
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700 border-b border-teal-200/60 pb-2">
                      <div className="flex justify-between">
                        <span>Labor Charge:</span>
                        <span className="font-bold text-slate-900">₹{diagnosis.pricing?.laborCharge || 120}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spare Parts Estimate:</span>
                        <span className="font-bold text-slate-900">₹{diagnosis.pricing?.sparePartsEstimate || 80}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black pt-0.5">
                      <span className="text-teal-950 font-bold">Total Estimated Cost:</span>
                      <span className="text-xl text-[#0d7a68]">₹{diagnosis.pricing?.totalEstimate || 200}</span>
                    </div>
                  </div>

                  {/* Spares Checklist */}
                  {diagnosis.sparesChecklist && diagnosis.sparesChecklist.length > 0 && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-900">
                        Tools & Spares Required:
                      </span>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {diagnosis.sparesChecklist.map((sp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white text-slate-800 text-[10px] font-semibold rounded border border-amber-200"
                          >
                            ✓ {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Workers Section */}
              {recommendedWorkers.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-teal-700" /> Recommended Verified Workers for {diagnosis.category}:
                    </h4>
                    <span className="text-xs font-semibold text-teal-800">{selectedLocation || 'Mumbai'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendedWorkers.map((w) => (
                      <div
                        key={w._id}
                        className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 hover:border-teal-500 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={w.photo}
                            alt={w.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-xs text-slate-900 truncate">{w.name}</h5>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {w.rating} • {w.experienceYears}y exp
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                          <span className="font-bold text-teal-900">₹{w.hourlyRate}/hr</span>
                          <button
                            type="button"
                            onClick={() => handleBookWorker(w)}
                            className="px-3 py-1 bg-[#0a7a66] hover:bg-[#086353] text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book button */}
              <button
                type="button"
                onClick={handleBookWorker}
                className="w-full py-3.5 bg-[#0a7a66] hover:bg-[#086353] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Book a Verified Worker for This Issue</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Video Call Modal */}
      <InstantVideoCallModal isOpen={showVideoCall} onClose={() => setShowVideoCall(false)} />
    </>
  );
};

export default AiDiagnosticModal;
