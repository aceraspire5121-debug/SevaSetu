import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  Mail,
  X as CloseIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

const Footer = () => {
  const { t, language } = useLanguage();
  const [activeModal, setActiveModal] = useState(null); // 'phone' | 'email' | null
  const [copiedText, setCopiedText] = useState('');

  const phoneNumbers = ['8887708757', '6395577598', '7654022974'];
  const emailAddress = 'shashwattiwari712@gmail.com';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2500);
  };

  return (
    <footer className="bg-[#f5f5f5] text-slate-700 border-t border-slate-200 mt-auto font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Brand Logo Header (Matching Screenshot 2: [SS] SevaSetu •) */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <span className="text-white font-black text-sm tracking-wider font-sans select-none">
                SS
              </span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              SevaSetu
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            </span>
          </Link>
        </div>

        {/* 4 Main Columns Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-slate-200">
          {/* Col 1: Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Company</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link to="/explore-services" className="hover:text-black transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/federation-dashboard" className="hover:text-black transition-colors">
                  Investor Relations & Governance
                </Link>
              </li>
              <li>
                <a href="#terms" className="hover:text-black transition-colors">
                  Terms & conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-black transition-colors">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#anti-discrimination" className="hover:text-black transition-colors">
                  Anti-discrimination policy
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-black transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: For customers */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">For customers</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link to="/explore-services" className="hover:text-black transition-colors">
                  SevaSetu reviews
                </Link>
              </li>
              <li>
                <Link to="/explore-services" className="hover:text-black transition-colors">
                  Categories near you
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('phone')}
                  className="hover:text-black transition-colors text-left cursor-pointer"
                >
                  Contact us & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For professionals */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">For professionals</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link
                  to="/register"
                  className="hover:text-black transition-colors font-bold text-teal-800"
                >
                  Register as a professional
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-black transition-colors">
                  Worker Portal Login
                </Link>
              </li>
              <li>
                <Link to="/society-dashboard" className="hover:text-black transition-colors">
                  Cooperative Society Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Social links & App Downloads */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Social links</h3>

            {/* Circular Social Icons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* X (Twitter) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center transition-all shadow-2xs text-xs font-black cursor-pointer"
                title="X (Twitter)"
              >
                𝕏
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center transition-all shadow-2xs text-xs font-bold cursor-pointer"
                title="Facebook"
              >
                f
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center transition-all shadow-2xs text-xs font-black cursor-pointer"
                title="LinkedIn"
              >
                in
              </a>

              {/* Mobile / Phone Icon Button (Opens Phone Numbers Card) */}
              <button
                type="button"
                onClick={() => setActiveModal('phone')}
                className="w-9 h-9 rounded-full bg-teal-50 border border-teal-300 hover:border-teal-700 hover:bg-teal-700 hover:text-white text-teal-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer group"
                title="Contact Helpline Numbers"
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* Gmail / Email Icon Button (Opens Email Card) */}
              <button
                type="button"
                onClick={() => setActiveModal('email')}
                className="w-9 h-9 rounded-full bg-rose-50 border border-rose-300 hover:border-rose-700 hover:bg-rose-700 hover:text-white text-rose-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer group"
                title="Support Email"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>

            {/* App Store Download Badges */}
            <div className="pt-2 space-y-2">
              {/* App Store Badge */}
              <a
                href="#app-store"
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.35-.55.63-.99 1.66-.86 2.69.99.08 2.01-.5 2.55-1.19z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">
                    Download on the
                  </p>
                  <p className="text-xs font-bold leading-tight">App Store</p>
                </div>
              </a>

              {/* Google Play Badge */}
              <a
                href="#google-play"
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs block sm:inline-flex"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.45 1.45 0 0 1-.223-.787V2.601c0-.295.08-.57.222-.787zM15.207 13.414l2.793 2.793-11.896 6.848 9.103-9.641zm0-2.828L6.104.945l11.896 6.848-2.793 2.793zm1.414 1.414l3.535 2.033a1.45 1.45 0 0 0 .741 1.267 1.45 1.45 0 0 0-.741 1.268l-3.535 2.033-2.121-2.121 2.121-2.121z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">
                    GET IT ON
                  </p>
                  <p className="text-xs font-bold leading-tight">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SevaSetu Labour Cooperative Federation. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-slate-900 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">
              Security
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE PHONE NUMBERS MODAL */}
      {activeModal === 'phone' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Official Helpline Numbers</h4>
                  <p className="text-[10px] text-teal-200">24/7 Cooperative Support</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-teal-200 hover:text-white p-1 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Click any contact number below to call directly or copy to clipboard:
              </p>

              <div className="space-y-2">
                {phoneNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl flex items-center justify-between transition-all"
                  >
                    <a
                      href={`tel:${num}`}
                      className="font-mono font-bold text-sm text-slate-900 hover:text-teal-700 flex items-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      +91 {num}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(num)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Copy phone number"
                    >
                      {copiedText === num ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE GMAIL / EMAIL MODAL */}
      {activeModal === 'email' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-rose-800 to-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-400/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Official Support Email</h4>
                  <p className="text-[10px] text-rose-200">Grievances & Enquiries</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-rose-200 hover:text-white p-1 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Direct mail connection to SevaSetu cooperative administrator:
              </p>

              <div className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl flex items-center justify-between transition-all">
                <a
                  href={`mailto:${emailAddress}`}
                  className="font-sans font-bold text-xs text-slate-900 hover:text-rose-700 truncate pr-2"
                >
                  {emailAddress}
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(emailAddress)}
                  className="p-1.5 text-slate-500 hover:text-rose-700 rounded-lg hover:bg-white transition-colors shrink-0 cursor-pointer"
                  title="Copy email"
                >
                  {copiedText === emailAddress ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <a
                  href={`mailto:${emailAddress}`}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Email
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
