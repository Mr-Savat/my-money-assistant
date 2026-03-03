import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Plus, X, Trash2, Tag } from "lucide-react";

function DashboardTransactions() {
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
        category: 'Food'
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
        if (window.confirm("Delete this transaction?")) {
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
                "⚠️ DUPLICATE TRANSACTION FOUND!\n\n" +
                "This transaction already exists:\n" +
                `📅 Date: ${newTransaction.date}\n` +
                `📝 Description: ${newTransaction.description}\n` +
                `💰 Amount: $${Math.abs(newTransaction.amount)}\n` +
                `🏷️ Category: ${newTransaction.category}\n\n` +
                "Do you want to add it anyway?"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
                <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-gray-900 dark:text-white">Transactions</h3>
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 sm:mt-1 tracking-widest">
                        Last Month & Current Month
                    </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    {sortedFiltered.length > 5 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[9px] lg:text-[10px] cursor-pointer font-black hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all tracking-widest uppercase whitespace-nowrap"
                        >
                            {showAll ? "Show Less" : "View All"}
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
                            No transactions yet.
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
                <span>Add Transaction</span>
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
                    className="opacity-0 group-hover:opacity-100 p-1 sm:p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
                >
                    <Trash2 size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
                </button>
            </div>
        </div>
    );
}

// TransactionModal នៅដដែល
function TransactionModal({ formData, setFormData, categories, setCategories, onClose, onSubmit }) {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCat, setNewCat] = useState("");

    const handleAddCat = () => {
        if (newCat.trim() && !categories.includes(newCat)) {
            setCategories([...categories, newCat]);
            setFormData({ ...formData, category: newCat });
            setNewCat("");
            setIsAddingNew(false);
        }
    };

    const handleDeleteCat = (catToDelete) => {
        if (["Food", "Lunch", "Dinner"].includes(catToDelete)) return;
        setCategories(categories.filter(c => c !== catToDelete));
        setFormData({ ...formData, category: "Food" });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm sm:max-w-md rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors">
                <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">MoneyAI</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={16} className="sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
                    {/* Description Input */}
                    <input
                        required
                        type="text"
                        placeholder="Description"
                        className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-medium placeholder:text-gray-300 dark:placeholder:text-gray-500 text-sm sm:text-base text-gray-900 dark:text-white"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />

                    {/* Amount & Type Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <input
                            required
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-black text-sm sm:text-base text-gray-900 dark:text-white"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                        <select
                            className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    {/* Category Section */}
                    <div>
                        <div className="flex justify-between items-center mb-1 sm:mb-2 ml-1">
                            <label className="text-[8px] sm:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Category</label>
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(!isAddingNew)}
                                className="text-[8px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase"
                            >
                                {isAddingNew ? "Cancel" : "+ Add Other"}
                            </button>
                        </div>

                        {isAddingNew ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-1 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-indigo-500 outline-none text-sm sm:text-base text-gray-900 dark:text-white"
                                    placeholder="Category name..."
                                    value={newCat}
                                    onChange={e => setNewCat(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCat}
                                    className="p-3 sm:p-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus size={16} className="sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 outline-none font-bold appearance-none text-sm sm:text-base pr-10 text-gray-900 dark:text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                                    {!["Food", "Lunch", "Dinner"].includes(formData.category) && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCat(formData.category)}
                                            className="text-red-300 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400"
                                        >
                                            <Trash2 size={12} className="sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                    <Tag size={12} className="sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 sm:py-4 md:py-5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 mt-1 sm:mt-2"
                    >
                        Save Transaction
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DashboardTransactions;