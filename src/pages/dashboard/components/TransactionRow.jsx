import { ArrowDownCircle, ArrowUpCircle, Trash2} from "lucide-react";
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

export default TransactionRow