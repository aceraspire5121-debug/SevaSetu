import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Building2, DollarSign, Users, Award, TrendingUp } from 'lucide-react';

const SocietyRevenueChart = ({ societyBreakdown = [], categoryBreakdown = [] }) => {
  const [viewMetric, setViewMetric] = useState('societies'); // 'societies' | 'categories'

  // Prepare society chart data
  const societyChartData = (societyBreakdown || []).map((s) => ({
    name: s.name ? s.name.replace(' Cooperative', '').replace(' Federation', '').replace(' Society', '').replace(' Labour', '').replace(' Union', '') : s.code,
    fullName: s.name,
    code: s.code,
    city: s.city,
    revenue: s.totalRevenue || 0,
    bookings: s.totalBookings || 0,
    workers: s.totalWorkers || 0,
  }));

  // Prepare category chart data
  const categoryChartData = (categoryBreakdown || []).map((c) => ({
    name: c.categoryName,
    workers: c.totalWorkers || 0,
    minRate: c.minHourlyRate || 150,
  }));

  const activeData = viewMetric === 'societies' ? societyChartData : categoryChartData;
  const barColors = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-1.5 min-w-[190px]">
          <div className="font-extrabold text-sm text-teal-300 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span className="truncate">{dataPoint.fullName || label}</span>
            {dataPoint.code && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                {dataPoint.code}
              </span>
            )}
          </div>
          {viewMetric === 'societies' ? (
            <div className="space-y-1 pt-0.5">
              <p className="flex justify-between items-center text-slate-300">
                <span>Gross Revenue:</span>
                <strong className="text-emerald-400 font-mono text-sm">₹{dataPoint.revenue?.toLocaleString('en-IN')}</strong>
              </p>
              <p className="flex justify-between items-center text-slate-300">
                <span>Total Bookings:</span>
                <strong className="text-white">{dataPoint.bookings} jobs</strong>
              </p>
              <p className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Affiliated Workers:</span>
                <strong className="text-teal-200">{dataPoint.workers} active</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-1 pt-0.5">
              <p className="flex justify-between items-center text-slate-300">
                <span>Min Wage Floor:</span>
                <strong className="text-amber-400 font-mono">₹{dataPoint.minRate}/hr</strong>
              </p>
              <p className="flex justify-between items-center text-slate-300">
                <span>Registered Artisans:</span>
                <strong className="text-teal-300">{dataPoint.workers} workers</strong>
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header & View Toggle */}
      <div className="space-y-3 border-b border-slate-100 pb-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-teal-600" /> Revenue Cockpit
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Live Registry</span>
            </div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1 tracking-tight">
              {viewMetric === 'societies' ? 'Cooperative Revenue & Workload' : 'Sector Capacity & Wage Floors'}
            </h3>
          </div>

          {/* Toggle pill buttons */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMetric('societies')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMetric === 'societies'
                  ? 'bg-white text-teal-950 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Societies
            </button>
            <button
              type="button"
              onClick={() => setViewMetric('categories')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMetric === 'categories'
                  ? 'bg-white text-teal-950 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Wages
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          {viewMetric === 'societies'
            ? 'Gross revenue generated and booking volume per regional cooperative society'
            : 'Statutory fair wage floor rates and registered artisan capacity nationwide'}
        </p>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full my-4">
        {activeData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Building2 className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
            <p className="font-semibold">Loading Cooperative Financial Data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={activeData} margin={{ top: 10, right: 10, bottom: 15, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (viewMetric === 'societies' ? `₹${val}` : val)}
              />
              {viewMetric === 'societies' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}j`}
                />
              )}
              <Tooltip content={<CustomTooltip />} />

              {viewMetric === 'societies' ? (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Gross Revenue"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  >
                    {activeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="workers"
                    name="Artisans"
                    fill="#0d9488"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="minRate"
                    name="Wage Floor (₹)"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini Insight Strip */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-bold text-teal-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Top Region: {societyChartData[0]?.fullName?.split(' ')[0] || 'Delhi'} Hub</span>
        </div>
        <div className="font-bold text-slate-700">
          {societyBreakdown.length || 5} Active Societies
        </div>
      </div>
    </div>
  );
};

export default SocietyRevenueChart;
