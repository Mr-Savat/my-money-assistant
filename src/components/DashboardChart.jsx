import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function DashboardChart() {
    const [chartData, setChartData] = useState([]);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const updateChart = () => {
            const saved = localStorage.getItem('user_transactions_list');
            const transactions = saved ? JSON.parse(saved) : [];

            // យកតែខែបច្ចុប្បន្ន
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();

            const currentMonthTransactions = transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate.getFullYear() === currentYear &&
                    transDate.getMonth() === currentMonth;
            });

            // ពិនិត្យថាមានទិន្នន័យទេ? 
            setHasData(currentMonthTransactions.length > 0);

            const dailyData = currentMonthTransactions.reduce((acc, curr) => {
                const date = curr.date;

                if (!acc[date]) {
                    acc[date] = {
                        name: date,
                        income: 0,
                        expense: 0
                    };
                }

                const amount = parseFloat(curr.amount);
                if (amount > 0) {
                    acc[date].income += amount;
                } else {
                    acc[date].expense += Math.abs(amount);
                }
                return acc;
            }, {});

            // Sort តាមថ្ងៃ
            const sortedDays = Object.values(dailyData).sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });

            setChartData(sortedDays);
        };

        updateChart();
        const interval = setInterval(updateChart, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.includes('Next')) return dateStr;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatMoney = (value) => `$${value?.toLocaleString()}`;

    return (
        <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xl font-black tracking-tight">Financial Forecast</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Live from LocalStorage</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[10px] font-bold uppercase text-gray-400">Income</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-[10px] font-bold uppercase text-gray-400">Expense</span></div>
                </div>
            </div>

            <div className="h-100 relative">

                {/* បន្ថែម No Data Message */}
                {!hasData && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm rounded-4xl">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 font-bold text-sm mb-1">No Data Available</p>
                        <p className="text-gray-300 text-xs">Add transactions to see your chart</p>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{
                        top: 30,
                        right: 30,
                    }}>
                        <defs>
                            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

                        <XAxis
                            domain={['auto', 'auto']}
                            padding={{ bottom: 10 }}
                            allowDataOverflow={false}
                            dataKey="name"
                            interval="preserveStartEnd"
                            minTickGap={30}
                            axisLine={{ stroke: "#E2E8F0", strokeWidth: 2 }}
                            tickLine={false}
                            tickFormatter={formatDate}
                            tick={{ fill: "#94A3B8", fontSize: 12 }}

                        />

                        <YAxis
                            axisLine={{ stroke: "#E2E8F0", strokeWidth: 2 }}
                            tickLine={false}
                            tickFormatter={formatMoney}
                            tick={{ fill: "#94A3B8", fontSize: 12 }}
                            dy={-10}
                        />

                        <Tooltip
                            labelFormatter={formatDate}
                            formatter={(value, name) => [`$${value.toLocaleString()}`, name.toUpperCase()]}
                            contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                            cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }}
                            wrapperStyle={{ outline: "none" }}
                            isAnimationActive={false}
                        />

                        {/* ✅ income renders first (behind), expense on top — matches screenshot */}
                        <Area type="basis" dataKey="income" stroke="#10b981" strokeWidth={4} fill="url(#gradIncome)" dot={false} />
                        <Area type="basis" dataKey="expense" stroke="#6366f1" strokeWidth={4} fill="url(#gradExpense)" dot={false} />
                        <Area type="basis" dataKey="forecast" stroke="#F59E0B" strokeWidth={4} strokeDasharray="8 8" fill="transparent" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default DashboardChart;