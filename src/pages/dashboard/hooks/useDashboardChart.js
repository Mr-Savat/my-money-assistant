import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDashboardChart = () => {
  const { t } = useTranslation();
  // Live React state backed by backend Firestore
  const [chartData, setChartData] = useState([]);
  const hasData = chartData.length > 0;
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchDailyData = async () => {
    if (!isAuthenticated) return;

    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(`${API_URL}/api/dashboard/daily`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {

        const formatted = data.daily.map(item => ({
          name: item.date,
          income: item.income,
          expense: item.expense
        }));

        setChartData(formatted);
      }
    } catch (err) {
      console.error('Error fetching daily data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDailyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchDailyData();

    const interval = setInterval(fetchDailyData, 30000);

    //  ស្តាប់ transactions-updated event 
    const handleTransactionUpdate = () => {
      fetchDailyData(); // ទាញយក Chart ថ្មី
    };

    window.addEventListener('transactions-updated', handleTransactionUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('transactions-updated', handleTransactionUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const formatDate = (dateStr) => {
    if (!dateStr) return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMoney = (value) => `$${value?.toLocaleString()}`;

  return {
    t,
    hasData,
    chartData,
    formatDate,
    formatMoney,
    loading
  };
};