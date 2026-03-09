import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import BaseCard from './BaseCard';

const IncomeCard = ({ value, t }) => {
  return (
    <BaseCard
      icon={<ArrowUpRight size={24} />}
      iconBg="bg-emerald-50 dark:bg-emerald-900/30"
      iconColor="text-emerald-600 dark:text-emerald-400"
      badge={t('dashboard.this_month')}
      badgeColor="text-gray-400 dark:text-gray-500"
      label={t('dashboard.income')}
      value={value}
      valueColor="text-emerald-600 dark:text-emerald-400"
    />
  );
};

export default IncomeCard;