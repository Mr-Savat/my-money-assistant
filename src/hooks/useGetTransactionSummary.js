import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useGetTransactionSummary = () => {
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  const loadTransactionData = async () => {
    // User profile from localStorage
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

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
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend transactions for summary:', err);
    }
  };

  useEffect(() => {
    loadTransactionData();

    window.addEventListener('transactions-updated', loadTransactionData);

    return () => {
      window.removeEventListener('transactions-updated', loadTransactionData);
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