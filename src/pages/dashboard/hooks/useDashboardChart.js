import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
export const useDashboardChart = () => {
      const { t } = useTranslation();
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

      return{
        t, hasData, chartData, formatDate, formatMoney
      }
}