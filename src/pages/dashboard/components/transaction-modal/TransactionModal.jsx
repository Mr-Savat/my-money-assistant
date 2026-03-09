import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../../../hooks/useTranslation";
import TypeSelector from "./TypeSelector";
import CategorySelector from "./CategorySelector";

function TransactionModal({ formData, setFormData, categories, setCategories, onClose, onSubmit }) {
  const { t } = useTranslation();

  if (!formData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm sm:max-w-md rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors">
        <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">
            {t('app.name')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={16} className="sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
          <TypeSelector 
            type={formData.type} 
            setType={(type) => setFormData({ ...formData, type })} 
          />

          {/* Date Input */}
          <div>
            <label className="text-[8px] sm:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1 block">
              {t('transaction.date')}
            </label>
            <input
              type="date"
              required
              className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-medium text-sm sm:text-base text-gray-900 dark:text-white"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Description Input */}
          <input
            required
            type="text"
            placeholder={t('transaction.description')}
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-medium text-sm sm:text-base text-gray-900 dark:text-white transition-all"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Amount Input */}
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${
              formData.type === 'expense' ? 'text-red-500' : 'text-emerald-500'
            }`}>
              {formData.type === 'expense' ? '-' : '+'}
            </span>
            <input
              required
              type="number"
              step="0.01"
              placeholder="$0.00"
              className="w-full pl-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-black text-lg sm:text-xl text-gray-900 dark:text-white transition-all"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <CategorySelector
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            setCategories={setCategories}
          />

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 cursor-pointer text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
          >
            {t('transaction.save')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;