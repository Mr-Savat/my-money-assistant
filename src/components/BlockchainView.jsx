import React from 'react';
import { ShieldCheck, RefreshCw, ExternalLink, Copy, Box, Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const BlockchainView = () => {
  const { t } = useTranslation();

  // Stats for the top row
  const stats = [
    { label: t('blockchain.total'), value: '247', icon: <Box size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: t('blockchain.confirmed'), value: '243', icon: <ShieldCheck size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: t('blockchain.pending'), value: '4', icon: <RefreshCw size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
    { label: t('blockchain.balance'), value: '2.45', icon: <span className="text-indigo-600 font-bold">#</span>, bg: 'bg-indigo-50' },
  ];

  const transactions = [
    { hash: '0x7a8b9c...4f5a6b', type: 'Receive', amount: '0.5 ETH', fromTo: '0x1234...5678', time: '2026-01-31 14:32:05', status: 'Confirmed' },
    { hash: '0x8b9c0d...5a6b7c', type: 'Send', amount: '100 USDC', fromTo: '0xabcd...efgh', time: '2026-01-30 09:15:22', status: 'Confirmed' },
    { hash: '0x9c0d1e...6b7c8d', type: 'Swap', amount: '0.25 ETH → USDC', fromTo: 'Uniswap', time: '2026-01-29 18:45:10', status: 'Confirmed' },
    { hash: '0xa0b1c2...f7a8b9', type: 'Receive', amount: '250 USDC', fromTo: '0x5678...1234', time: '2026-01-28 12:00:00', status: 'Pending' },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50/50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-gray-200 space-y-6 sm:space-y-8 animate-in fade-in duration-500 transition-colors">

      {/* Header - Responsive */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('blockchain.title')}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">
            {t('blockchain.subtitle')}
          </p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            placeholder={t('blockchain.search')}
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </header>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
            <div className={`${stat.bg} dark:bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table - Responsive */}
      <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-50 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
            {t('blockchain.history')}
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-200 md:min-w-full w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/50 dark:bg-gray-700/50 text-slate-400 dark:text-gray-400 uppercase text-[8px] sm:text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">{t('blockchain.hash')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4">{t('blockchain.type')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4">{t('blockchain.amount')}</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">{t('blockchain.from_to')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4">{t('blockchain.status')}</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-right">{t('blockchain.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
              {transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
                    <div className="flex items-center gap-1 sm:gap-2 font-mono text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <span className="truncate max-w-20 sm:max-w-none">{txn.hash}</span>
                      <Copy size={12} className="cursor-pointer text-slate-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-5">
                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${
                      txn.type === 'Receive' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      txn.type === 'Send' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 
                      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-5 font-bold text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">{txn.amount}</td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-5 text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium truncate max-w-25">{txn.fromTo}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-5">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        txn.status === 'Confirmed' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-400 animate-pulse'
                      }`} />
                      <span className={`text-[8px] sm:text-xs font-bold ${
                        txn.status === 'Confirmed' ? 'text-slate-700 dark:text-gray-300' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className="hidden sm:inline">{txn.status}</span>
                        <span className="sm:hidden">{txn.status === 'Confirmed' ? '✓' : '⏳'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-right">
                    <button className="text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1">
                      <ExternalLink size={16} className="sm:w-4.5 sm:h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Hint */}
        <div className="sm:hidden p-3 text-center text-[10px] text-slate-400 dark:text-gray-500 border-t border-slate-50 dark:border-gray-700">
          {t('blockchain.scroll_hint')}
        </div>
      </div>
    </div>
  );
};

export default BlockchainView;