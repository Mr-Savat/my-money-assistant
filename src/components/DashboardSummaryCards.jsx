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

        // ++++++++++ បន្ថែមតែត្រង់នេះ ++++++++++
        // យកតែខែបច្ចុប្បន្ន
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const currentMonthTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getFullYear() === currentYear && 
                   transDate.getMonth() === currentMonth;
        });
        // ++++++++++ បញ្ចប់ការបន្ថែម ++++++++++

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Balance */}
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Wallet size={24} /></div>
                    <span className="flex items-center text-emerald-500 text-xs font-bold">
                        <TrendingUp size={14} className="mr-1" /> Live
                    </span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Total Balance</p>
                <h2 className="text-3xl font-black mt-1">{formatCurrency(stats.balance)}</h2>
            </div>

            {/* Monthly Income */}
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ArrowUpRight size={24} /></div>
                    <span className="text-gray-400 text-xs font-bold">This Month</span> {/* កែពី Total ជា This Month */}
                </div>
                <p className="text-gray-500 text-sm font-medium">Income</p> {/* កែពី Total Income ជា Income */}
                <h2 className="text-3xl font-black mt-1 text-emerald-600">{formatCurrency(stats.income)}</h2>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><ArrowDownRight size={24} /></div>
                    <span className="text-rose-500 text-xs font-bold">This Month</span> {/* កែពី Total ជា This Month */}
                </div>
                <p className="text-gray-500 text-sm font-medium">Expenses</p> {/* កែពី Total Expenses ជា Expenses */}
                <h2 className="text-3xl font-black mt-1 text-rose-600">{formatCurrency(stats.expense)}</h2>
            </div>
        </div>
    );
}

export default DashboardSummaryCards;