import { TrendingDown, Calendar, PieChart } from 'lucide-react';

const SummaryCards = ({ forecast, formatCurrency }) => {
  if (!forecast) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
        <p className="text-gray-400 text-sm">No forecast data available</p>
        <p className="text-xs text-gray-300 mt-2">Upload data to see expense predictions</p>
      </div>
    );
  }

  const { nextValue, lastValue, trend, nextMonth, lastMonth, topCategory } = forecast;
  const difference = nextValue - lastValue;
  const isDecreasing = difference < 0;
  const absDifference = Math.abs(difference);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      
      {/* Card 1: April Expense Forecast */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
          <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg sm:rounded-xl">
            <Calendar size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-indigo-600" />
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 uppercase tracking-wide">
            {nextMonth} Expense Forecast
          </h3>
        </div>
        
        <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
          <div>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">Estimated Expense:</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-600">{formatCurrency(nextValue)}</p>
          </div>
          
          <div className="text-[10px] sm:text-xs lg:text-sm">
            <span className="text-gray-500">Last month ({lastMonth}): </span>
            <span className="font-bold text-gray-700">{formatCurrency(lastValue)}</span>
          </div>
          
          <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs lg:text-sm ${isDecreasing ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendingDown size={12} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
            <span className="font-medium">
              You may spend {formatCurrency(absDifference)} {isDecreasing ? 'less' : 'more'} than {lastMonth}
            </span>
          </div>
          
          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-50">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-400">
              <span className="font-medium text-gray-600">Confidence:</span> High (based on 2 months)
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Spending Trend */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
          <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg sm:rounded-xl">
            <TrendingDown size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-amber-600" />
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 uppercase tracking-wide">
            Spending Trend
          </h3>
        </div>
        
        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-700">
            Your spending is <span className={isDecreasing ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
              {isDecreasing ? 'decreasing' : 'increasing'}
            </span> compared to last month.
          </p>
          
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-1 sm:mt-2 lg:mt-3">
            This means you are likely to spend <span className="font-bold">
              {isDecreasing ? 'less' : 'more'}
            </span> than before.
          </p>
          
          <div className="mt-2 sm:mt-3 lg:mt-4 pt-1 sm:pt-2 lg:pt-3 border-t border-gray-50">
            <div className="flex justify-between text-[9px] sm:text-[10px] lg:text-xs">
              <span className="text-gray-400">Trend strength:</span>
              <span className="font-medium text-gray-700">
                {Math.min(100, Math.round(Math.abs(trend) / lastValue * 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Top Spending Category */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
          <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg sm:rounded-xl">
            <PieChart size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-emerald-600" />
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 uppercase tracking-wide">
            Top Category ({lastMonth})
          </h3>
        </div>
        
        {topCategory ? (
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800">{topCategory.name}</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600">{topCategory.percentage}%</span>
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
              {formatCurrency(topCategory.amount)}
            </p>
            
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-1 sm:mt-2 lg:mt-3">
              This was your highest spending category in {lastMonth}.
            </p>
            
            {topCategory.percentage > 50 && (
              <div className="mt-2 sm:mt-3 p-2 bg-amber-50 rounded-lg sm:rounded-xl">
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-amber-700">
                  ⚠️ This category represents more than 50% of your total expenses.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-400">No category data available</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;