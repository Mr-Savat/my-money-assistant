import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAnimatedNumber } from "./useAnimatedNumber";

export const useDashboardSummaryCards = () => {
  const { t } = useTranslation();

  //  ទាញទិន្នន័យពី localStorage ក្នុង useState 
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('user_transactions_list');
    const transactions = saved ? JSON.parse(saved) : [];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const currentMonthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate.getFullYear() === currentYear &&
        transDate.getMonth() === currentMonth;
    });

    const totals = currentMonthTransactions.reduce((acc, curr) => {
      const amount = parseFloat(curr.amount);
      if (amount > 0) {
        acc.income += amount;
      } else {
        acc.expense += Math.abs(amount);
      }
      acc.balance += amount;
      return acc;
    }, { balance: 0, income: 0, expense: 0 });

    return totals;
  });

  const [userData] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        spendingLimit: user.spendingLimit || 0,
        monthlySalary: user.monthlySalary || 0
      };
    }
    return {
      spendingLimit: 0,
      monthlySalary: 0
    };
  });

  // 2. គណនា Percentage
  const hasLimit = userData.spendingLimit && userData.spendingLimit > 0;
  const spendingPercentage = userData.spendingLimit > 0
    ? Math.min(100, Math.round((stats.expense / userData.spendingLimit) * 100))
    : 0;

  const isOverLimit = stats.expense > userData.spendingLimit;

  const calculateStats = () => {
    const saved = localStorage.getItem('user_transactions_list');
    const transactions = saved ? JSON.parse(saved) : [];

    // យកតែខែបច្ចុប្បន្ន
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const currentMonthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate.getFullYear() === currentYear &&
        transDate.getMonth() === currentMonth;
    });

    const totals = currentMonthTransactions.reduce((acc, curr) => {
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
  const animatedBalance = useAnimatedNumber(stats.balance);
  const animatedIncome = useAnimatedNumber(stats.income);
  const animatedExpense = useAnimatedNumber(stats.expense);

  return {
    t, stats, userData, hasLimit, spendingPercentage, isOverLimit, formatCurrency, animatedBalance, animatedIncome, animatedExpense,

  }
}