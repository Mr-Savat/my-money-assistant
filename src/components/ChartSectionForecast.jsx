import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isForecast = data.isForecast;
    const value = isForecast ? data.predictedDisplay : data.actualDisplay;
    
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isForecast ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isForecast ? t('forecast_chart.forecast_expense') : t('forecast_chart.expense')}
          </span>
          <span className={`text-sm font-black ${isForecast ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};
// forecast, COLORS,
const ChartSection = ({ chartData, formatCurrency }) => {
  const { t } = useTranslation();

  //  ពិនិត្យមើលថាមានទិន្នន័យទេ? 
  const hasData = chartData && chartData.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
        <span className="w-1 h-4 sm:h-5 bg-indigo-500 rounded-full"></span>
        {t('forecast_chart.title')}
      </h3>

      <div className="h-60 sm:h-72 lg:h-80 relative">

        {/* No Data Message */}
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3">
              <TrendingUp size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-xs sm:text-sm mb-1">
              {t('forecast_chart.no_data')}
            </p>
            <p className="text-gray-300 dark:text-gray-600 text-[10px] sm:text-xs text-center max-w-36 sm:max-w-50 px-2">
              {t('forecast_chart.no_data_desc')}
            </p>
          </div>
        )}

        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} accessibilityLayer={false} margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 0
            }}>
              <defs>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" strokeOpacity={0.5} />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "#E2E8F0", strokeWidth: 1.5, strokeOpacity: 0.5 }}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                dy={-8}
                axisLine={{ stroke: "#E2E8F0", strokeWidth: 1.5, strokeOpacity: 0.5 }}
                tickLine={false}
                tickFormatter={formatCurrency}
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                width={45}
              />

              {/* Custom Tooltip */}
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />

              <Area
                type="monotone"
                dataKey="actualDisplay"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#gradExpense)"
                dot={{ r: 3 }}
              />

              <Area
                type="monotone"
                dataKey="predictedDisplay"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                fill="transparent"
                dot={{ r: 3, fill: "#f59e0b" }}
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