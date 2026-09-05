import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { saveTransactions, parseUploadedFile, downloadTemplate, extractCategoryBreakdown } from '../../../utils/transactionUtils';
import { auth } from "../../../firebase/config";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const useForecast = () => {
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
        // Clean up any stale localStorage leftover from legacy versions
        localStorage.removeItem('user_transactions_list');

        const savedData = localStorage.getItem('forecastStorage');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                let savedForecast = parsed.forecast || null;
                const savedChart = parsed.chartData || [];

                // Backfill categoryBreakdown if missing from saved forecast
                if (savedForecast && (!savedForecast.categoryBreakdown || savedForecast.categoryBreakdown.length === 0) && savedChart.length > 0) {
                    const actualMonths = savedChart.filter(d => !d.isForecast);
                    const lastActual = actualMonths[actualMonths.length - 1];
                    if (lastActual) {
                        savedForecast = {
                            ...savedForecast,
                            categoryBreakdown: extractCategoryBreakdown(lastActual)
                        };
                    }
                }

                setChartData(savedChart);
                setForecast(savedForecast);
            } catch (err) {
                console.error("Failed to parse forecastStorage", err);
            }
        }

        const loadTransactions = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const token = await user.getIdToken();
                    if (token) {
                        const response = await fetch(`${API_URL}/api/transactions`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        if (data.success && data.transactions) {
                            setTransactions(data.transactions);
                        }
                    }
                }
            } catch (err) {
                console.warn('Could not fetch backend transactions for forecast:', err);
            }
        };

        loadTransactions();
        window.addEventListener('transactions-updated', loadTransactions);

        return () => {
            window.removeEventListener('transactions-updated', loadTransactions);
        };
    }, []);

    // Function រក Top Category
    const getTopCategory = (monthData) => {
        const categories = extractCategoryBreakdown(monthData);
        if (!categories || categories.length === 0) return null;

        const top = categories[0];
        const total = categories.reduce((sum, cat) => sum + cat.value, 0);

        return {
            name: top.name,
            amount: top.value,
            percentage: total > 0 ? Math.round((top.value / total) * 100) : 0
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

    const syncUploadToBackend = async (dataToSync) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('Please log in first to sync transactions to your account.');
                return;
            }
            const token = await user.getIdToken();
            const formattedList = dataToSync.map((rawTxn) => {
                const date = rawTxn.date || rawTxn.Date || new Date().toISOString().split('T')[0];
                const description = rawTxn.description || rawTxn.Description || 'Transaction';
                const amount = rawTxn.amount !== undefined ? rawTxn.amount : (rawTxn.Amount || 0);
                const category = rawTxn.category || rawTxn.Category || 'Other';
                return {
                    date: String(date).split('T')[0],
                    description: String(description).trim(),
                    amount: parseFloat(amount) || 0,
                    category: String(category).trim()
                };
            });

            // Fast single-request batch upload
            const response = await fetch(`${API_URL}/api/transactions/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ transactions: formattedList })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to upload batch transactions');
            }

            window.dispatchEvent(new CustomEvent('transactions-updated'));
        } catch (err) {
            console.error("Failed to sync uploads to database:", err);
            alert(`Error uploading transactions: ${err.message}`);
        }
    };

    //  Function សម្រាប់បិទ Error 
    const handleCloseError = () => {
        setError("");
    };

    const handleUploadConfirm = (option) => {
        setShowUploadModal(false);
        const data = uploadFileData;

        switch (option) {
            case 'dashboard':
            case 'both':
                saveTransactions(data, {
                    existingTransactions: transactions,
                    onDuplicate: (duplicates, unique, onAddAll, onSkip) => {
                        setDuplicateInfo({ duplicates, totalCount: data.length });
                        setUploadData({
                            onAddAll: async () => {
                                onAddAll();
                                // SYNC ALL TO BACKEND
                                await syncUploadToBackend(data);
                                if (option === 'both') processForecastingFromTransactions(data);
                                setTransactions(prev => [...data, ...prev]);
                                alert(t('upload.added_dashboard', { count: data.length }));
                            },
                            onSkip: async () => {
                                onSkip();
                                // SYNC ONLY UNIQUE TO BACKEND
                                await syncUploadToBackend(unique);
                                if (option === 'both') processForecastingFromTransactions(unique);
                                setTransactions(prev => [...unique, ...prev]);
                                alert(t('upload.added_skipped', { added: unique.length, skipped: duplicates.length }));
                            }
                        });
                        setShowDuplicateModal(true);
                    },
                    onSuccess: async (saved) => {
                        // SYNC TO BACKEND
                        await syncUploadToBackend(saved);

                        if (option === 'both') processForecastingFromTransactions(data);

                        setTransactions(prev => [...saved, ...prev]);
                        alert(`✅ Added ${saved.length} transactions to Dashboard & Database`);
                    }
                });
                break;

            case 'forecast':
                processForecastingFromTransactions(data);
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

        const ignoredKeys = new Set([
            'month', 'year', 'total', 'actualvalue', 'actualdisplay',
            'predicteddisplay', 'isforecast', 'date', 'amount', 'description', 'category'
        ]);

        const processed = rawData.map(row => {
            let actualValue = 0;
            Object.entries(row).forEach(([k, v]) => {
                if (!ignoredKeys.has(k.toLowerCase()) && typeof v === 'number') {
                    actualValue += v;
                }
            });
            if (actualValue === 0 && row.total) actualValue = row.total;
            return {
                ...row,
                actualValue
            };
        });

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
            topCategory: getTopCategory(last),
            categoryBreakdown: extractCategoryBreakdown(last)
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

    return {
        t, chartData, forecast, error, transactions,
        showDuplicateModal, setShowDuplicateModal,
        duplicateInfo, showTemplateDropdown, setShowTemplateDropdown,
        showUploadModal, setShowUploadModal,
        uploadFileName, uploadFileData, uploadData,
        COLORS, handleFileUpload, handleCloseError,
        handleDownloadTemplate, handleUploadConfirm,
        handleReset, formatCurrency
    }
}