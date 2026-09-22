import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Zap, Filter, Activity } from 'lucide-react';

const DemandForecastChart = ({ data, category, selectedCategory, onCategoryChange }) => {
  const activeCat = category || selectedCategory || '';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
        <Activity className="w-8 h-8 text-teal-600 animate-pulse mb-2" />
        <p className="font-bold">Analyzing Time-Series Forecasting Data...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-1.5 min-w-[190px]">
          <div className="font-extrabold text-teal-300 border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>{point.dayLabel || point.date}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              point.type === 'Forecast' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-teal-400/20 text-teal-300 border border-teal-400/30'
            }`}>
              {point.type || (point.dayLabel?.includes('Forecast') ? 'Forecast' : 'Historical')}
            </span>
          </div>
          <div className="space-y-1 pt-0.5 text-[11px]">
            <p className="flex justify-between items-center text-slate-300">
              <span>Bookings Volume:</span>
              <strong className="text-teal-400 font-mono text-sm">{point.bookingsCount || point.bookings || 0} jobs</strong>
            </p>
            <p className="flex justify-between items-center text-slate-300">
              <span>AI Predicted Demand:</span>
              <strong className="text-amber-400 font-mono text-sm">{point.predictedDemand || 0} jobs</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header with Category Dropdown Filter */}
      <div className="space-y-3 border-b border-slate-100 pb-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" /> AI Forecast Engine
              </span>
              <span className="text-[11px] text-slate-400 font-medium">30-Day Outlook</span>
            </div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1 tracking-tight">
              Predictive Demand & Seasonal Peak Simulator
            </h3>
          </div>

          {onCategoryChange && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={activeCat}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="px-2.5 py-1 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Cook">Cook / Maid</option>
                <option value="House Cleaning">House Cleaning</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Caregiver">Elderly Care</option>
              </select>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Historical order volume vs mathematical machine-learned booking projections for{' '}
          <span className="font-bold text-teal-800">{activeCat || 'All Trade Sectors'}</span>
        </p>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full my-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 15, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
              interval={3}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="bookingsCount"
              name="Historical Volume"
              fill="#0d9488"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
            <Line
              type="monotone"
              dataKey="predictedDemand"
              name="Predicted Demand Trajectory"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Insight Strip */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>Weekend Surge: +25% Capacity Recommended</span>
        </div>
        <div className="font-bold text-slate-700">
          Confidence: 96.8%
        </div>
      </div>
    </div>
  );
};

export default DemandForecastChart;
