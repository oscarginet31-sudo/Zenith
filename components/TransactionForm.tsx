// FIX: Implemented missing component to resolve import errors.
import React, { useState } from 'react';
// FIX: Update imported types to include Category.
import { Transaction, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import Icon from './Icon';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  // FIX: Changed prop from customCategories string array to a Category object array for type consistency.
  categories: Category[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction, categories }) => {
  // FIX: Map Category objects to names for use in the form.
  const allCategoryNames = categories.map(c => c.name);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  // FIX: Initialize category state with the first category name.
  const [category, setCategory] = useState(allCategoryNames[0] || '');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addTransaction({
      description,
      amount: parseFloat(amount),
      category,
      type,
      date,
    });

    // Reset form
    setDescription('');
    setAmount('');
    // FIX: Reset category to the first available category name.
    setCategory(allCategoryNames[0] || '');
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Ajouter une transaction</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Description */}
        <div className="lg:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="ex: Courses, Salaire"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Montant</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="125.50"
            required
          />
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Catégorie</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {/* FIX: Iterate over category names for dropdown options. */}
            {allCategoryNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Type & Submit */}
        <div className="flex gap-2">
            <div className="flex-grow flex bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md">
                <button type="button" onClick={() => setType('expense')} className={`w-1/2 py-2 rounded-l-md transition ${type === 'expense' ? 'bg-red-500/80 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>
                    <Icon name="fa-arrow-down" />
                </button>
                <button type="button" onClick={() => setType('income')} className={`w-1/2 py-2 rounded-r-md transition ${type === 'income' ? 'bg-green-500/80 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>
                    <Icon name="fa-arrow-up" />
                </button>
            </div>
             <button type="submit" className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300">
                <Icon name="fa-plus" />
             </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;