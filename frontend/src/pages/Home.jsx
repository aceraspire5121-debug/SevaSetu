import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Zap, Users, ArrowRight, Star, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import CategoryCard from '../components/CategoryCard';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl mx-4 sm:mx-8 mt-6 p-8 sm:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-700/60 border border-teal-500/40 text-xs font-semibold text-teal-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            100% Cooperative Owned & Operated Marketplace
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Connecting Fair Labour Cooperatives With Household Needs.
          </h1>

          <p className="text-base sm:text-lg text-teal-100/90 leading-relaxed">
            SevaSetu empowers skilled workers — cooks, cleaners, electricians, plumbers, painters, caregivers — through democratic Labour Cooperative Societies, ensuring dignified living wages and verified quality service for customers.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/customer-dashboard"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Explore Services & Book
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-teal-700/50 hover:bg-teal-700 text-white font-semibold text-sm border border-teal-500/40 transition-all flex items-center gap-2"
            >
              Join as Cooperative Worker
            </Link>
          </div>

          {/* Quick stats banner */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-teal-700/60 text-center">
            <div>
              <p className="text-2xl font-extrabold text-white">100%</p>
              <p className="text-xs text-teal-200">Fair-Wage Protected</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">10+</p>
              <p className="text-xs text-teal-200">Service Categories</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">Zero</p>
              <p className="text-xs text-teal-200">Middleman Exploitation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Explore Service Categories</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a service category to find verified workers from your local Labour Cooperative Society.
            </p>
          </div>
          <Link
            to="/customer-dashboard"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            View All Workers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/customer-dashboard?category=${cat.name}`}>
                <CategoryCard category={cat} minWageFloor={cat.minHourlyRate} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Why SevaSetu Cooperative */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-extrabold tracking-wider uppercase text-amber-400">The Cooperative Advantage</span>
            <h2 className="text-3xl font-extrabold">Fair Wages for Workers. Unmatched Trust for Customers.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Identity & Document Verified</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every worker is vetted by their local Labour Cooperative Society Admin with Aadhaar/ID proof verification before profile activation.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Admin Set Fair-Wage Floor</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Workers set their own rates with protected minimum fair-wage floors established by society admins to prevent predatory price cutting.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Real-Time Booking & Emergency Match</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track job lifecycle in real-time via Socket.io updates or trigger Emergency On-Demand auto-assignment when urgent help is needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
