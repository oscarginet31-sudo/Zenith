import React from 'react';
import { Budget, Transaction } from '../types';
import Icon from './Icon';

interface BudgetCardProps {
  budget: Budget;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, transactions, onDelete }) => {
  const spent = transactions
    .filter(t => t.category === budget.category && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = Math.min((spent / budget.limit) * 100, 100);
  const remaining = budget.limit - spent;

  let progressBarColor = 'bg-emerald-500';
  if (percentage > 75) progressBarColor = 'bg-yellow-500';
  if (percentage >= 100) progressBarColor = 'bg-red-500';

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg relative border border-slate-200 dark:border-slate-700">
      <button onClick={() => onDelete(budget.id)} className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-red-400 transition-colors">
        <Icon name="fa-times" />
      </button>
      <div className="flex justify-between items-baseline mb-1">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{budget.category}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-100">{spent.toFixed(2)} €</span> / {budget.limit.toFixed(2)} €
        </p>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
        <div
          className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-500 text-right">
        {remaining >= 0 ? `${remaining.toFixed(2)} € restants` : `${Math.abs(remaining).toFixed(2)} € de dépassement`}
      </p>
    </div>
  );
};

export default BudgetCard;