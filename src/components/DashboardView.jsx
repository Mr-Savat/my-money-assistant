import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { User, Bell, Search, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { financeData } from "../constants";

const Dashboard = () => {
  // 1. គណនាទិន្នន័យសម្រាប់ Forecast
  const lastMonth = financeData[financeData.length - 1];
  const prevMonth = financeData[financeData.length - 2];
  const lastTotal = Object.values(lastMonth.expenses).reduce((a, b) => a + b, 0);
  const prevTotal = Object.values(prevMonth.expenses).reduce((a, b) => a + b, 0);
  const trend = (lastTotal - prevTotal) / (prevTotal || 1);
  const prediction = Math.round(lastTotal * (1 + trend));

  const chartData = [
    ...financeData.map(d => ({
      name: d.month,
      income: d.income,
      expense: Object.values(d.expenses).reduce((a, b) => a + b, 0),
    })),
    { name: 'Feb (AI)', forecast: prediction, expense: lastTotal }
  ];

  const formatMoney = (value) => {
    return `$${value.toLocaleString()}`;
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-[#1E293B] font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- SECTION 1: TOP NAVIGATION & USER PROFILE --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, Alex!</h1>
            <p className="text-gray-500 font-medium">Here's what's happening with your money today.</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 px-3 border-r border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none">Alex Johnson</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">Pro Plan</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </div>

        {/* --- SECTION 2: SUMMARY CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Wallet size={24} /></div>
              <span className="flex items-center text-emerald-500 text-xs font-bold"><TrendingUp size={14} className="mr-1" /> +12%</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Balance</p>
            <h2 className="text-3xl font-black mt-1">$24,563.00</h2>
          </div>

          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ArrowUpRight size={24} /></div>
              <span className="text-gray-400 text-xs font-bold">Monthly</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Monthly Income</p>
            <h2 className="text-3xl font-black mt-1 text-emerald-600">$9,200.00</h2>
          </div>

          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><ArrowDownRight size={24} /></div>
              <span className="text-rose-500 text-xs font-bold">-3.1%</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Monthly Expenses</p>
            <h2 className="text-3xl font-black mt-1 text-rose-600">$5,840.00</h2>
          </div>
        </div>

        {/* --- SECTION 3: MAIN CHART & TRANSACTIONS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Finance Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black tracking-tight">Financial Forecast</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[10px] font-bold uppercase text-gray-400">Income</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-[10px] font-bold uppercase text-gray-400">Expense</span></div>
              </div>
            </div>

            <div className="h-87.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatMoney} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip formatter={(value, name) => {
                    const labelMap = {
                      income: "Income",
                      expense: "Expense",
                      forecast: "Forecast"
                    };

                    return [`$${value.toLocaleString()}`, labelMap[name]];
                  }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fill="url(#gradIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={4} fill="url(#gradExpense)" />
                  <Area type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={4} strokeDasharray="8 8" fill="transparent" />
                  <ReferenceLine x={lastMonth.month} stroke="#CBD5E1" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <p className="text-xs text-amber-800 font-medium italic">AI Prediction: You are expected to spend <span className="font-black">${prediction}</span> in the upcoming month.</p>
            </div>
          </div>

          {/* Recent Transactions (1/3 width) */}
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black tracking-tight">Transactions</h3>
              <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
            </div>

            <div className="space-y-6 flex-1">
              {[
                { name: 'Grocery Store', date: 'Today', amount: '-$125.50', icon: '🛒', color: 'bg-orange-50' },
                { name: 'Salary Deposit', date: 'Yesterday', amount: '+$4,500.00', icon: '💰', color: 'bg-emerald-50' },
                { name: 'Coffee Shop', date: 'Jan 28', amount: '-$8.50', icon: '☕', color: 'bg-blue-50' },
                { name: 'Rent Payment', date: 'Jan 25', amount: '-$1,200.00', icon: '🏠', color: 'bg-purple-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-xl`}>{item.icon}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{item.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black ${item.amount.startsWith('+') ? 'text-emerald-600' : 'text-gray-900'}`}>{item.amount}</p>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95">
              Add Transaction
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;