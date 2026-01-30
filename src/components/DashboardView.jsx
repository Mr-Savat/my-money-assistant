import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { financeData } from "../constants";

const FinanceChart = () => {
  // Prepare data for Forecast Point (add 1 month after the existing data)
  const lastMonth = financeData[financeData.length - 1];
  const prevMonth = financeData[financeData.length - 2];

  const lastTotal = Object.values(lastMonth.expenses).reduce((a, b) => a + b, 0);
  const prevTotal = Object.values(prevMonth.expenses).reduce((a, b) => a + b, 0);
  const trend = (lastTotal - prevTotal) / prevTotal;
  const prediction = Math.round(lastTotal * (1 + trend));

  // Insert forecast data into array for displaying on the chart
  const chartData = [
    ...financeData.map(d => ({
      name: d.month,
      income: d.income,
      expense: Object.values(d.expenses).reduce((a, b) => a + b, 0),
    })),
    { name: 'Next Month (AI)', forecast: prediction } // Forecast point
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Trends and Forecast</h3>
      <div className="h-100 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* 
            <ReferenceLine
              y={1500}
              label="Budget Limit"
              stroke="red"
              strokeDasharray="3 3"
            /> */}
            {/* Income line */}
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income ($)" dot={{ r: 6 }} />
            {/* Actual expense line */}
            <Line type="monotone" dataKey="expense" stroke="#3b82f6" strokeWidth={3} name="Actual Expense ($)" dot={{ r: 6 }} />
            {/* Forecast line (use a different color to distinguish) */}
            <Line type="dashed" dataKey="forecast" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="Forecast ($)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-gray-400 mt-4 italic">
        * Dashed line represents AI-based estimation using past data
      </p>
    </div>
  );
};

export default FinanceChart;
