import { Plus } from "lucide-react";
import { useDashboardTransaction } from "../hooks/useDashboardTransactions";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./transaction-modal/TransactionModal";

function DashboardTransactions() {
    const {
        t,
        showLimitWarning,
        categories,
        setCategories,
        formData,
        setFormData,
        showAll,
        setShowAll,
        isModalOpen,
        setIsModalOpen,
        deleteTransaction,
        handleAdd,
        displayedData,
        sortedFiltered
    } = useDashboardTransaction();

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

export default DashboardTransactions;