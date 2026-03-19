import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { saveTransactions, parseUploadedFile, downloadTemplate } from '../../../utils/transactionUtils';
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

    const syncUploadToBackend = async (dataToSync) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            const uploadPromises = dataToSync.map(txn =>
                fetch(`${API_URL}/api/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        date: txn.date,
                        description: txn.description,
                        amount: txn.amount,
                        category: txn.category || 'Uncategorized'
                    })
                })
            );

            await Promise.all(uploadPromises);
            window.dispatchEvent(new CustomEvent('transactions-updated'));
        } catch (err) {
            console.error("Failed to sync uploads to database:", err);
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
                    onDuplicate: (duplicates, unique, onAddAll, onSkip) => {
                        setDuplicateInfo({ duplicates, totalCount: data.length });
                        setUploadData({
                            onAddAll: async () => {
                                onAddAll();
                                // SYNC ALL TO BACKEND
                                await syncUploadToBackend(data);
                                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                                setTransactions(updated);
                                alert(t('upload.added_dashboard', { count: data.length }));
                            },
                            onSkip: async () => {
                                onSkip();
                                // SYNC ONLY UNIQUE TO BACKEND
                                await syncUploadToBackend(unique);
                                const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                                setTransactions(updated);
                                alert(t('upload.added_skipped', { added: unique.length, skipped: duplicates.length }));
                            }
                        });
                        setShowDuplicateModal(true);
                    },
                    onSuccess: async (saved) => {
                        // SYNC TO BACKEND
                        await syncUploadToBackend(saved);

                        if (option === 'both') processForecastingFromTransactions(data);

                        const updated = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
                        setTransactions(updated);
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