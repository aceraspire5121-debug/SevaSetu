import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import {
  Sparkles, Camera, Upload, AlertTriangle, Wrench,
  X, RefreshCw, User, Star, ChevronRight, Zap, Droplets, Wind, Brush, Home, TreePine,
} from 'lucide-react';
import InstantVideoCallModal from './InstantVideoCallModal';

const CATEGORY_OPTIONS = [
  { id: 'Auto', label: 'Auto-Detect', icon: '✦', color: 'from-violet-600 to-indigo-600' },
  { id: 'Electrician', label: 'Electrician', icon: '⚡', color: 'from-amber-500 to-orange-500' },
  { id: 'Plumber', label: 'Plumbing', icon: '💧', color: 'from-blue-500 to-cyan-500' },
  { id: 'Technician', label: 'AC & Appliances', icon: '❄', color: 'from-sky-500 to-blue-500' },
  { id: 'House Cleaning', label: 'Deep Cleaning', icon: '✦', color: 'from-emerald-500 to-teal-500' },
  { id: 'Painter', label: 'Painter', icon: '🖌', color: 'from-pink-500 to-rose-500' },
  { id: 'Carpenter', label: 'Carpenter', icon: '🪚', color: 'from-amber-700 to-yellow-600' },
];

const SCAN_STEPS = [
  'Uploading photo to Gemini Multimodal Vision...',
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
  const [aiSource, setAiSource] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);

  if (!isOpen) return null;

  const compressImage = (dataUrl, maxDim = 800, quality = 0.78) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
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
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null); setImagePreview(null);
    setUploadedFileName(''); setDiagnosis(null); setErrorMsg('');
  };

  const triggerDiagnosis = async () => {
    if (!selectedImage) { setErrorMsg('Please take a photo or upload an image first.'); return; }
    setErrorMsg(''); setIsScanning(true); setScanStep(0);
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
      clearTimeout(t1); clearTimeout(t2);
      if (res.data?.success && res.data?.diagnosis) {
        setDiagnosis(res.data.diagnosis);
        setRecommendedWorkers(res.data.recommendedWorkers || []);
        setAiSource(res.data.source || 'Gemini Vision AI');
        setIsScanning(false);
        return;
      }
      throw new Error(res.data?.message || 'Unexpected AI response');
    } catch (err) {
      clearTimeout(t1); clearTimeout(t2);
      setErrorMsg(err.response?.data?.message || err.message || 'Gemini Vision AI call failed.');
      setIsScanning(false);
    }
  };

  const handleBookWorker = () => {
    onClose();
    navigate(`/explore-services?category=${encodeURIComponent(diagnosis?.category || 'Electrician')}&issue=${encodeURIComponent(diagnosis?.title || 'AI Diagnosed Issue')}`);
  };

  const getSeverityStyle = (sev = '') => {
    if (sev.toLowerCase().includes('low')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (sev.toLowerCase().includes('high')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        style={{ background: 'rgba(2, 8, 23, 0.85)', backdropFilter: 'blur(16px)' }}>

        {/* Modal Shell */}
        <div className="relative w-full max-w-2xl my-auto rounded-[2rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] border border-white/10"
          style={{ background: 'linear-gradient(145deg, #0f172a 0%, #111827 60%, #0d1f1e 100%)' }}>

          {/* Accent glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)' }} />

          {/* Header */}
          <div className="relative px-5 pt-5 pb-4 sm:px-7 sm:pt-6 border-b border-white/[0.06] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)', boxShadow: '0 0 20px rgba(20,184,166,0.4)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-white font-bold text-sm sm:text-base tracking-tight truncate">
                    AI Vision Diagnostic
                  </h3>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(20,184,166,0.2)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)' }}>
                    Gemini Vision
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  Snap a photo for instant AI inspection & fair price estimate
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
              <X className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 sm:px-7 sm:py-6 max-h-[75vh] overflow-y-auto space-y-5">

            {/* Error */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* SCANNING STATE */}
            {isScanning ? (
              <div className="py-14 flex flex-col items-center gap-6">
                {/* Orbital rings */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-2 rounded-full border-2 border-teal-400/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-4 rounded-full border-2 border-teal-300/40 animate-spin" style={{ animationDuration: '1.5s' }} />
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)', boxShadow: '0 0 30px rgba(20,184,166,0.5)' }}>
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2 max-w-xs">
                  <h4 className="text-white font-bold text-base">Gemini Vision AI is analyzing...</h4>
                  <p className="text-xs font-medium" style={{ color: '#2dd4bf' }}>{SCAN_STEPS[scanStep]}</p>
                  <div className="flex justify-center gap-1.5 pt-1">
                    {SCAN_STEPS.map((_, i) => (
                      <div key={i} className="h-1 rounded-full transition-all duration-500"
                        style={{ width: i <= scanStep ? 20 : 8, background: i <= scanStep ? '#2dd4bf' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                </div>
              </div>

            ) : !diagnosis ? (
              /* UPLOAD FORM */
              <div className="space-y-5">
                {/* Image Upload */}
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden" style={{ border: '2px solid rgba(20,184,166,0.5)' }}>
                    <img src={imagePreview} alt="Uploaded" className="w-full h-52 object-contain" style={{ background: '#0a0f1e' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/90 truncate max-w-[60%]">{uploadedFileName}</span>
                      <button onClick={handleClearImage} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                        style={{ background: 'rgba(239,68,68,0.85)', color: 'white' }}>
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { capture: 'environment', icon: <Camera className="w-6 h-6" />, title: 'Take Photo', sub: 'Open camera' },
                      { capture: null, icon: <Upload className="w-6 h-6" />, title: 'Upload File', sub: 'Gallery / Device' },
                    ].map((opt, i) => (
                      <label key={i} className="group relative flex flex-col items-center justify-center gap-2 py-7 rounded-2xl cursor-pointer transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.07)'; e.currentTarget.style.border = '1.5px dashed rgba(20,184,166,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.border = '1.5px dashed rgba(255,255,255,0.12)'; }}>
                        <input type="file" accept="image/*" {...(opt.capture ? { capture: opt.capture } : {})} onChange={handleImageChange} className="hidden" />
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-teal-400 transition-transform group-hover:scale-110"
                          style={{ background: 'rgba(20,184,166,0.15)' }}>
                          {opt.icon}
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold text-sm">{opt.title}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Category Pills */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    Service Category
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        style={selectedCategory === cat.id
                          ? { background: 'rgba(20,184,166,0.25)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.5)' }
                          : { background: 'rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span>{cat.icon}</span> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <input type="text" value={customDescription} onChange={e => setCustomDescription(e.target.value)}
                  placeholder="Optional: describe the issue (e.g. water leak under sink, burnt socket...)"
                  className="w-full px-4 py-3 rounded-xl text-xs font-medium outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', caretColor: '#2dd4bf' }}
                  onFocus={e => e.target.style.border = '1px solid rgba(20,184,166,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />

                {/* CTA Button */}
                <button onClick={triggerDiagnosis} disabled={!selectedImage}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: selectedImage ? 'linear-gradient(135deg, #14b8a6, #0891b2)' : undefined, color: 'white', boxShadow: selectedImage ? '0 0 30px rgba(20,184,166,0.35)' : undefined }}>
                  <Sparkles className="w-4 h-4" />
                  Analyze with Gemini Vision AI
                </button>
              </div>

            ) : (
              /* RESULT STATE */
              <div className="space-y-5">
                {/* AI Source Badge */}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#2dd4bf' }}>
                      {aiSource.includes('Gemini') ? 'Live Google Gemini Multimodal Vision AI' : aiSource}
                    </span>
                  </div>
                  <button onClick={() => { setDiagnosis(null); setErrorMsg(''); }}
                    className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: 'rgba(148,163,184,0.7)' }}>
                    <RefreshCw className="w-3 h-3" /> Scan Again
                  </button>
                </div>

                {/* Image + Issue Title */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
                  {/* Image */}
                  <div className="sm:col-span-2 rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={imagePreview || selectedImage} alt="Uploaded" className="w-full h-44 sm:h-full object-contain" style={{ background: '#0a0f1e' }} />
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}>
                      <span>Confidence: {diagnosis.confidence || 98.5}%</span>
                      <span style={{ color: '#2dd4bf' }}>Verified AI</span>
                    </div>
                  </div>

                  {/* Issue Title + Severity + Description */}
                  <div className="sm:col-span-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(148,163,184,0.5)' }}>Detected Issue</p>
                      <h4 className="text-white font-bold text-sm sm:text-base leading-snug">{diagnosis.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getSeverityStyle(diagnosis.severity)}`}>
                        {diagnosis.severity}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                        ⏱ {diagnosis.duration}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>{diagnosis.description}</p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(8,145,178,0.08))', border: '1px solid rgba(20,184,166,0.2)' }}>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>Indian Cooperative Fair-Wage Estimate</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Labour Charge', value: diagnosis.pricing?.laborCharge },
                        { label: 'Spare Parts', value: diagnosis.pricing?.sparePartsEstimate },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span style={{ color: 'rgba(148,163,184,0.7)' }}>{item.label}</span>
                          <span className="font-semibold text-white">₹{item.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'rgba(148,163,184,0.8)' }}>Total Estimate</span>
                      <span className="text-2xl font-black" style={{ color: '#fbbf24' }}>₹{diagnosis.pricing?.totalEstimate}</span>
                    </div>
                  </div>

                  {/* Spares */}
                  {diagnosis.sparesChecklist?.length > 0 && (
                    <div className="px-5 pb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(148,163,184,0.5)' }}>Tools & Spares Required</p>
                      <div className="flex flex-wrap gap-1.5">
                        {diagnosis.sparesChecklist.map((sp, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommended Workers */}
                {recommendedWorkers.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>
                      Verified Workers Near You · {selectedLocation || 'Mumbai'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {recommendedWorkers.map((w) => (
                        <div key={w._id} className="flex flex-col gap-2.5 p-3.5 rounded-2xl transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(20,184,166,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}>
                          <div className="flex items-center gap-2.5">
                            <img src={w.photo} alt={w.name} className="w-9 h-9 rounded-full object-cover shrink-0"
                              style={{ border: '2px solid rgba(20,184,166,0.5)' }} />
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-xs truncate">{w.name}</p>
                              <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(148,163,184,0.6)' }}>
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {w.rating} · {w.experienceYears}y exp
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-xs font-bold" style={{ color: '#2dd4bf' }}>₹{w.hourlyRate}/hr</span>
                            <button onClick={() => handleBookWorker()}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                              style={{ background: 'rgba(20,184,166,0.2)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.35)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.2)'}>
                              Book <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book CTA */}
                <button onClick={handleBookWorker}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)', color: 'white', boxShadow: '0 0 25px rgba(20,184,166,0.3)' }}>
                  <Wrench className="w-4 h-4" />
                  Book a Verified Worker for This Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <InstantVideoCallModal isOpen={showVideoCall} onClose={() => setShowVideoCall(false)} />
    </>
  );
};

export default AiDiagnosticModal;
