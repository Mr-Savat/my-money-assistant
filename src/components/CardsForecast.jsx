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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Card 1: April Expense Forecast */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Calendar size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {nextMonth} Expense Forecast
          </h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Estimated Expense:</p>
            <p className="text-3xl font-black text-indigo-600">{formatCurrency(nextValue)}</p>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-500">Last month ({lastMonth}): </span>
            <span className="font-bold text-gray-700">{formatCurrency(lastValue)}</span>
          </div>
          
          <div className={`flex items-center gap-1 text-sm ${isDecreasing ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendingDown size={16} />
            <span className="font-medium">
              You may spend {formatCurrency(absDifference)} {isDecreasing ? 'less' : 'more'} than {lastMonth}
            </span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              <span className="font-medium text-gray-600">Confidence:</span> High (based on 2 months of data)
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Spending Trend */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-50 rounded-xl">
            <TrendingDown size={18} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Spending Trend
          </h3>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Your spending is <span className={isDecreasing ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
              {isDecreasing ? 'decreasing' : 'increasing'}
            </span> compared to last month.
          </p>
          
          <p className="text-sm text-gray-600 mt-3">
            This means you are likely to spend <span className="font-bold">
              {isDecreasing ? 'less' : 'more'}
            </span> than before.
          </p>
          
          <div className="mt-4 pt-3 border-t border-gray-50">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Trend strength:</span>
              <span className="font-medium text-gray-700">
                {Math.min(100, Math.round(Math.abs(trend) / lastValue * 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Top Spending Category */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <PieChart size={18} className="text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Top Category ({lastMonth})
          </h3>
        </div>
        
        {topCategory ? (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-gray-800">{topCategory.name}</span>
              <span className="text-sm font-bold text-emerald-600">{topCategory.percentage}%</span>
            </div>
            
            <p className="text-lg font-bold text-gray-700">
              {formatCurrency(topCategory.amount)}
            </p>
            
            <p className="text-sm text-gray-600 mt-3">
              This was your highest spending category in {lastMonth}.
            </p>
            
            {topCategory.percentage > 50 && (
              <div className="mt-3 p-2 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-700">
                  ⚠️ This category represents more than 50% of your total expenses.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No category data available</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;