import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import AddCategoryForm from './AddCategoryForm';
import { useCategoryManager } from './hooks/useCategoryManager';

const CategorySelector = ({ formData, setFormData, categories, setCategories }) => {
    const { t } = useTranslation();
    const {
        isAddingNew,
        setIsAddingNew,
        newCat,
        setNewCat,
        isOpen,
        setIsOpen,
        searchTerm,
        setSearchTerm,
        handleAddCat,
        handleDeleteCat
    } = useCategoryManager(categories, setCategories, formData, setFormData);

    return (
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
                <AddCategoryForm
                    newCat={newCat}
                    setNewCat={setNewCat}
                    onAdd={handleAddCat}
                    onCancel={() => setIsAddingNew(false)}
                />
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

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

                            {categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                <ul className={`
                                                absolute z-30 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden
                                                bottom-full mb-1 top-auto 
                                                sm:top-full sm:bottom-auto sm:mt-1 
                                             `}>
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

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
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
                                <div className={`
        absolute z-30 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 text-center
        bottom-full mb-1 top-auto
        sm:top-full sm:bottom-auto sm:mt-1
      `}>
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
    );
};

export default CategorySelector;