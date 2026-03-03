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
  <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
      <div>
        <h3 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-gray-900 dark:text-white">Financial Forecast</h3>
        <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 sm:mt-1 tracking-widest">Live from LocalStorage</p>
      </div>
      <div className="flex gap-2 sm:gap-3 lg:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Income</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500"></span>
          <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Expense</span>
        </div>
      </div>
    </div>

    <div className="h-64 sm:h-72 md:h-80 lg:h-96 relative">
      {/* No Data Message */}
      {!hasData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl lg:rounded-4xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 dark:text-gray-500 font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">No Data Available</p>
          <p className="text-gray-300 dark:text-gray-600 text-[10px] sm:text-xs">Add transactions to see your chart</p>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{
          top: 20,
          right: 15,
          left: 0,
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

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />

          <XAxis
            domain={['auto', 'auto']}
            padding={{ bottom: 10 }}
            allowDataOverflow={false}
            dataKey="name"
            interval="preserveStartEnd"
            minTickGap={20}
            axisLine={{ stroke: "#E2E8F0", strokeWidth: 1.5 }}
            tickLine={false}
            tickFormatter={formatDate}
            tick={{ fill: "#94A3B8", fontSize: 10 }}
          />

          <YAxis
            axisLine={{ stroke: "#E2E8F0", strokeWidth: 1.5 }}
            tickLine={false}
            tickFormatter={formatMoney}
            tick={{ fill: "#94A3B8", fontSize: 10 }}
            dy={-8}
            width={40}
          />

       <Tooltip
  labelFormatter={formatDate}
  formatter={(value, name) => [`$${value.toLocaleString()}`, name.toUpperCase()]}
  contentStyle={{ 
    borderRadius: "12px", 
    border: "none", 
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    backgroundColor: "var(--tooltip-bg)",
    color: "var(--tooltip-color)"
  }}
  cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }}
  wrapperStyle={{ outline: "none" }}
  isAnimationActive={false}
/>

          <Area type="basis" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#gradIncome)" dot={false} />
          <Area type="basis" dataKey="expense" stroke="#6366f1" strokeWidth={3} fill="url(#gradExpense)" dot={false} />
          <Area type="basis" dataKey="forecast" stroke="#F59E0B" strokeWidth={3} strokeDasharray="6 6" fill="transparent" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
}

export default DashboardChart;