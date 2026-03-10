import { useState, useEffect } from 'react';

export const useGetTransactionSummary = () => {
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  const loadTransactionData = () => {
    // យក User Data
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

    // យក Transaction Data
    const saved = localStorage.getItem('user_transactions_list');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransactionData();

    // ស្តាប់ការផ្លាស់ប្តូរ
    window.addEventListener('storage', loadTransactionData);
    const interval = setInterval(loadTransactionData, 3000);

    return () => {
      window.removeEventListener('storage', loadTransactionData);
      clearInterval(interval);
    };
  }, []);

  // Your exact function logic
  const getTransactionSummary = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
        topCategories: 'No categories yet',
        monthlyTrend: 'No monthly data',
        recentTransactions: []
      };
    }

    // គណនា Total Income/Expense
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${month} ${year}`;
      const category = t.category || 'Other';

      if (amount > 0) {
        totalIncome += amount;
      } else {
        const absAmount = Math.abs(amount);
        totalExpense += absAmount;

        // Category summary
        categoryMap[category] = (categoryMap[category] || 0) + absAmount;

        // Monthly summary
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = 0;
        }
        monthlyMap[monthKey] += absAmount;
      }
    });

    const balance = totalIncome - totalExpense;

    // រក Top 5 Categories
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt}`)
      .join(', ') || 'No categories yet';

    // Monthly trend
    const monthlyTrend = Object.entries(monthlyMap)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a[0].split(' ')[0]) - months.indexOf(b[0].split(' ')[0]);
      })
      .map(([month, amt]) => `${month}: $${amt}`)
      .join(', ') || 'No monthly data';

    // Recent transactions (5 ចុងក្រោយ)
    const recentTransactions = transactions.length > 0
      ? [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      : [];

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      topCategories,
      monthlyTrend,
      recentTransactions
    };
  };

  // We return the function and the data
  return {
    transactions,
    userData,
    getTransactionSummary // You can call this function inside your components
  };
};