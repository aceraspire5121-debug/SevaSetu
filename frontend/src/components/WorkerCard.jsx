import React from 'react';
import { Star, ShieldCheck, MapPin, Building2, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WorkerCard = ({ worker, onBook, onViewPassport, categoryMinWage }) => {
  const { t } = useLanguage();
  const u = worker.user || {};
  const s = worker.society || {};

  const meetsFairWage = !categoryMinWage || worker.hourlyRate >= categoryMinWage;
  const completedJobs = worker.skillPassport?.completedJobsCount !== undefined ? worker.skillPassport.completedJobsCount : (worker.completedJobs || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={u.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={u.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
            />
            {worker.verifiedBadge && (
              <span
                className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full shadow"
                title="Verified Cooperative Worker"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h4 className="font-bold text-slate-900 truncate text-base">{u.name}</h4>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{Number(worker.rating || 5.0).toFixed(1)}</span>
                <span className="text-[10px] text-amber-600">({worker.totalRatings || 0})</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
              <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{s.name || 'Labour Cooperative Society'}</span>
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <p className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{u.city || 'Delhi'} {u.pincode ? `(${u.pincode})` : ''}</span>
              </p>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                {completedJobs} Jobs Done
              </span>
            </div>
          </div>
        </div>

        {/* Details & Categories */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {worker.bio || 'Dedicated cooperative service provider.'}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {worker.categories && worker.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Skill Passport Trigger Pill */}
          <button
            type="button"
            onClick={() => onViewPassport && onViewPassport(worker)}
            className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border border-slate-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>View Digital Skill Passport</span>
          </button>
        </div>
      </div>

      {/* Footer Rate & Action */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-slate-900">₹{worker.hourlyRate}</span>
            <span className="text-xs font-medium text-slate-500">{t('perHour')}</span>
          </div>
          {meetsFairWage && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700">
              <CheckCircle2 className="w-3 h-3 text-teal-600" /> Fair-Wage Protected
            </span>
          )}
        </div>

        <button
          onClick={() => onBook(worker)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
        >
          {t('bookNow')}
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
