import { useTranslation } from '../../../hooks/useTranslation';

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

export default CustomTooltip