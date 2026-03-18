import { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useCachedState } from "../../../hooks/useCachedState";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDashboardTransaction = () => {
    const { t } = useTranslation();
    
    //  ប្រើ useCachedState ជំនួស useState 
    const [transactions, setTransactions] = useCachedState('transactions', []);
    const [categories, setCategories] = useCachedState('categories', ["Food", "Lunch", "Dinner"]);
    const [userData, setUserData] = useCachedState('user_profile', { spendingLimit: 0 });
    
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [showAll, setShowAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category: ''
    });

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

    const fetchTransactions = async () => {
        if (!isAuthenticated) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                const sorted = data.transactions.sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );
                setTransactions(sorted);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        if (!isAuthenticated) return;
        
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.categories.length > 0) {
                setCategories(data.categories.map(c => c.name));
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchUserData = async () => {
        if (!isAuthenticated) return;
        
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUserData({
                    spendingLimit: data.user.spendingLimit || 0
                });
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            Promise.all([
                fetchTransactions(),
                fetchCategories(),
                fetchUserData()
            ]).finally(() => setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const deleteTransaction = async (id) => {
        if (!window.confirm(t('transaction.delete_confirm'))) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setTransactions(transactions.filter(t => t.id !== id));
                window.dispatchEvent(new CustomEvent('transactions-updated'));
            }
        } catch (err) {
            console.error('Error deleting transaction:', err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        const newTransaction = {
            date: formData.date,
            description: formData.description.trim(),
            amount: parseFloat(formData.amount) * (formData.type === 'expense' ? -1 : 1),
            category: formData.category
        };

        // ពិនិត្យ Duplicate
        const isDuplicate = transactions.some(t =>
            t.date === newTransaction.date &&
            t.amount === newTransaction.amount &&
            t.description.toLowerCase() === newTransaction.description.toLowerCase()
        );

        if (isDuplicate) {
            const confirmAdd = window.confirm(
                `${t('transaction.duplicate_title')}\n\n` +
                `${t('transaction.duplicate_message')}\n` +
                `${t('transaction.date')}: ${newTransaction.date}\n` +
                `${t('transaction.description')}: ${newTransaction.description}\n` +
                `${t('transaction.amount')}: $${Math.abs(newTransaction.amount)}\n` +
                `${t('transaction.category')}: ${newTransaction.category}\n\n` +
                `${t('transaction.duplicate_question')}`
            );

            if (!confirmAdd) return;
        }

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newTransaction)
            });

            const data = await response.json();

            if (data.success) {
                setTransactions([data.transaction, ...transactions]);
                window.dispatchEvent(new CustomEvent('transactions-updated'));
                setIsModalOpen(false);
                setFormData({ ...formData, description: '', amount: '' });

                // ពិនិត្យ Spending Limit
                if (formData.type === 'expense') {
                    const currentExpense = transactions
                        .filter(t => t.amount < 0)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                    const newExpense = currentExpense + Math.abs(newTransaction.amount);

                    if (userData.spendingLimit > 0) {
                        const percentage = (newExpense / userData.spendingLimit) * 100;

                        if (percentage >= 80 && percentage < 100) {
                            setShowLimitWarning(true);
                            setTimeout(() => setShowLimitWarning(false), 5000);
                        } else if (percentage >= 100) {
                            alert(t('dashboard.over_limit_alert'));
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error adding transaction:', err);
        }
    };

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

    return {
        t,
        showLimitWarning,
        setCategories,
        setShowAll,
        isModalOpen,
        setIsModalOpen,
        deleteTransaction,
        handleAdd,
        displayedData,
        sortedFiltered,
        showAll,
        formData,
        setFormData,
        categories,
        loading
    };
};