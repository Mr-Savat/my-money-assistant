// import { useState, useEffect } from 'react';
import { Upload, Download, AlertCircle, X, ChevronDown } from 'lucide-react';

import { PieSection, CardsForecast, ChartSection } from './components/index';
import UploadOptionsModal from './components/UploadOptionsModal';
import DuplicateSummaryModal from '../../components/DuplicateSummaryModal';
import { useForecast } from "./hooks/useForecast"

const Forecast = () => {

  const {
    t,
    chartData,
    forecast,
    error,
    transactions,
    showDuplicateModal,
    setShowDuplicateModal,
    duplicateInfo,
    showTemplateDropdown,
    setShowTemplateDropdown,
    showUploadModal,
    setShowUploadModal,
    uploadFileName,
    uploadFileData,
    uploadData,
    COLORS,
    handleFileUpload,
    handleCloseError,
    handleDownloadTemplate,
    handleUploadConfirm,
    handleReset,
    formatCurrency
  } = useForecast();
  

  return (
    <div className="w-full min-h-full p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('forecast.title')}
            </h2>
            <p className="text-lg sm:text-base text-gray-500 dark:text-gray-400 mt-1">
              {t('forecast.subtitle')}
            </p>
          </div>

          {/* Button Group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {forecast && (
              <button
                onClick={handleReset}
                className="px-4 cursor-pointer sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-red-100 dark:border-red-900/30 font-bold text-xs sm:text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
              >
                {t('forecast.clear')}
              </button>
            )}

            {/* Template Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-sm"
              >
                <Download size={16} className="sm:w-5 sm:h-5" />
                <span>{t('forecast.template')}</span>
                <ChevronDown size={14} className={`sm:w-4 sm:h-4 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showTemplateDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTemplateDropdown(false)}
                  />
                  <div className="absolute left-2 -translate-x-1/15 mt-2 w-61 sm:w-72 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">

                      {/* Transaction Data Section */}
                      <div className="mb-2">
                        <p className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          {t('forecast.transaction_data')}
                        </p>
                        <button
                          onClick={() => handleDownloadTemplate('transaction', 'csv')}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSV Format</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-500">.csv</span>
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate('transaction', 'excel')}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Excel Format</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-500">.xlsx</span>
                        </button>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

                      {/* Monthly Summary Section */}
                      <div>
                        <p className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          {t('forecast.monthly_summary')}
                        </p>
                        <button
                          onClick={() => handleDownloadTemplate('monthly', 'csv')}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSV Format</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-500">.csv</span>
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate('monthly', 'excel')}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Excel Format</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-500">.xlsx</span>
                        </button>
                      </div>

                      {/* Description at bottom */}
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-[8px] text-gray-400 dark:text-gray-500 text-center">
                          {t('forecast.choose_format')}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <label className="flex items-center gap-1 sm:gap-2 bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all shadow-md sm:shadow-xl active:scale-95 font-bold text-xs sm:text-sm cursor-pointer">
              <Upload size={16} className="sm:w-5 sm:h-5" />
              <span>{t('forecast.upload')}</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv, .xlsx, .xls"
              />
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertCircle size={16} className="sm:w-5 sm:h-5" />
              <span className="font-bold text-xs sm:text-sm">{error}</span>
            </div>
            <button
              onClick={handleCloseError}
              className="p-1 hover:bg-red-100 cursor-pointer dark:hover:bg-red-900/30 rounded-full transition-colors"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left Column - Chart + CardsForecast */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <ChartSection
              chartData={chartData}
              forecast={forecast}
              COLORS={COLORS}
              formatCurrency={formatCurrency}
            />
            <CardsForecast
              forecast={forecast}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Right Column - PieSection */}
          <div className="lg:col-span-1 h-full min-h-75 sm:min-h-87.5 lg:min-h-100">
            <PieSection
              transactions={transactions}
              forecast={forecast}
              chartData={chartData}
              COLORS={COLORS}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadOptionsModal
          fileName={uploadFileName}
          transactionCount={uploadFileData?.length || 0}
          onClose={() => setShowUploadModal(false)}
          onConfirm={handleUploadConfirm}
        />
      )}

      {showDuplicateModal && (
        <DuplicateSummaryModal
          duplicates={duplicateInfo.duplicates}
          totalCount={duplicateInfo.totalCount}
          onClose={() => setShowDuplicateModal(false)}
          onAddAll={() => {
            uploadData.onAddAll();
            setShowDuplicateModal(false);
          }}
          onSkipDuplicates={() => {
            uploadData.onSkip();
            setShowDuplicateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Forecast;