import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import BaseCard from './BaseCard';

const ExpenseCard = ({ value, t }) => {
  return (
    <BaseCard
      icon={<ArrowDownRight size={24} />}
      iconBg="bg-rose-50 dark:bg-rose-900/30"
      iconColor="text-rose-600 dark:text-rose-400"
      badge={t('dashboard.this_month')}
      badgeColor="text-rose-500 dark:text-rose-400"
      label={t('dashboard.expense')}
      value={value}
      valueColor="text-rose-600 dark:text-rose-400"
    />
  );
};

export default ExpenseCard;