// FIX: Implemented missing component to resolve import errors.
import React, { useState, useEffect } from 'react';
// FIX: Update imported types to include Category.
import { Budget, Transaction, Category, SavingsGoal } from '../types';
import BudgetCard from './BudgetCard';
import Icon from './Icon';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  // FIX: Changed prop from customCategories string array to a Category object array for type consistency.
  categories: Category[];
  savingsGoal: SavingsGoal | null;
  addOrUpdateSavingsGoal: (amount: number) => void;
  deleteSavingsGoal: () => void;
}

const Budgets: React.FC<BudgetsProps> = ({ budgets, transactions, addBudget, deleteBudget, categories, savingsGoal, addOrUpdateSavingsGoal, deleteSavingsGoal }) => {
  // FIX: Derive all category names from the new 'categories' prop.
  const allCategoryNames = categories.map(c => c.name);
  const [limit, setLimit] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');

  useEffect(() => {
    if (savingsGoal) {
      setSavingsAmount(String(savingsGoal.amount));
    } else {
      setSavingsAmount('');
    }
  }, [savingsGoal]);
  
  // Filter out categories that already have a budget or is the 'Épargne' category
  const availableCategories = allCategoryNames.filter(c => c !== 'Épargne' && !budgets.some(b => b.category === c));
  const [category, setCategory] = useState(availableCategories[0] || '');

  useEffect(() => {
    setCategory(availableCategories[0] || '')
  }, [budgets, categories]);


  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit || parseFloat(limit) <= 0) return;

    addBudget({
      category,
      limit: parseFloat(limit),
    });

    // FIX: Update reset logic for category dropdown to handle new available categories.
    const nextAvailable = availableCategories.filter(c => c !== category);
    setCategory(nextAvailable.length > 0 ? nextAvailable[0] : '');
    setLimit('');
  };

  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(savingsAmount);
    if (!isNaN(amount) && amount > 0) {
        addOrUpdateSavingsGoal(amount);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Objectif d'Épargne du Mois</h3>
        <form onSubmit={handleSavingsSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
                <label htmlFor="savings-goal" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Montant à épargner (€)</label>
                <input
                  type="number"
                  id="savings-goal"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="ex: 250"
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    disabled={!savingsAmount}
                >
                    {savingsGoal ? 'Mettre à jour' : 'Définir'}
                </button>
                {savingsGoal && (
                    <button
                        type="button"
                        onClick={() => {
                            deleteSavingsGoal();
                            setSavingsAmount('');
                        }}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        title="Supprimer l'objectif"
                    >
                        <Icon name="fa-trash-can" />
                    </button>
                )}
            </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Créer un budget de dépenses</h3>
        <form onSubmit={handleBudgetSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="budget-category" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Catégorie</label>
            <select
              id="budget-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={availableCategories.length === 0}
            >
              {availableCategories.length > 0 ? (
                availableCategories.map(c => <option key={c} value={c}>{c}</option>)
              ) : (
                <option>Toutes les catégories ont un budget</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="budget-limit" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Limite mensuelle (€)</label>
            <input
              type="number"
              id="budget-limit"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={availableCategories.length === 0 || !limit}
          >
            Ajouter le budget
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Vos budgets de dépenses</h3>
        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(budget => (
              <BudgetCard key={budget.id} budget={budget} transactions={transactions} onDelete={deleteBudget} />
            ))}
          </div>
        ) : (
            <div className="text-center py-10">
              <Icon name="fa-bullseye" className="text-4xl text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-500">Aucun budget défini pour le moment.</p>
              <p className="text-sm text-slate-400 dark:text-slate-600">Créez des budgets pour suivre vos dépenses par catégorie.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;