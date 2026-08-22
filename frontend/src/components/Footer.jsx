import React from 'react';
import { HeartHandshake, Shield, Users, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">{t('brand')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              A cooperative-owned home services marketplace connecting Labour Cooperative Society workers directly with household customers, ensuring fair wages and dignified livelihood.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800/50">
              <Shield className="w-3.5 h-3.5" />
              100% Cooperative Owned
            </span>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Customer Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>House Cleaning & Sanitation</li>
              <li>Home Cooks & Meal Prep</li>
              <li>Licensed Electricians</li>
              <li>Plumbing & Water Repair</li>
              <li>On-Demand Emergency Booking</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">For Workers & Societies</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Worker Registration & Verification</li>
              <li>Fair-Wage Floor Guarantee</li>
              <li>Labour Cooperative Membership</li>
              <li>Society Admin Control Panel</li>
              <li>Federation Analytics Dashboard</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Cooperative Guarantees</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Zero Exploitative Commission (95% goes directly to workers)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Admin Set Minimum Fair-Wage Floor Protection</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Identity Verified & Society Approved Workers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SevaSetu Cooperative Federation. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Fair Labor</span>
            <span className="hover:text-slate-300 transition-colors">Support & Grievances</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
