import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, PieChart as PieIcon } from 'lucide-react';

const ForecastResults = () => {
  // Pull all the data from the parent (ForecastView) context
  const { forecast, chartData, COLORS, formatCurrency } = useOutletContext();

  // Guard clause: If someone navigates to /forecast/results without uploading
  if (!forecast) {
    return (
      <div className="text-center p-20 bg-gray-50 rounded-4xl border border-dashed">
        <p className="text-gray-500 font-medium">No forecast data found. Please upload a file first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        {/* Spending Trend & Forecast Chart */}
        <div className="bg-gray-50 p-8 rounded-4xl border border-gray-100">
          <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-8">
            <Calendar size={18} className="text-indigo-500" /> Spending Trend & Forecast
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Amount"]}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="actualDisplay" stroke={COLORS.actual} strokeWidth={4} fill={COLORS.actual} fillOpacity={0.05} />
                <Area type="monotone" dataKey="predictedDisplay" stroke={COLORS.predicted} strokeWidth={4} strokeDasharray="8 8" fill="transparent" />
                <ReferenceLine x={forecast.lastMonth} stroke="#94a3b8" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6">
          <div style={{ backgroundColor: COLORS.indigoBg }} className="p-8 rounded-4xl border border-indigo-100">
            <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-2">Estimated Feb</p>
            <p className="text-4xl font-black text-indigo-900">{formatCurrency(forecast.feb)}</p>
          </div>
          <div style={{ backgroundColor: COLORS.roseBg }} className="p-8 rounded-4xl border border-rose-100">
            <p className="text-rose-600 text-xs font-black uppercase tracking-widest mb-2">Estimated Mar</p>
            <p className="text-4xl font-black text-rose-900">{formatCurrency(forecast.mar)}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown (Pie Chart) */}
      <div className="bg-gray-50 p-8 rounded-4xl border border-gray-100 flex flex-col">
        <h3 className="font-bold text-gray-700 mb-8 flex items-center gap-2">
          <PieIcon size={18} className="text-indigo-500" /> Category Breakdown
        </h3>
        <div className="h-64 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Food', value: chartData.filter(d => !d.isForecast).pop()?.food || 0 },
                  { name: 'Transport', value: chartData.filter(d => !d.isForecast).pop()?.transport || 0 },
                  { name: 'Shopping', value: chartData.filter(d => !d.isForecast).pop()?.shopping || 0 },
                  { name: 'Other', value: chartData.filter(d => !d.isForecast).pop()?.other || 0 },
                ]}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
              >
                {COLORS.pie.map((color, index) => <Cell key={index} fill={color} />)}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastResults;