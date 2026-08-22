import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Calendar, Zap } from 'lucide-react';

const DemandForecastChart = ({ data, selectedCategory }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-lg">30-Day Service Demand Forecast</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" /> AI Predictive Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical booking volume vs predicted peak demand days for <span className="font-bold text-teal-700">{selectedCategory || 'All Categories'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 inline-block"></span>
            <span className="text-slate-600">Historical Bookings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-600">Forecasted Demand</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={2}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar
              dataKey="bookingsCount"
              name="Completed Bookings"
              fill="#0d9488"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="predictedDemand"
              name="Predicted Demand Floor"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4, fill: '#f59e0b' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Insight Summary Box */}
      <div className="mt-4 p-4 bg-teal-50/60 border border-teal-100 rounded-xl flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 leading-relaxed">
          <span className="font-bold">Federation Demand Forecast Insight: </span>
          Weekend surges predicted for <span className="font-semibold underline">{selectedCategory || 'Cook & House Cleaning'}</span> categories. 
          Societies are advised to increase worker availability on Saturdays & Sundays by 20% to meet demand.
        </div>
      </div>
    </div>
  );
};

export default DemandForecastChart;
