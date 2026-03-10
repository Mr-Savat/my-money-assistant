import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import BaseCard from './BaseCard';

const BalanceCard = ({ value, t }) => {
  return (
    <BaseCard
      icon={<Wallet size={24} />}
      iconBg="bg-indigo-50 dark:bg-indigo-900/30"
      iconColor="text-indigo-600 dark:text-indigo-400"
      badge={
        <span className="flex items-center gap-1">
          <TrendingUp size={12} /> {t('dashboard.live')}
        </span>
      }
      badgeColor="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
      label={t('dashboard.total_balance')}
      value={value}
    />
  );
};

export default BalanceCard;