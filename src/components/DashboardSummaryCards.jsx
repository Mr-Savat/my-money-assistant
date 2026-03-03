import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function DashboardSummaryCards() {
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expense: 0
    });

    const calculateStats = () => {
        const saved = localStorage.getItem('user_transactions_list');
        const transactions = saved ? JSON.parse(saved) : [];

        //  បន្ថែមតែត្រង់នេះ 
        // យកតែខែបច្ចុប្បន្ន
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const currentMonthTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getFullYear() === currentYear &&
                transDate.getMonth() === currentMonth;
        });
        //  បញ្ចប់ការបន្ថែម 

        const totals = currentMonthTransactions.reduce((acc, curr) => { // កែពី transactions ជា currentMonthTransactions
            const amount = parseFloat(curr.amount);
            if (amount > 0) {
                acc.income += amount;
            } else {
                acc.expense += Math.abs(amount);
            }
            acc.balance += amount;
            return acc;
        }, { balance: 0, income: 0, expense: 0 });

        setStats(totals);
    };

    useEffect(() => {
        // Initial calculation
        // eslint-disable-next-line react-hooks/set-state-in-effect
        calculateStats();

        // Listen for changes in localStorage from other components
        window.addEventListener('storage', calculateStats);

        // Custom listener for same-window updates
        const interval = setInterval(calculateStats, 1000);

        return () => {
            window.removeEventListener('storage', calculateStats);
            clearInterval(interval);
        };
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
            {/* Total Balance */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl sm:rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <Wallet size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="flex items-center text-emerald-500 dark:text-emerald-400 text-[9px] sm:text-[10px] md:text-xs font-bold">
                        <TrendingUp size={10} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> Live
                    </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm font-medium">Total Balance</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-0.5 sm:mt-1 text-gray-900 dark:text-white">
                    {formatCurrency(stats.balance)}
                </h2>
            </div>

            {/* Monthly Income */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl sm:rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-[9px] sm:text-[10px] md:text-xs font-bold">This Month</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm font-medium">Income</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-0.5 sm:mt-1 text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(stats.income)}
                </h2>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl sm:rounded-2xl text-rose-600 dark:text-rose-400">
                        <ArrowDownRight size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-rose-500 dark:text-rose-400 text-[9px] sm:text-[10px] md:text-xs font-bold">This Month</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm font-medium">Expenses</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-0.5 sm:mt-1 text-rose-600 dark:text-rose-400">
                    {formatCurrency(stats.expense)}
                </h2>
            </div>
        </div>
    );
}

export default DashboardSummaryCards;