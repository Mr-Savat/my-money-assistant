import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Plus, X, Trash2, ChevronDown } from "lucide-react";
import { useTranslation } from '../hooks/useTranslation';

function DashboardTransactions() {
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

        // ++++++++++ ពិនិត្យតែពេលជា Expense ++++++++++
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

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col relative w-full transition-colors duration-300">
            {/* Header */}
            <div className="flex justify-between sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
                <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        {t('transactions')}
                    </h3>
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 sm:mt-1 tracking-widest">
                        {t('lastAndCurrentMonth')}
                    </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    {sortedFiltered.length >= 4 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[9px] lg:text-[10px] cursor-pointer font-black hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all tracking-widest uppercase whitespace-nowrap"
                        >
                            {showAll ? t('showLess') : t('viewAll')}
                        </button>
                    )}
                </div>
            </div>

            {/* Fixed Height Container */}
            <div
                className={`space-y-2 sm:space-y-3 lg:space-y-4 h-64 sm:h-72 md:h-80 lg:h-75 pr-1 transition-all duration-300 ${showAll ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'
                    }`}
            >
                {sortedFiltered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-black tracking-widest">
                            {t('dashboard.no_transactions')}
                        </p>
                    </div>
                ) : (
                    displayedData.map((item) => (
                        <TransactionRow
                            key={item.id}
                            item={item}
                            onDelete={deleteTransaction}
                        />
                    ))
                )}
            </div>

            {/* Add Transaction Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 sm:mt-6 lg:mt-8 w-full py-3 sm:py-4 bg-gray-900 dark:bg-indigo-600 cursor-pointer text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1 sm:gap-2 group"
            >
                <Plus size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
                <span>{t('Add Transaction')}</span>
            </button>

            {/* Transaction Modal */}
            {isModalOpen && (
                <TransactionModal
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    setCategories={setCategories}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAdd}
                />
            )}

            {showLimitWarning && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
                    <p className="text-sm font-medium">
                        ⚠️ {t('dashboard.near_limit_warning')}
                    </p>
                </div>
            )}

        </div>
    );
}

