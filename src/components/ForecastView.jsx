import { useState, useEffect } from 'react';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';
import { Upload, Download, AlertCircle, X, ChevronDown } from 'lucide-react';
import PieSection from './PieSectionForecast';
import SummaryCards from './CardsForecast';
import ChartSection from './ChartSectionForecast';
import { saveTransactions, parseUploadedFile, downloadTemplate } from '../utils/transactionUtils';
import DuplicateSummaryModal from '../components/DuplicateSummaryModal';
import UploadOptionsModal from '../components/UploadOptionsModal';
import { useTranslation } from '../hooks/useTranslation';

const ForecastView = () => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);

  // State សម្រាប់ Duplicate Modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState({ duplicates: [], totalCount: 0 });
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // State សម្រាប់ Upload Options Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileData, setUploadFileData] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');

  const COLORS = {
    actual: "#4f46e5",
    predicted: "#f43f5e",
    pie: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    indigoBg: "#eef2ff",
    roseBg: "#fff1f2"
  };

  const handleDownloadTemplate = (type, format) => {
    downloadTemplate(type, format);
    setShowTemplateDropdown(false);
  };

  useEffect(() => {
    const savedData = localStorage.getItem('forecastStorage');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChartData(parsed.chartData || []);
      setForecast(parsed.forecast || null);
    }

    const loadTransactions = () => {
      const savedTransactions = localStorage.getItem('user_transactions_list');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    };

    loadTransactions();
    window.addEventListener('storage', loadTransactions);

    return () => {
      window.removeEventListener('storage', loadTransactions);
    };
  }, []);

  // Function រក Top Category
  const getTopCategory = (monthData) => {
    const categories = [
      { name: 'Food', amount: monthData.food || 0 },
      { name: 'Transport', amount: monthData.transport || 0 },
      { name: 'Shopping', amount: monthData.shopping || 0 },
      { name: 'Other', amount: monthData.other || 0 }
    ];

    const top = categories.reduce((max, cat) => cat.amount > max.amount ? cat : max);

    if (top.amount === 0) return null;

    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

    return {
      name: top.name,
      amount: top.amount,
      percentage: Math.round((top.amount / total) * 100)
    };
  };


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return;

    try {
      const jsonData = await parseUploadedFile(file);

      // ពិនិត្យមើលឲ្យបានបត់បែនជាងមុន 
      if (jsonData && jsonData.length > 0) {
        const firstRow = jsonData[0];
        const columns = Object.keys(firstRow).map(key => key.trim().toLowerCase());

        // ពិនិត្យរក month column (អាចមាន spaces ឬ uppercase)
        if (columns.includes('month') &&
          (columns.includes('food') || columns.includes('transport'))) {
          // Monthly Summary
          console.log("✅ Detected Monthly Summary format");
          processForecasting(jsonData);
        }
        // ពិនិត្យរក date column
        else if (columns.includes('date') &&
          (columns.includes('amount') || columns.includes('description'))) {
          // Transaction Data
          console.log("✅ Detected Transaction Data format");
          setUploadFileData(jsonData);
          setUploadFileName(file.name);
          setShowUploadModal(true);
        }
        else {
          console.log("❌ Unknown format. Columns:", columns);
          setError(t('upload.unknown_format'));
        }
      } else {
        setError(t('upload.file_empty'));
      }
    } catch (err) {
      setError(err.message || t('upload.read_problem'));
    }

    e.target.value = '';
  };

  //  Function សម្រាប់បិទ Error 
  const handleCloseError = () => {
    setError("");
  };

  // Function សម្រាប់ Confirm Upload
  const handleUploadConfirm = (option) => {
    setShowUploadModal(false);

    const data = uploadFileData;

    switch (option) {
      case 'forecast':
        // Forecast only
        processForecastingFromTransactions(data);
        break;

      case 'dashboard':
        // Dashboard only
        saveTransactions(data, {
          onDuplicate: (duplicates, unique, onAddAll, onSkip) => {
            setDuplicateInfo({ duplicates, totalCount: data.length });
            setUploadData({
              onAddAll: () => {
                onAddAll();
                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                setTransactions(updated);
                alert(t('upload.added_dashboard', { count: data.length }));
              },
              onSkip: () => {
                onSkip();
                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                setTransactions(updated);
                alert(t('upload.added_skipped', { added: unique.length, skipped: duplicates.length }));
              }
            });
            setShowDuplicateModal(true);
          },
          onSuccess: (saved) => {
            alert(t('upload.added_dashboard', { count: saved.length }));
            const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
            setTransactions(updated);
          }
        });
        break;

      case 'both':
      default:
        // Both (Forecast + Dashboard)
        saveTransactions(data, {
          onDuplicate: (duplicates, unique, onAddAll, onSkip) => {
            setDuplicateInfo({ duplicates, totalCount: data.length });
            setUploadData({
              onAddAll: () => {
                onAddAll();
                processForecastingFromTransactions(data);
                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                setTransactions(updated);
              },
              onSkip: () => {
                onSkip();
                processForecastingFromTransactions(unique);
                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                setTransactions(updated);
              }
            });
            setShowDuplicateModal(true);
          },
          onSuccess: (saved) => {
            processForecastingFromTransactions(data);
            alert(`✅ Added ${saved.length} transactions to Dashboard`);
            const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
            setTransactions(updated);
          }
        });
        break;
    }
  };

  const processForecastingFromTransactions = (transactionData) => {
    const monthlyMap = {};

    transactionData.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${year}-${month}`;
      const amount = parseFloat(t.amount);

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month,
          year,
          food: 0,
          transport: 0,
          shopping: 0,
          other: 0,
          total: 0
        };
      }

      if (amount < 0) {
        const category = t.category || 'Other';
        const absAmount = Math.abs(amount);

        if (category.toLowerCase() === 'food') monthlyMap[monthKey].food += absAmount;
        else if (category.toLowerCase() === 'transport') monthlyMap[monthKey].transport += absAmount;
        else if (category.toLowerCase() === 'shopping') monthlyMap[monthKey].shopping += absAmount;
        else monthlyMap[monthKey].other += absAmount;

        monthlyMap[monthKey].total += absAmount;
      }
    });

    const monthlyData = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    if (monthlyData.length >= 2) {
      processForecasting(monthlyData);
    } else {
      setError(t('forecast.not_enough_data'));
    }
  };

  const processForecasting = (rawData) => {
    if (!rawData || rawData.length < 2) {
      setError("Not enough data to generate forecast. Need at least 2 months.");
      setForecast(null);
      setChartData([]);
      return;
    }

    const processed = rawData.map(row => ({
      ...row,
      actualValue: (row.food || 0) + (row.transport || 0) + (row.shopping || 0) + (row.other || 0),
    }));

    const last = processed[processed.length - 1];
    const prev = processed[processed.length - 2];

    const trend = last.actualValue - prev.actualValue;
    const conservativeTrend = trend * 0.7;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const lastMonthIndex = months.indexOf(last.month);
    const nextMonth = months[lastMonthIndex + 1] || 'Jan';

    const nextValue = Math.max(0, last.actualValue + conservativeTrend);

    const finalChartData = [
      ...processed.map(d => ({
        ...d,
        actualDisplay: d.actualValue,
        predictedDisplay: d.actualValue
      })),
      {
        month: nextMonth,
        predictedDisplay: Math.round(nextValue),
        isForecast: true
      }
    ];

    const finalForecast = {
      nextMonth: nextMonth,
      nextValue: Math.round(nextValue),
      lastMonth: last.month,
      lastValue: last.actualValue,
      trend: Math.round(trend),
      topCategory: getTopCategory(last)
    };

    setChartData(finalChartData);
    setForecast(finalForecast);
    localStorage.setItem('forecastStorage', JSON.stringify({ chartData: finalChartData, forecast: finalForecast }));
    setError("");
  };

  const handleReset = () => {
    if (window.confirm("Clear all forecast data?")) {
      localStorage.removeItem('forecastStorage');
      setForecast(null);
      setChartData([]);
      setError("");
    }
  };


  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return t('common.noData');
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
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
          {/* Left Column - Chart + SummaryCards */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <ChartSection
              chartData={chartData}
              forecast={forecast}
              COLORS={COLORS}
              formatCurrency={formatCurrency}
            />
            <SummaryCards
              forecast={forecast}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Right Column - PieSection */}
          <div className="lg:col-span-1 h-full min-h-75 sm:min-h-87.5 lg:min-h-100">
            <PieSection
              transactions={transactions}
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

export default ForecastView;