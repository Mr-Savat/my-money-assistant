// src/components/DuplicateSummaryModal.jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation'; 

const DuplicateSummaryModal = ({ 
  duplicates, 
  totalCount,
  onClose, 
  onAddAll, 
  onSkipDuplicates 
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
              <AlertCircle className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('duplicate.title')}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">{t('duplicate.total_in_file')}:</span>
            <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span>
          </div>
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
            <span className="font-medium">✅ {t('duplicate.new_transactions')}:</span>
            <span className="font-bold">{totalCount - duplicates.length}</span>
          </div>
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span className="font-medium">⚠️ {t('duplicate.duplicates')}:</span>
            <span className="font-bold">{duplicates.length}</span>
          </div>
        </div>

        {/* Duplicate Examples */}
        {duplicates.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              {t('duplicate.first_duplicates', { count: Math.min(3, duplicates.length) })}
            </p>
            <div className="space-y-2">
              {duplicates.slice(0, 3).map((dup, i) => (
                <div key={i} className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-sm flex justify-between items-center">
                  <span className="font-mono text-gray-600 dark:text-gray-400">{dup.date}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{dup.description}</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    ${Math.abs(dup.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {duplicates.length > 3 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                  {t('duplicate.and_more', { count: duplicates.length - 3 })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSkipDuplicates}
            className="py-4 cursor-pointer bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95"
          >
            {t('duplicate.skip_duplicates')}
          </button>
          <button
            onClick={onAddAll}
            className="py-4 cursor-pointer bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all active:scale-95"
          >
            {t('duplicate.add_all')}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full cursor-pointer mt-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          {t('common.cancel_upload')}
        </button>
      </div>
    </div>
  );
};

export default DuplicateSummaryModal;