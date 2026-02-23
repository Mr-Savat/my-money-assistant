import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Download, AlertCircle, X, ChevronDown } from 'lucide-react'; // ++++++++++ បន្ថែម X icon ++++++++++
import PieSection from './PieSectionForecast';
import SummaryCards from './CardsForecast';
import ChartSection from './ChartSectionForecast';
import { saveTransactions, parseUploadedFile, downloadTemplate, downloadMonthlyTemplate  } from '../utils/transactionUtils';
import DuplicateSummaryModal from '../components/DuplicateSummaryModal';
import UploadOptionsModal from '../components/UploadOptionsModal';

const ForecastView = () => {
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

    // ++++++++++ Function សម្រាប់ទាញយក Template ផ្សេងៗ ++++++++++
    const handleDownloadTransactionTemplate = () => {
      downloadTemplate(); // Transaction Data Format
      setShowTemplateDropdown(false);
    };

    const handleDownloadMonthlyTemplate = () => {
      downloadMonthlyTemplate(); // Monthly Summary Format
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

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return;

    try {
      const jsonData = await parseUploadedFile(file);

     // ++++++++++ ពិនិត្យមើលឲ្យបានបត់បែនជាងមុន ++++++++++
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
    setError("Unknown data format. Please use the template.");
  }
} else {
  setError("File is empty");
}
    } catch (err) {
      setError(err.message || "Problem reading data. Check file format.");
    }

    e.target.value = '';
  };

  // ++++++++++ Function សម្រាប់បិទ Error ++++++++++
  const handleCloseError = () => {
    setError("");
  };

  // Function សម្រាប់ Confirm Upload
  const handleUploadConfirm = (option) => {
    setShowUploadModal(false);
    
    const data = uploadFileData;
    
    switch(option) {
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
                alert(`✅ Added ${data.length} transactions to Dashboard`);
              },
              onSkip: () => {
                onSkip();
                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                setTransactions(updated);
                alert(`✅ Added ${unique.length} transactions (skipped ${duplicates.length} duplicates)`);
              }
            });
            setShowDuplicateModal(true);
          },
          onSuccess: (saved) => {
            alert(`✅ Added ${saved.length} transactions to Dashboard`);
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
      setError("Not enough monthly data to generate forecast. Need at least 2 months of transactions.");
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
      return "Not have data yet";
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financial Forecast</h2>
            <p className="text-gray-500 mt-1">Predicting your future spending patterns</p>
          </div>

          <div className="flex gap-3">
            {forecast && (
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-2xl border border-red-100 font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
              >
                Clear Data
              </button>
            )}


<div className="relative">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl cursor-pointer transition-all font-bold text-sm"
              >
                <Download size={20} />
                <span>Template</span>
                <ChevronDown size={16} className={`transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showTemplateDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowTemplateDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      <button
                        onClick={handleDownloadTransactionTemplate}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <p className="font-bold text-gray-700">Transaction Data</p>
                        <p className="text-xs text-gray-400">date, description, amount, category</p>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleDownloadMonthlyTemplate}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <p className="font-bold text-gray-700">Monthly Summary</p>
                        <p className="text-xs text-gray-400">month, food, transport, shopping, other</p>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <label className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl cursor-pointer transition-all shadow-xl active:scale-95">
              <Upload size={20} />
              <span className="font-bold text-sm">Upload Data</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv, .xlsx, .xls"
              />
            </label>
          </div>
        </div>

        {/* ++++++++++ Error Message with Close Button ++++++++++ */}
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="font-bold text-sm">{error}</span>
            </div>
            <button
              onClick={handleCloseError}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-8">
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

          <PieSection
            transactions={transactions}
            COLORS={COLORS}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Upload Options Modal */}
      {showUploadModal && (
        <UploadOptionsModal
          fileName={uploadFileName}
          transactionCount={uploadFileData?.length || 0}
          onClose={() => setShowUploadModal(false)}
          onConfirm={handleUploadConfirm}
        />
      )}

      {/* Duplicate Modal */}
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