// TransactionRow នៅដដែល
function TransactionRow({ item, onDelete }) {
    const isIncome = item.amount > 0;

    const formatDisplayDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="group flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-700/50 p-2 sm:p-2.5 lg:p-3 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                {/* Icon */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-11 lg:h-11 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center ${isIncome
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }`}>
                    {isIncome ?
                        <ArrowUpCircle size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> :
                        <ArrowDownCircle size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    }
                </div>

                {/* Description & Category */}
                <div className="truncate flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                        {item.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <p className="text-[7px] sm:text-[8px] lg:text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase">
                            {item.category || 'Other'}
                        </p>
                        <span className="text-gray-300 dark:text-gray-600 text-[7px] sm:text-[8px] lg:text-[9px]">•</span>
                        <p className="text-[7px] sm:text-[8px] lg:text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">
                            {formatDisplayDate(item.date)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Amount & Delete Button */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0 ml-1 sm:ml-2">
                <p className={`text-xs sm:text-sm font-black tracking-tight whitespace-nowrap ${isIncome
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-900 dark:text-white"
                    }`}>
                    {isIncome ? "+" : "-"}${Math.abs(item.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </p>
                <button
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 cursor-pointer group-hover:opacity-100 p-1 sm:p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
                >
                    <Trash2 size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
                </button>
            </div>
        </div>
    );
}

// TransactionModal នៅដដែល
function TransactionModal({ formData, setFormData, categories, setCategories, onClose, onSubmit }) {
    const { t } = useTranslation();
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddCat = () => {
        if (newCat.trim() && !categories.includes(newCat)) {
            setCategories([...categories, newCat]);
            setFormData({ ...formData, category: newCat });
            setNewCat("");
            setIsAddingNew(false);
        }
    };
    const handleDeleteCat = (categoryToDelete) => {
        // 1. Create the new list by filtering out the one you clicked
        const updatedCategories = categories.filter(cat => cat !== categoryToDelete);

        // 2. Update the React state so the UI refreshes immediately
        setCategories(updatedCategories);

        // 3. Update localStorage so they don't come back on refresh
        localStorage.setItem('user_categories_list', JSON.stringify(updatedCategories));

        // ++++++++++ 4. ពិនិត្យមើលថាតើ category ដែលកំពុងជ្រើសរើសត្រូវបានលុបឬអត់? ++++++++++
        if (formData.category === categoryToDelete) {
            // បើមាន category នៅសល់ យកទីមួយ បើអត់ទេ យកទទេ
            const newCategory = updatedCategories.length > 0 ? updatedCategories[0] : '';
            setFormData({ ...formData, category: newCategory });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm sm:max-w-md rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors">
                <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white"> {t('app.name')}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={16} className="sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
                    {/* Transaction Type Toggle - High UX Impact */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                        {['expense', 'income'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`flex-1 py-2 sm:py-3 cursor-pointer rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${formData.type === type
                                    ? (type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md')
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {t(`dashboard.${type}`)}
                            </button>
                        ))}
                    </div>

                    {/* Date Input */}
                    <div>
                        <label className="text-[8px] sm:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1 block">
                            {t('transaction.date')}
                        </label>
                        <input
                            type="date"
                            required
                            className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-medium text-sm sm:text-base text-gray-900 dark:text-white"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    {/* Description Input */}
                    <div className="relative group">
                        <input
                            required
                            type="text"
                            placeholder={t('transaction.description')}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-medium text-sm sm:text-base text-gray-900 dark:text-white transition-all"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Amount Input with Dynamic Color */}
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${formData.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {formData.type === 'expense' ? '-' : '+'}
                        </span>
                        <input
                            required
                            type="number"
                            step="0.01"
                            placeholder="$0.00"
                            className="w-full pl-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-black text-lg sm:text-xl text-gray-900 dark:text-white transition-all"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    {/* Category Section */}
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                {t('transaction.category')}
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(!isAddingNew)}
                                className="text-[10px] cursor-pointer font-black text-indigo-400 hover:text-indigo-300 uppercase"
                            >
                                {isAddingNew ? t('common.cancel') : `+ ${t('transaction.add_other')}`}
                            </button>
                        </div>

                        {isAddingNew ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-indigo-500 outline-none text-gray-900 dark:text-white text-sm"
                                    placeholder={t('transaction.category_name')}
                                    value={newCat}
                                    onChange={e => setNewCat(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCat}
                                    className="p-3 bg-indigo-600 cursor-pointer text-white rounded-xl"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-gray-900 dark:text-white text-sm cursor-pointer"
                                        placeholder={t('transaction.select_category')}
                                        value={isOpen ? searchTerm : formData.category}
                                        onFocus={() => {
                                            setIsOpen(true);
                                            setSearchTerm("");
                                        }}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                </div>

                                {/* THE DROPDOWN: Positioned absolutely so it floats over other elements */}
                                {isOpen && (
                                    <>
                                        {/* Invisible backdrop to close the menu when clicking away */}
                                        <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

                                        {/* Filter categories based on search term */}
                                        {categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                            <ul className="absolute z-30 w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                {categories
                                                    .filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((cat) => (
                                                        <li
                                                            key={cat}
                                                            className="flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-600 group cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                setFormData({ ...formData, category: cat });
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-white">
                                                                {cat}
                                                            </span>

                                                            {/* Trash Icon - Now available for ALL items */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevents selecting the category when clicking delete
                                                                    handleDeleteCat(cat);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 hover:bg-red-500 rounded text-gray-400 hover:text-white transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <div className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 text-center">
                                                {categories.length === 0 ? (
                                                    <>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                            {t('category.no_categories')}
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                setIsOpen(false);
                                                                setIsAddingNew(true);
                                                            }}
                                                            className="text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer hover:underline"
                                                        >
                                                            + {t('category.add_first')}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {t('category.no_match', { search: searchTerm })}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-indigo-600 cursor-pointer text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
                    >
                        {t('transaction.save')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DashboardTransactions;