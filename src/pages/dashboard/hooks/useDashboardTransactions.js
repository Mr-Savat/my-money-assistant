import { useEffect, useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
export const useDashboardTransaction = () => {
    const { t } = useTranslation();
    const [userData, setUserData] = useState({ spendingLimit: 0 });
    const [showLimitWarning, setShowLimitWarning] = useState(false);


    // ទាញទិន្នន័យអ្នកប្រើ
    useEffect(() => {
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserData({
                spendingLimit: user.spendingLimit || 0
            });
        }
    }, []);


    // --- STATE MANAGEMENT ---
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('user_transactions_list');
        if (!saved) return [];

        const allTransactions = JSON.parse(saved);
        // Sort តាមថ្ងៃថ្មីបំផុតនៅខាងលើ
        return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('user_categories_list');
        return saved ? JSON.parse(saved) : ["Food", "Lunch", "Dinner"];
    });

    const [showAll, setShowAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category: ''
    });

    // --- EFFECTS ---
    useEffect(() => {
        localStorage.setItem('user_transactions_list', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('user_categories_list', JSON.stringify(categories));
    }, [categories]);

    // --- HANDLERS ---
    const deleteTransaction = (id) => {
        if (window.confirm(t('transaction.delete_confirm'))) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };
    //  កែប្រែ handleAdd ឲ្យមាន Duplicate Check 
    const handleAdd = (e) => {
        e.preventDefault();

        // បង្កើត Transaction ថ្មី (ដោយគ្មាន ID នៅឡើយ)
        const newTransaction = {
            date: formData.date,
            description: formData.description.trim(),
            amount: parseFloat(formData.amount) * (formData.type === 'expense' ? -1 : 1),
            category: formData.category
        };

        //  ពិនិត្យរក Duplicate 
        const isDuplicate = transactions.some(t =>
            t.date === newTransaction.date &&
            t.amount === newTransaction.amount &&
            t.description.toLowerCase() === newTransaction.description.toLowerCase()
        );

        if (isDuplicate) {
            // បង្ហាញ Confirm Dialog
            const confirmAdd = window.confirm(
                `${t('transaction.duplicate_title')}\n\n` +
                `${t('transaction.duplicate_message')}\n` +
                `${t('transaction.date')}: ${newTransaction.date}\n` +
                `${t('transaction.description')}: ${newTransaction.description}\n` +
                `${t('transaction.amount')}: $${Math.abs(newTransaction.amount)}\n` +
                `${t('transaction.category')}: ${newTransaction.category}\n\n` +
                `${t('transaction.duplicate_question')}`
            );

            if (!confirmAdd) {
                return; // បោះបង់ការបន្ថែម
            }
        }

        // បន្ថែម ID ហើយរក្សាទុក
        const transactionWithId = {
            id: Date.now(),
            ...newTransaction
        };

        const updatedTransactions = [transactionWithId, ...transactions];
        const sortedTransactions = updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(sortedTransactions);
        setIsModalOpen(false);
        setFormData({ ...formData, description: '', amount: '' });

        // បង្ហាញសារជោគជ័យ (អាចដកចេញក៏បាន)
        if (isDuplicate) {
            alert("✅ Transaction added despite duplicate.");
        }

        //  ពិនិត្យតែពេលជា Expense 
        if (formData.type === 'expense') {
            // គណនាចំណាយសរុបបច្ចុប្បន្ន (តែ Expense)
            const currentExpense = transactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            // គណនាចំណាយថ្មី
            const newExpense = currentExpense + Math.abs(newTransaction.amount);

            // ពិនិត្យ Limit
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


    };

    //  Function សម្រាប់ Filter យកតែខែមុន និងខែនេះ 
    const getRecentMonthsTransactions = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // គណនាខែមុន
        let lastMonth = currentMonth - 1;
        let lastMonthYear = currentYear;

        if (lastMonth < 0) {
            lastMonth = 11; // ខែធ្នូ
            lastMonthYear = currentYear - 1;
        }

        return transactions.filter(t => {
            const transDate = new Date(t.date);
            const transYear = transDate.getFullYear();
            const transMonth = transDate.getMonth();

            // យកតែខែនេះ ឬខែមុន
            return (transYear === currentYear && transMonth === currentMonth) ||
                (transYear === lastMonthYear && transMonth === lastMonth);
        });
    };

    // Filter transactions
    const filteredTransactions = getRecentMonthsTransactions();

    // Sort តាមថ្ងៃថ្មីបំផុត
    const sortedFiltered = [...filteredTransactions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    // If showAll is false, we only render 5 items. If true, we render everything.
    const displayedData = showAll ? sortedFiltered : sortedFiltered.slice(0, 5);

    return{
        t, showLimitWarning, setCategories, setShowAll, isModalOpen, setIsModalOpen, deleteTransaction, handleAdd, displayedData, sortedFiltered, showAll, formData, setFormData, categories,
    }
}