import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

//  យក CustomTooltip ចេញមកខាងក្រៅ 
const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isForecast = data.isForecast;
    const value = isForecast ? data.predictedDisplay : data.actualDisplay;

    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isForecast ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {isForecast ? 'Forecast Expense: ' : 'Expense: '}
          </span>
          <span className={`text-sm font-black ${isForecast ? 'text-amber-600' : 'text-indigo-600'}`}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};
// forecast, COLORS,
const ChartSection = ({ chartData,  formatCurrency }) => {

  //  ពិនិត្យមើលថាមានទិន្នន័យទេ? 
  const hasData = chartData && chartData.length > 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
        Spending Trend (Expense)
      </h3>

      <div className="h-80 relative">

        {/* No Data Message */}
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm rounded-3xl">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <TrendingUp size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-bold text-sm mb-1">No Data Available</p>
            <p className="text-gray-300 text-xs text-center max-w-50">
              Upload a file or add transactions to see your spending trend
            </p>
          </div>
        )}

        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{
              top: 30
            }}>
              <defs>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={{ stroke: "#E2E8F0", strokeWidth: 2 }} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis dy={-10}  axisLine={{ stroke: "#E2E8F0", strokeWidth: 2 }} tickLine={false} tickFormatter={formatCurrency} tick={{ fill: '#94A3B8', fontSize: 12 }} />

              {/*  ប្រើ CustomTooltip ដែលបានកំណត់ខាងក្រៅ  */}
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />

              <Area
                type="monotone"
                dataKey="actualDisplay"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#gradExpense)"
                dot={{ r: 4, fill: "#6366f1" }}
              />

              <Area
                type="monotone"
                dataKey="predictedDisplay"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="5 5"
                fill="transparent"
                dot={{ r: 4, fill: "#f59e0b" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {/* Empty state handled above */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSection;