import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
export const useDashboardSummaryCards = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
      balance: 0,
      income: 0,
      expense: 0
    });
    const [userData, setUserData] = useState({
      spendingLimit: 0,
      monthlySalary: 0
    });
  
    useEffect(() => {
      const savedUser = localStorage.getItem('user_data');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserData({
          spendingLimit: user.spendingLimit || 0,
          monthlySalary: user.monthlySalary || 0
        });
      }
    }, []);
  
    // 2. គណនា Percentage
    const hasLimit = userData.spendingLimit && userData.spendingLimit > 0;
    const spendingPercentage = userData.spendingLimit > 0
      ? Math.min(100, Math.round((stats.expense / userData.spendingLimit) * 100))
      : 0;
  
    const isOverLimit = stats.expense > userData.spendingLimit;
  
    const calculateStats = () => {
      const saved = localStorage.getItem('user_transactions_list');
      const transactions = saved ? JSON.parse(saved) : [];
  
      //  បន្ថែមតែត្រង់នេះ 
      // យកតែខែបច្ចុប្បន្ន
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
  
      const currentMonthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getFullYear() === currentYear &&
          transDate.getMonth() === currentMonth;
      });
      //  បញ្ចប់ការបន្ថែម 
  
      const totals = currentMonthTransactions.reduce((acc, curr) => { // កែពី transactions ជា currentMonthTransactions
        const amount = parseFloat(curr.amount);
        if (amount > 0) {
          acc.income += amount;
        } else {
          acc.expense += Math.abs(amount);
        }
        acc.balance += amount;
        return acc;
      }, { balance: 0, income: 0, expense: 0 });
  
      setStats(totals);
    };
  
    useEffect(() => {
      // Initial calculation
      // eslint-disable-next-line react-hooks/set-state-in-effect
      calculateStats();
  
      // Listen for changes in localStorage from other components
      window.addEventListener('storage', calculateStats);
  
      // Custom listener for same-window updates
      const interval = setInterval(calculateStats, 1000);
  
      return () => {
        window.removeEventListener('storage', calculateStats);
        clearInterval(interval);
      };
    }, []);
  
    const formatCurrency = (val) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(val);
    };

    return {
        t, stats, userData, hasLimit, spendingPercentage, isOverLimit, formatCurrency
    }
}