import React, { useState } from 'react';
import { X, TrendingUp, List, Layers } from 'lucide-react';

const UploadOptionsModal = ({ 
  fileName, 
  transactionCount, 
  onClose, 
  onConfirm 
}) => {
  const [selectedOption, setSelectedOption] = useState('both');

  const options = [
    {
      id: 'forecast',
      title: 'Forecast Only',
      description: 'Use data for prediction only (not saved to transaction list)',
      icon: <TrendingUp size={20} />,
      color: 'amber'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Only',
      description: 'Add to your transaction list (no forecast generated)',
      icon: <List size={20} />,
      color: 'emerald'
    },
    {
      id: 'both',
      title: 'Both',
      description: 'Add to list AND generate forecast',
      icon: <Layers size={20} />,
      color: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-600',
        ring: 'ring-amber-500'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
        ring: 'ring-emerald-500'
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        icon: 'text-indigo-600',
        ring: 'ring-indigo-500'
      }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tight">Upload Complete</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* File Info */}
        <div className="bg-gray-50 p-4 rounded-2xl mb-6">
          <p className="text-sm text-gray-600">File: <span className="font-medium text-gray-900">{fileName}</span></p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-bold text-indigo-600">{transactionCount}</span> transactions found
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            What would you like to do?
          </p>
          
          {options.map((opt) => {
            const colors = getColorClasses(opt.color);
            const isSelected = selectedOption === opt.id;
            
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`
                  p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? `${colors.bg} ${colors.border} ring-2 ${colors.ring} ring-offset-2` 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? colors.bg : 'bg-gray-100'}`}>
                    <div className={isSelected ? colors.icon : 'text-gray-400'}>
                      {opt.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isSelected ? colors.text : 'text-gray-700'}`}>
                        {opt.title}
                      </h3>
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSelected 
                          ? `${colors.border} border-2` 
                          : 'border-gray-300'
                        }
                      `}>
                        {isSelected && (
                          <div className={`w-3 h-3 rounded-full ${colors.bg.replace('bg-', 'bg-')}`} />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {opt.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-4 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedOption)}
            className="py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadOptionsModal;