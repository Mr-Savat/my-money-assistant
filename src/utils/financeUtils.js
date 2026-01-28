export const calculateFinance = (financeData) => {
  const totalIncome = financeData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = financeData.reduce((sum, item) => sum + item.expense, 0);
  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
};
