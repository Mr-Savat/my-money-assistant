import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Outlet, useNavigate } from 'react-router-dom';
import { Upload, AlertCircle } from 'lucide-react';

const ForecastView = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");

  const COLORS = {
    actual: "#4f46e5",
    predicted: "#f43f5e",
    pie: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
    indigoBg: "#eef2ff",
    roseBg: "#fff1f2"
  };

  // Load from localStorage on refresh
  useEffect(() => {
    const savedData = localStorage.getItem('forecastStorage');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setChartData(parsed.chartData);
      setForecast(parsed.forecast);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        let jsonData = [];
        if (extension === 'csv') {
          const result = Papa.parse(evt.target.result, { header: true, dynamicTyping: true });
          jsonData = result.data.filter(row => row.month);
        } else {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        }
        processForecasting(jsonData);
        navigate('/forecast/results');
      } catch (err) {
        setError("Problem reading data. Check file format.");
        console.log(err);
      }
    };

    if (extension === 'csv') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  const handleReset = () => {
    // Show an alert to the user
    const confirmClear = window.confirm(
      "Are you sure you want to clear your forecast data? You will need to upload your file again to see the charts."
    );

    // If the user clicks "OK", clear the data
    if (confirmClear) {
      localStorage.removeItem('forecastStorage');
      setForecast(null);
      setChartData([]);
      setError(""); // Clear any existing errors too
      navigate('/forecast');
    }
    // If they click "Cancel", nothing happens
  };

  const processForecasting = (rawData) => {
    const processed = rawData.map(row => ({
      ...row,
      actualValue: (row.food || 0) + (row.transport || 0) + (row.shopping || 0) + (row.other || 0),
    }));

    const last = processed[processed.length - 1];
    const prev = processed[processed.length - 2];
    const trend = last.actualValue - prev.actualValue;

    const febPredict = Math.max(0, last.actualValue + trend);
    const marPredict = Math.max(0, febPredict + trend);

    // FIXED: Corrected the variable names here
    const finalChartData = [
      ...processed.map(d => ({ ...d, actualDisplay: d.actualValue, predictedDisplay: d.actualValue })),
      { month: 'Feb', predictedDisplay: febPredict, isForecast: true },
      { month: 'Mar', predictedDisplay: marPredict, isForecast: true }
    ];

    const finalForecast = { feb: febPredict, mar: marPredict, lastMonth: last.month };

    // Update State
    setChartData(finalChartData);
    setForecast(finalForecast);

    // Save to localStorage
    localStorage.setItem('forecastStorage', JSON.stringify({
      chartData: finalChartData,
      forecast: finalForecast
    }));
  };

  const formatCurrency = (value) => `$${value?.toLocaleString()}`;

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financial Forecast</h2>
            <p className="text-gray-500 mt-1">Predicting your future spending patterns</p>
          </div>

          <div className="flex gap-3">
            {/* Show Reset button only if data exists */}
            {forecast && (
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-2xl border border-red-100 font-bold text-sm text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                Clear Data
              </button>
            )}

            <label className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl cursor-pointer transition-all shadow-xl active:scale-95">
              <Upload size={20} />
              <span className="font-bold text-sm">Upload Data</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv, .xlsx, .xls" />
            </label>
          </div>
        </div>

        <Outlet context={{
          handleFileUpload,
          handleReset,
          forecast,
          chartData,
          COLORS,
          formatCurrency
        }} />
      </div>
    </div>
  );
};

export default ForecastView;