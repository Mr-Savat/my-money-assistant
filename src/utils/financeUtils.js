export const calculateFinance = (financeData) => {
  let totalIncome = 0;
  let totalExpense = 0;

  financeData.forEach(item => {
    totalIncome += item.income;

    // បូក expense category ទាំងអស់ក្នុងខែ
    const monthExpense = Object.values(item.expenses)
      .reduce((sum, value) => sum + value, 0);

    totalExpense += monthExpense;
  });

  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
};