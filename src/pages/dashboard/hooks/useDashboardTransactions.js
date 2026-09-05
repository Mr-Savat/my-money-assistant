import { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDashboardTransaction = () => {
    const { t } = useTranslation();
    
    // Live React state backed by backend Firestore
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState(["Food", "Lunch", "Dinner"]);
    const [userData, setUserData] = useState({ spendingLimit: 0 });
    
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
            if (!token) return;
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
            if (!token) return;
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
            if (!token) return;
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

        const handleRefresh = () => {
            fetchTransactions();
        };

        // Poll every 30 seconds to keep in sync with summary cards and chart
        const interval = setInterval(fetchTransactions, 30000);

        window.addEventListener('transactions-updated', handleRefresh);
        return () => {
            clearInterval(interval);
            window.removeEventListener('transactions-updated', handleRefresh);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const deleteTransaction = async (id) => {
        if (!window.confirm(t('transaction.delete_confirm'))) return;

        try {
            const token = await getToken();
            if (!token) {
                alert('Please log in to delete transactions.');
                return;
            }
            console.log('Attempting to delete transaction with ID:', id);
            
            const response = await fetch(`${API_URL}/api/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Delete response status:', response.status);
            const data = await response.json();
            console.log('Delete response data:', data);

            if (data.success) {
                setTransactions(transactions.filter(t => t.id !== id));
                window.dispatchEvent(new CustomEvent('transactions-updated'));
            } else {
                alert(`Delete failed: ${data.error || 'Server returned success: false'}`);
            }
        } catch (err) {
            console.error('Error deleting transaction:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        const newTransaction = {
            date: formData.date || new Date().toISOString().split('T')[0],
            description: formData.description.trim(),
            amount: parseFloat(formData.amount) * (formData.type === 'expense' ? -1 : 1),
            category: formData.category ? formData.category.trim() : 'Other'
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
            if (!token) {
                alert('Please log in to add transactions.');
                return;
            }
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
                setTransactions(prev => [data.transaction, ...prev]);
                window.dispatchEvent(new CustomEvent('transactions-updated'));
                setIsModalOpen(false);
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: ''
                });

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
            } else {
                alert(`Could not add transaction: ${data.error || 'Server error'}`);
            }
        } catch (err) {
            console.error('Error adding transaction:', err);
            alert(`Error adding transaction: ${err.message}`);
        }
    };

    const cleanupOldTransactions = async () => {
        if (!window.confirm('Do you want to delete all old template transactions before August 2026 (Month 8)?')) return;

        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/api/transactions/cleanup/old?beforeDate=2026-08-01`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                alert(`Cleaned up ${data.deletedCount} old transaction(s).`);
                await fetchTransactions();
                window.dispatchEvent(new CustomEvent('transactions-updated'));
            } else {
                alert(`Cleanup failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error cleaning up old transactions:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const hasOldTransactions = transactions.some(t => {
        const d = t.date ? String(t.date).split('T')[0] : '';
        return d && d < '2026-08-01';
    });

    const sortedAll = [...transactions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );
    const displayedData = showAll ? sortedAll : sortedAll.slice(0, 5);

    return {
        t,
        showLimitWarning,
        setCategories,
        setShowAll,
        isModalOpen,
        setIsModalOpen,
        deleteTransaction,
        cleanupOldTransactions,
        hasOldTransactions,
        handleAdd,
        displayedData,
        sortedFiltered: sortedAll,
        showAll,
        totalCount: transactions.length,
        formData,
        setFormData,
        categories,
        loading
    };
};