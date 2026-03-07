import { TrendingDown, Calendar, PieChart } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
const SummaryCards = ({ forecast, formatCurrency }) => {
  const { t } = useTranslation() 
  if (!forecast) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-colors duration-300">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          {t('forecast.no_data')}
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
          {t('forecast.upload_hint')}
        </p>
      </div>
    );
  }

  const { nextValue, lastValue, trend, nextMonth, lastMonth, topCategory } = forecast;
  const difference = nextValue - lastValue;
  const isDecreasing = difference < 0;
  const absDifference = Math.abs(difference);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

      {/* Card 1: Expense Forecast */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
          <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl">
            <Calendar size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {nextMonth} {t('forecast.expense_forecast')}
          </h3>
        </div>

        <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
          <div>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 dark:text-gray-500">{t('forecast.estimated_expense')}:</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(nextValue)}</p>
          </div>

          <div className="text-[10px] sm:text-xs lg:text-sm">
            <span className="text-gray-500 dark:text-gray-500">{t('forecast.last_month')} ({lastMonth}): </span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(lastValue)}</span>
          </div>

          <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs lg:text-sm ${isDecreasing ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            <TrendingDown size={12} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
            <span className="font-medium">
              {t('forecast.you_may_spend')} {formatCurrency(absDifference)} {isDecreasing ? t('common.less') : t('common.more')} {t('forecast.than')} {lastMonth}
            </span>
          </div>

          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-50 dark:border-gray-700">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-400 dark:text-gray-500">
              <span className="font-medium text-gray-600 dark:text-gray-400">{t('forecast.confidence')}:</span> {t('forecast.high_confidence')} ({t('forecast.based_on_2_months')})
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Spending Trend */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
          <div className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg sm:rounded-xl">
            <TrendingDown size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t('forecast.spending_trend')}
          </h3>
        </div>

        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-700 dark:text-gray-300">
            {t('forecast.your_spending_is')} <span className={isDecreasing ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {isDecreasing ? t('forecast.decreasing') : t('forecast.increasing')}
            </span> {t('forecast.compared_to_last_month')}.
          </p>

          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 lg:mt-3">
            {t('forecast.this_means_you_are_likely_to_spend')} <span className="font-bold">
              {isDecreasing ? t('common.less') : t('common.more')}
            </span> {t('forecast.than_before')}.
          </p>

          <div className="mt-2 sm:mt-3 lg:mt-4 pt-1 sm:pt-2 lg:pt-3 border-t border-gray-50 dark:border-gray-700">
            <div className="flex justify-between text-[9px] sm:text-[10px] lg:text-xs">
              <span className="text-gray-400 dark:text-gray-500">{t('forecast.trend_strength')}:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {Math.min(100, Math.round(Math.abs(trend) / lastValue * 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Top Spending Category */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
          <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg sm:rounded-xl">
            <PieChart size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t('forecast.top_category')} ({lastMonth})
          </h3>
        </div>

        {topCategory ? (
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 dark:text-white">{topCategory.name}</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">{topCategory.percentage}%</span>
            </div>

            <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 dark:text-gray-300">
              {formatCurrency(topCategory.amount)}
            </p>

            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 lg:mt-3">
              {t('forecast.this_was_your_highest_category')} {lastMonth}.
            </p>

            {topCategory.percentage > 50 && (
              <div className="mt-2 sm:mt-3 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg sm:rounded-xl">
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ {t('forecast.category_over_50_warning')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">{t('forecast.no_category_data')}</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;