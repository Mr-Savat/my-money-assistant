import { useState, useEffect } from 'react';

export const useTransactionData = () => {
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  const loadTransactionData = () => {
    // Load User Data
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) setUserData(JSON.parse(savedUser));

    // Load Transaction Data
    const saved = localStorage.getItem('user_transactions_list');
    setTransactions(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransactionData();
    // Sync across tabs or windows
    window.addEventListener('storage', loadTransactionData);
    const interval = setInterval(loadTransactionData, 3000);

    return () => {
      window.removeEventListener('storage', loadTransactionData);
      clearInterval(interval);
    };
  }, []);

  const getTransactionSummary = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0, totalExpense: 0, balance: 0,
        transactionCount: 0, topCategories: 'No categories yet',
        monthlyTrend: 'No monthly data', recentTransactions: []
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      const date = new Date(t.date);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      const category = t.category || 'Other';

      if (amount > 0) {
        totalIncome += amount;
      } else {
        const absAmount = Math.abs(amount);
        totalExpense += absAmount;
        categoryMap[category] = (categoryMap[category] || 0) + absAmount;
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + absAmount;
      }
    });

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ');

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: (totalIncome - totalExpense).toFixed(2),
      transactionCount: transactions.length,
      topCategories,
      recentTransactions
    };
  };

  return {
    transactions,
    userData,
    summary: getTransactionSummary(),
    refreshData: loadTransactionData
  };
};