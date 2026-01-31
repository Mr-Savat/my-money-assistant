import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ReferenceLine } from 'recharts';
import { Upload, Calendar, PieChart as PieIcon, AlertCircle } from 'lucide-react';

const ForecastView = () => {
  const [chartData, setChartData] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");

  // កំណត់ពណ៌ដោយប្រើ HEX ច្បាស់លាស់
  const COLORS = {
    actual: "#4f46e5",    
    predicted: "#f43f5e", 
    pie: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
    indigoBg: "#eef2ff",
    roseBg: "#fff1f2"
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
      setError("សូមជ្រើសរើសតែឯកសារ CSV ឬ Excel តែប៉ុណ្ណោះ!");
      e.target.value = null; 
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        let jsonData = [];
        if (extension === 'csv') {
          const result = Papa.parse(evt.target.result, { header: true, dynamicTyping: true });
          jsonData = result.data.filter(row => row.month);
        } else {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        }
        processForecasting(jsonData);
      } catch (err) {
        console.error(err);
        setError("There is a problem reading the data. Please check the file again.");
      }
    };

    if (extension === 'csv') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  const processForecasting = (rawData) => {
    const processed = rawData.map(row => ({
      ...row,
      actualValue: (row.food || 0) + (row.transport || 0) + (row.shopping || 0) + (row.other || 0),
    }));

    const last = processed[processed.length - 1];
    const prev = processed[processed.length - 2];
    const trend = last.actualValue - prev.actualValue;

    const febPredict = Math.max(0, last.actualValue + trend);
    const marPredict = Math.max(0, febPredict + trend);

    setChartData([
      ...processed.map(d => ({ ...d, actualDisplay: d.actualValue, predictedDisplay: d.actualValue })),
      { month: 'Feb', predictedDisplay: febPredict, isForecast: true },
      { month: 'Mar', predictedDisplay: marPredict, isForecast: true }
    ]);
    setForecast({ feb: febPredict, mar: marPredict, lastMonth: last.month });
  };

  const formatCurrency = (value) => `$${value?.toLocaleString()}`;

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Alert បង្ហាញនៅពេលបង្ហោះខុសប្រភេទ File */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-6 py-4 rounded-2xl animate-pulse">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financial Forecast</h2>
            <p className="text-gray-500 mt-1">Predicting your future spending patterns</p>
          </div>
          
          <label className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl cursor-pointer transition-all shadow-xl active:scale-95">
            <Upload size={20} />
            <span className="font-bold text-sm">Upload Data</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv, .xlsx, .xls" />
          </label>
        </div>

        {!forecast ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-4xl p-24 text-center">
             <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Upload className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Ready to Analyze?</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2">Upload your Excel or CSV file to see future expense predictions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* ក្រាហ្វបង្ហាញនិន្នាការ */}
              <div className="bg-gray-50 p-8 rounded-4xl border border-gray-100">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-8">
                  <Calendar size={18} className="text-indigo-500" /> Spending Trend & Forecast
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
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

              {/* កាតបង្ហាញតួលេខទស្សន៍ទាយ */}
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

            {/* បំណែងចែកប្រភេទចំណាយ (Pie Chart) */}
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
        )}
      </div>
    </div>
  );
};

export default ForecastView;