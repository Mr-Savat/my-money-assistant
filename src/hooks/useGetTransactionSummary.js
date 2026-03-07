import { useState, useEffect, useMemo } from 'react';

export const useGetTransactionSummary = () => {
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  const loadData = () => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) setUserData(JSON.parse(savedUser));

    const savedTransactions = localStorage.getItem('user_transactions_list');
    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    window.addEventListener('storage', loadData);
    const interval = setInterval(loadData, 3000);
    return () => {
      window.removeEventListener('storage', loadData);
      clearInterval(interval);
    };
  }, []);

  // We use useMemo so the math only runs when transactions change
  const summary = useMemo(() => {
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

    const balance = totalIncome - totalExpense;

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ') || 'No categories yet';

    const monthlyTrend = Object.entries(monthlyMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Better date sorting
      .map(([month, amt]) => `${month}: $${amt.toFixed(2)}`)
      .join(', ') || 'No monthly data';

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: balance.toFixed(2),
      transactionCount: transactions.length,
      topCategories,
      monthlyTrend,
      recentTransactions
    };
  }, [transactions]);

  return { summary, userData, transactions };
};