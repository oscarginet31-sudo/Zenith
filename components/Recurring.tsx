import React, { useState, useEffect } from 'react';
// FIX: Update imported types to include Category.
import { RecurringTransaction, Category } from '../types';
import Icon from './Icon';

interface RecurringProps {
  recurringTxs: RecurringTransaction[];
  addRecurringTx: (tx: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTx: (tx: RecurringTransaction) => void;
  deleteRecurringTx: (id: string) => void;
  // FIX: Changed prop from customCategories string array to a Category object array.
  categories: Category[];
}

const Recurring: React.FC<RecurringProps> = ({ recurringTxs, addRecurringTx, updateRecurringTx, deleteRecurringTx, categories }) => {
  const [editingTx, setEditingTx] = useState<RecurringTransaction | null>(null);

  // FIX: Derive all category names from the new 'categories' prop.
  const allCategoryNames = categories.map(c => c.name);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(allCategoryNames[0] || '');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [frequency, setFrequency] = useState<'mensuel' | 'annuel'>('mensuel');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (editingTx) {
      setDescription(editingTx.description);
      setAmount(String(editingTx.amount));
      setCategory(editingTx.category);
      setType(editingTx.type);
      setFrequency(editingTx.frequency);
      setStartDate(editingTx.startDate);
    } else {
      resetForm();
    }
  }, [editingTx]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory(allCategoryNames[0] || '');
    setType('expense');
    setFrequency('mensuel');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEditingTx(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const txData = {
      description,
      amount: parseFloat(amount),
      category,
      type,
      frequency,
      startDate,
    };

    if (editingTx) {
      updateRecurringTx({ ...txData, id: editingTx.id });
    } else {
      addRecurringTx(txData);
    }

    resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {editingTx ? 'Modifier la récurrence' : 'Ajouter une transaction récurrente'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Description */}
          <div className="lg:col-span-2">
            <label htmlFor="rec-description" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <input type="text" id="rec-description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="ex: Loyer, Abonnement Netflix" />
          </div>

          {/* Type */}
          <div className="flex bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md h-10">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 rounded-l-md transition ${type === 'expense' ? 'bg-red-500/80 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>Dépense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 rounded-r-md transition ${type === 'income' ? 'bg-green-500/80 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>Revenu</button>
          </div>
          
          {/* Amount */}
          <div>
            <label htmlFor="rec-amount" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Montant</label>
            <input type="number" id="rec-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="750.00" />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="rec-category" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Catégorie</label>
            <select id="rec-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              {/* FIX: Iterate over category names for dropdown options. */}
              {allCategoryNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="rec-frequency" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fréquence</label>
            <select id="rec-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="rec-start-date" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date de début</label>
            <input type="date" id="rec-start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>

          {/* Actions */}
          <div className="lg:col-span-3 flex gap-2">
            {editingTx && (
              <button type="button" onClick={resetForm} className="w-full bg-slate-500 dark:bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-600 dark:hover:bg-slate-700 transition duration-300">
                Annuler
              </button>
            )}
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300">
              {editingTx ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Vos transactions récurrentes</h3>
        <div className="space-y-3">
          {recurringTxs.length > 0 ? (
            recurringTxs
              .slice()
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map(tx => (
                <div key={tx.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'expense' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                      <Icon name="fa-repeat" className={`${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{tx.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{tx.category} - {tx.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className={`font-mono font-semibold ${tx.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>{tx.type === 'expense' ? '-' : '+'} {tx.amount.toFixed(2)} €</p>
                     <button onClick={() => setEditingTx(tx)} className="text-slate-400 dark:text-slate-500 hover:text-yellow-500 transition-colors">
                        <Icon name="fa-pencil" />
                     </button>
                     <button onClick={() => deleteRecurringTx(tx.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                        <Icon name="fa-trash-can" />
                     </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-10">
              <Icon name="fa-repeat" className="text-4xl text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-500">Aucune transaction récurrente enregistrée.</p>
              <p className="text-sm text-slate-400 dark:text-slate-600">Ajoutez les loyers, salaires, et abonnements ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recurring;