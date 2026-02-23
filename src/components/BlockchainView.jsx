import React from 'react';
import { ShieldCheck, RefreshCw, ExternalLink, Copy, Box, Search } from 'lucide-react';

const BlockchainView = () => {
  // Stats for the top row
  const stats = [
    { label: 'Total Transactions', value: '247', icon: <Box size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Confirmed', value: '243', icon: <ShieldCheck size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Pending', value: '4', icon: <RefreshCw size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'ETH Balance', value: '2.45', icon: <span className="text-indigo-600 font-bold">#</span>, bg: 'bg-indigo-50' },
  ];

  const transactions = [
    { hash: '0x7a8b9c...4f5a6b', type: 'Receive', amount: '0.5 ETH', fromTo: '0x1234...5678', time: '2026-01-31 14:32:05', status: 'Confirmed' },
    { hash: '0x8b9c0d...5a6b7c', type: 'Send', amount: '100 USDC', fromTo: '0xabcd...efgh', time: '2026-01-30 09:15:22', status: 'Confirmed' },
    { hash: '0x9c0d1e...6b7c8d', type: 'Swap', amount: '0.25 ETH → USDC', fromTo: 'Uniswap', time: '2026-01-29 18:45:10', status: 'Confirmed' },
    { hash: '0xa0b1c2...f7a8b9', type: 'Receive', amount: '250 USDC', fromTo: '0x5678...1234', time: '2026-01-28 12:00:00', status: 'Pending' },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50/50 p-8 text-slate-900 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Blockchain Ledger</h1>
          <p className="text-slate-500 text-sm">Verified cryptographic history of your assets</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search hash..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64"
          />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <div className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black mt-1 text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-4">Transaction Hash</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">From / To</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 font-mono text-xs text-blue-600 font-medium">
                      {txn.hash}
                      <Copy size={14} className="cursor-pointer text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${txn.type === 'Receive' ? 'bg-emerald-100 text-emerald-700' :
                      txn.type === 'Send' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900">{txn.amount}</td>
                  <td className="px-6 py-5 text-slate-500 text-xs font-medium">{txn.fromTo}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${txn.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                      <span className={`text-xs font-bold ${txn.status === 'Confirmed' ? 'text-slate-700' : 'text-amber-600'}`}>
                        {txn.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockchainView;