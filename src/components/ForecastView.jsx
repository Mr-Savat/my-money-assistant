import React from 'react';
import { financeData } from "../constants";

const ForecastView = () => {
  // Get last month and previous month data
  const lastMonth = financeData[financeData.length - 1];
  const prevMonth = financeData[financeData.length - 2];

  // Function to calculate total monthly expenses
  const getTotalExpense = (monthData) =>
    Object.values(monthData.expenses).reduce((a, b) => a + b, 0);

  const lastTotal = getTotalExpense(lastMonth);
  const prevTotal = getTotalExpense(prevMonth);

  // 1. Calculate overall trend (%)
  const trendPercent = (((lastTotal - prevTotal) / prevTotal) * 100).toFixed(1);
  const predictedExpense = Math.round(lastTotal * (1 + trendPercent / 100));
  const predictedSavings = lastMonth.income - predictedExpense;

  // 2. Find the expense category with the highest increase (Top Growing Category)
  const getTopIncrease = () => {
    let topCat = "";
    let maxDiff = -Infinity;

    Object.keys(lastMonth.expenses).forEach((cat) => {
      const diff = lastMonth.expenses[cat] - prevMonth.expenses[cat];
      if (diff > maxDiff) {
        maxDiff = diff;
        topCat = cat;
      }
    });
    return { category: topCat, amount: maxDiff };
  };

  const topIncrease = getTopIncrease();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="p-2 bg-blue-100 rounded-lg text-blue-600">✨</span>
        <h2 className="text-xl font-bold text-gray-800">AI Forecast</h2>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Based on your data from {lastMonth.month} and {prevMonth.month}.
      </p>

      {/* Forecast Expense Card */}
      <div className={`p-4 rounded-xl border-l-4 mb-6 ${predictedSavings < 0 ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
        <p className="text-sm font-medium text-gray-600">Expected Expenses Next Month</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">${predictedExpense}</span>
          <span className={`text-sm font-bold ${trendPercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {trendPercent > 0 ? '↑' : '↓'} {Math.abs(trendPercent)}%
          </span>
        </div>
      </div>

      {/* AI Analysis Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Saving Potential</p>
          <p className={`text-xl font-bold mt-1 ${predictedSavings < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ${predictedSavings}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Highest Expense Increase</p>
          <p className="text-xl font-bold mt-1 text-orange-600">
            {topIncrease.category} (+${topIncrease.amount})
          </p>
        </div>
      </div>

      {/* Smart Advice Section */}
      <div className="p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm font-bold text-indigo-800 flex items-center gap-2">
          💡 Advice from Financial Assistant
        </p>
        <p className="text-sm text-indigo-900 mt-2 leading-relaxed">
          {predictedSavings < 0
            ? `Warning! Your expenses may exceed your income. Try reducing spending on "${topIncrease.category}" to maintain balance.`
            : `You're on the right track! If you further reduce spending on "${topIncrease.category}", you could save more than $${predictedSavings + 50} next month.`}
        </p>
      </div>
    </div>
  );
};

export default ForecastView;
