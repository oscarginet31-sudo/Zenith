import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Budget, SavingsGoal, ZenithPrediction } from '../types';
import { getZenithPrediction } from '../services/geminiService';
import Icon from './Icon';

interface DashboardProps {
  transactions: Transaction[];
  savingsGoal: SavingsGoal | null;
  budgets: Budget[];
}

const StatCard: React.FC<{ title: string; amount: number; icon: string; iconContainerClass: string; iconClass: string; }> = ({ title, amount, icon, iconContainerClass, iconClass }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconContainerClass}`}>
            <Icon name={icon} className={`text-xl ${iconClass}`} />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{amount.toFixed(2)} €</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions, savingsGoal, budgets }) => {
  const [prediction, setPrediction] = useState<ZenithPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { totalIncome, totalExpense, totalSavings, balance } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense' && t.category !== 'Épargne').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.type === 'expense' && t.category === 'Épargne').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = income - expense - savings;
    return { totalIncome: income, totalExpense: expense, totalSavings: savings, balance: currentBalance };
  }, [transactions]);

  useEffect(() => {
    const fetchPrediction = async () => {
        if (transactions.filter(t => t.type === 'expense' && t.category !== 'Épargne').length >= 3 && totalIncome > 0) {
            setIsLoading(true);
            try {
                const result = await getZenithPrediction(transactions, totalIncome);
                setPrediction(result);
            } catch (error) {
                console.error("Failed to fetch Zenith prediction:", error);
                setPrediction(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setPrediction(null);
        }
    };
    fetchPrediction();
  }, [transactions, totalIncome]);

  // Savings Goal Progress
  const savingsProgress = useMemo(() => {
      if (!savingsGoal) return { percentage: 0, text: '' };
      const percentage = Math.min((totalSavings / savingsGoal.amount) * 100, 100);
      const remaining = savingsGoal.amount - totalSavings;
      const text = remaining > 0 
        ? `${remaining.toFixed(2)} € restants pour atteindre votre objectif.`
        : `Objectif atteint et dépassé de ${Math.abs(remaining).toFixed(2)} € !`;
      return { percentage, text };
  }, [savingsGoal, totalSavings]);

  // Budgets Overview
  const budgetOverview = useMemo(() => {
      if (budgets.length === 0) return null;
      let onTrack = 0;
      let overLimit = 0;

      budgets.forEach(budget => {
          const spent = transactions
            .filter(t => t.category === budget.category && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          if (spent > budget.limit) {
              overLimit++;
          } else {
              onTrack++;
          }
      });
      return { onTrack, overLimit, total: budgets.length };
  }, [budgets, transactions]);
  
  return (
    <div className="space-y-8">
      {/* Zenith Prediction Card */}
      {(isLoading || prediction || transactions.filter(t => t.type === 'expense' && t.category !== 'Épargne').length < 3) && (
        <div className="bg-gradient-to-r from-emerald-900/50 to-sky-900/50 p-6 rounded-xl shadow-lg border border-emerald-700/50 text-center">
            <h3 className="text-xl font-semibold text-slate-100 mb-2 flex items-center justify-center gap-2">
                <Icon name="fa-wand-magic-sparkles" />
                Prédiction de Zénith
            </h3>
            {isLoading ? (
                <Icon name="fa-spinner fa-spin" className="text-2xl text-emerald-400 my-4" />
            ) : prediction ? (
                <div className="space-y-4 mt-4">
                    <p className="text-slate-300 italic">"{prediction.suggestion}"</p>
                    <div className="flex justify-center gap-8 text-slate-200">
                        <div>
                            <p className="text-sm text-slate-400">Dépenses projetées</p>
                            <p className="text-lg font-bold">{prediction.projectedExpenses.toFixed(2)} €</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Solde final estimé</p>
                            <p className={`text-lg font-bold ${prediction.projectedBalance < 0 ? 'text-red-400' : 'text-green-400'}`}>{prediction.projectedBalance.toFixed(2)} €</p>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-slate-400 mt-4 text-sm">Ajoutez au moins 3 dépenses (hors épargne) pour obtenir une prédiction de Zénith.</p>
            )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenus du mois" amount={totalIncome} icon="fa-arrow-up" iconContainerClass="bg-green-500/10" iconClass="text-green-500 dark:text-green-400" />
        <StatCard title="Dépenses du mois" amount={totalExpense} icon="fa-arrow-down" iconContainerClass="bg-red-500/10" iconClass="text-red-500 dark:text-red-400" />
        <StatCard title="Épargne du mois" amount={totalSavings} icon="fa-piggy-bank" iconContainerClass="bg-sky-500/10" iconClass="text-sky-500 dark:text-sky-400" />
        <StatCard title="Solde actuel" amount={balance} icon="fa-wallet" iconContainerClass="bg-amber-500/10" iconClass="text-amber-500 dark:text-amber-400" />
      </div>

      {/* Savings Goal & Budgets Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Savings goal card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Objectif d'épargne</h3>
            {savingsGoal ? (
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-100">{totalSavings.toFixed(2)} €</span> / {savingsGoal.amount.toFixed(2)} €
                        </p>
                        <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{savingsProgress.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${savingsProgress.percentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 text-right">{savingsProgress.text}</p>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Icon name="fa-piggy-bank" className="text-4xl text-slate-400 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-500">Aucun objectif d'épargne défini.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-600">Allez dans "Budgets" pour en créer un.</p>
                </div>
            )}
        </div>
        {/* Budgets summary card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Aperçu des budgets</h3>
            {budgetOverview ? (
                <div className="flex items-center justify-around h-full">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-green-500 dark:text-green-400">{budgetOverview.onTrack}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Budgets respectés</p>
                    </div>
                    <div className="h-16 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-red-500 dark:text-red-400">{budgetOverview.overLimit}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Budgets dépassés</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Icon name="fa-bullseye" className="text-4xl text-slate-400 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-500">Aucun budget de dépenses défini.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-600">Créez-en dans l'onglet "Budgets".</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
