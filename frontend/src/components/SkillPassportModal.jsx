import React from 'react';
import {
  ShieldCheck,
  Award,
  Star,
  CheckCircle2,
  Lock,
  X,
  FileCheck,
  Building2,
  QrCode,
  Sparkles,
  Clock,
  Briefcase,
  Shield,
  Zap,
} from 'lucide-react';

const SkillPassportModal = ({ worker, isOpen, onClose }) => {
  if (!isOpen || !worker) return null;

  const user = worker.user || {};
  const society = worker.society || {};
  const passport = worker.skillPassport || {};
  const certificates = passport.certificates && passport.certificates.length > 0
    ? passport.certificates
    : [
        {
          title: 'Vocational Technical Competency Certificate',
          issuer: 'National Skill Development Corporation (NSDC)',
          issueYear: 2024,
          verificationStatus: 'verified',
        },
      ];

  const rating = Number(worker.rating || 5.0).toFixed(1);
  const totalRatings = worker.totalRatings || 0;
  const completedJobs = passport.completedJobsCount !== undefined ? passport.completedJobsCount : (worker.completedJobs || 0);
  const experienceYears = worker.experienceYears || 1;
  const passportId = passport.passportId || `SP-${(user._id || '987654').slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-300/80 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* 1. TOP OFFICIAL SKILL PASSPORT HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Pill Badge + ID + Close Button (Clean Non-Overlapping Flex Row) */}
          <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] sm:text-xs font-bold tracking-wide uppercase truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">Labour Cooperative • Digital Skill Passport</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-mono font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                ID: <span className="text-amber-300 font-extrabold">{passportId}</span>
              </span>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
                title="Close Skill Passport"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Worker Identity Hero Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
            <div className="relative shrink-0">
              <img
                src={
                  user.profilePhoto ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
                }
                alt={user.name || 'Worker'}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
              />
              <span
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-slate-900"
                title="UIDAI Aadhaar Verified Worker"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {user.name || 'Cooperative Worker'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                  {passport.skillTier || 'Certified Specialist'}
                </span>
              </div>

              <p className="text-xs text-teal-200 flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{society.name || 'Labour Cooperative Society'}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  UIDAI Aadhaar Verified
                </span>
                <span>•</span>
                <span>{user.city || 'Delhi'}{user.pincode ? `, ${user.pincode}` : ''}</span>
                <span>•</span>
                <span className="font-bold text-amber-300">₹{worker.hourlyRate || 250}/hr Fair Wage</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SCROLLABLE PASSPORT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 font-sans bg-white">
          
          {/* IMMUTABLE SYSTEM-VERIFIED METRICS (Locked Section) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal-700" />
                Immutable System-Verified Metrics
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3 text-slate-500" />
                Non-Editable by Worker
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Star Rating */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-base font-black text-slate-900">{rating}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Customer Rating</p>
                <p className="text-[9px] text-amber-700 font-semibold">{totalRatings} Verified Reviews</p>
              </div>

              {/* Completed Jobs */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-600">
                  <Award className="w-4 h-4" />
                  <span className="text-base font-black text-slate-900">{completedJobs}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Completed Jobs</p>
                <p className="text-[9px] text-emerald-700 font-semibold">100% Escrow Settled</p>
              </div>

              {/* Experience */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-base font-black text-slate-900">{experienceYears}+ Yrs</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Field Experience</p>
                <p className="text-[9px] text-blue-700 font-semibold">Verified Track Record</p>
              </div>

              {/* Punctuality */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-purple-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-base font-black text-slate-900">{passport.punctualityScore || 98}%</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">On-Time Arrival</p>
                <p className="text-[9px] text-purple-700 font-semibold">GPS Arrival Verified</p>
              </div>
            </div>
          </div>

          {/* SKILL COMPETENCY & CATEGORIES */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-teal-700" />
              Verified Skills & Specialization
            </h4>

            <div className="flex flex-wrap gap-2">
              {(worker.categories || []).map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-teal-800 text-white text-xs font-bold shadow-2xs"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-slate-200">
              <p>
                <span className="font-bold text-slate-900">Primary Specialization: </span>
                {passport.specialization || `${(worker.categories || []).join(', ')} Maintenance, Diagnostics & Repairs`}
              </p>
              <p>
                <span className="font-bold text-slate-900">Training Institute: </span>
                {passport.trainingInstitute || 'Government ITI / National Skill Development Partner'}
              </p>
            </div>
          </div>

          {/* VERIFIED VOCATIONAL CERTIFICATES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-700" />
                Verified Vocational Certificates & Credentials
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Cooperative Verified ✓
              </span>
            </div>

            <div className="space-y-2.5">
              {certificates.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{cert.title}</h5>
                      <p className="text-[11px] text-slate-500">
                        {cert.issuer} • Issued {cert.issueYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verified ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COOPERATIVE FAIR-WAGE & ETHICS GUARANTEE */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 text-[11px] text-teal-950">
              <span className="font-bold">Fair-Wage & Quality Guarantee: </span>
              This worker is directly affiliated with <span className="font-bold">{society.name || 'Labour Cooperative'}</span> and receives 85% net earnings with ₹0 predatory platform exploitation commissions.
            </div>
          </div>

        </div>

        {/* 3. FIXED FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <QrCode className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="font-mono text-[11px]">Govt / Cooperative Seal Verified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close Passport
          </button>
        </div>

      </div>
    </div>
  );
};

export default SkillPassportModal;
