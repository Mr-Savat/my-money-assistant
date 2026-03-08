import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

export const useTransactions = (initialTransactions) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    category: ''
  });

  // Filter transactions for last 2 months
  const getRecentMonthsTransactions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    
    if (lastMonth < 0) {
      lastMonth = 11;
      lastMonthYear = currentYear - 1;
    }

    return transactions.filter(t => {
      const transDate = new Date(t.date);
      const transYear = transDate.getFullYear();
      const transMonth = transDate.getMonth();
      
      return (transYear === currentYear && transMonth === currentMonth) ||
             (transYear === lastMonthYear && transMonth === lastMonth);
    });
  };

  const filteredTransactions = getRecentMonthsTransactions();
  const sortedFiltered = [...filteredTransactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  const displayedData = showAll ? sortedFiltered : sortedFiltered.slice(0, 5);

  // Add transaction
  const handleAdd = (e) => {
    e.preventDefault();
    
    const newTransaction = {
      id: Date.now(),
      date: formData.date,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount) * (formData.type === 'expense' ? -1 : 1),
      category: formData.category
    };

    // Check for duplicate
    const isDuplicate = transactions.some(t => 
      t.date === newTransaction.date &&
      t.amount === newTransaction.amount &&
      t.description.toLowerCase() === newTransaction.description.toLowerCase()
    );

    if (isDuplicate) {
      const confirmAdd = window.confirm(t('transaction.duplicate_confirm'));
      if (!confirmAdd) return;
    }

    const updatedTransactions = [newTransaction, ...transactions];
    const sortedTransactions = updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setTransactions(sortedTransactions);
    localStorage.setItem('user_transactions_list', JSON.stringify(sortedTransactions));
    setIsModalOpen(false);
    setFormData({ ...formData, description: '', amount: '' });
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    if (window.confirm(t('transaction.delete_confirm'))) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('user_transactions_list', JSON.stringify(updated));
    }
  };

  return {
    transactions: sortedFiltered,
    displayedData,
    showAll,
    setShowAll,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    handleAdd,
    deleteTransaction
  };
};