// src/components/DuplicateSummaryModal.jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const DuplicateSummaryModal = ({ 
  duplicates, 
  totalCount,
  onClose, 
  onAddAll, 
  onSkipDuplicates 
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Duplicate Found</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-5 rounded-2xl mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 font-medium">Total in file:</span>
            <span className="font-bold text-gray-900">{totalCount}</span>
          </div>
          <div className="flex justify-between text-emerald-600 border-b border-gray-200 pb-2 mb-2">
            <span className="font-medium">✅ New transactions:</span>
            <span className="font-bold">{totalCount - duplicates.length}</span>
          </div>
          <div className="flex justify-between text-amber-600">
            <span className="font-medium">⚠️ Duplicates:</span>
            <span className="font-bold">{duplicates.length}</span>
          </div>
        </div>

        {/* Duplicate Examples */}
        {duplicates.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              First {Math.min(3, duplicates.length)} duplicates:
            </p>
            <div className="space-y-2">
              {duplicates.slice(0, 3).map((dup, i) => (
                <div key={i} className="bg-amber-50 p-3 rounded-xl text-sm flex justify-between items-center">
                  <span className="font-mono text-gray-600">{dup.date}</span>
                  <span className="font-medium text-gray-800">{dup.description}</span>
                  <span className="font-bold text-amber-700">
                    ${Math.abs(dup.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {duplicates.length > 3 && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  ... and {duplicates.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSkipDuplicates}
            className="py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95"
          >
            Skip Duplicates
          </button>
          <button
            onClick={onAddAll}
            className="py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all active:scale-95"
          >
            Add All
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel Upload
        </button>
      </div>
    </div>
  );
};

export default DuplicateSummaryModal;