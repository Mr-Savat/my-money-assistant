import { useState } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { X, ChevronDown, Trash2, Plus } from "lucide-react";
function TransactionModal({ formData, setFormData, categories, setCategories, onClose, onSubmit }) {
    const { t } = useTranslation();
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    if (!formData) return null;
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

        // 4. ពិនិត្យមើលថាតើ category ដែលកំពុងជ្រើសរើសត្រូវបានលុបឬអត់?
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
                                            <ul className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden">
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

export default TransactionModal