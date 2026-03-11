import { useDashboardSummaryCards } from '../hooks/useDashboardSummaryCards';
import BalanceCard from './cards/BalanceCard';
import IncomeCard from './cards/IncomeCard';
import ExpenseCard from './cards/ExpenseCard';
import LimitCard from './cards/LimitCard';

function DashboardSummaryCards() {
  const {
    t,
    stats,
    userData,
    hasLimit,
    spendingPercentage,
    isOverLimit,
    formatCurrency,
    animatedBalance,
    animatedIncome,
    animatedExpense,

  } = useDashboardSummaryCards();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <BalanceCard value={formatCurrency(animatedBalance)} t={t} />
      <IncomeCard value={formatCurrency(animatedIncome)} t={t} />
      <ExpenseCard value={formatCurrency(animatedExpense)} t={t} />
      <LimitCard
        hasLimit={hasLimit}
        userData={userData}
        stats={stats}
        spendingPercentage={spendingPercentage}
        isOverLimit={isOverLimit}
        t={t}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

export default DashboardSummaryCards;