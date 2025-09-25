import React, { useState, useEffect } from 'react';
import { Income } from '../types';
import Icon from './Icon';

interface IncomesProps {
  incomes: Income[];
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
}

const Incomes: React.FC<IncomesProps> = ({ incomes, addIncome, updateIncome, deleteIncome }) => {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'récurrent' | 'ponctuel'>('récurrent');

  useEffect(() => {
    if (editingIncome) {
      setSource(editingIncome.source);
      setAmount(String(editingIncome.amount));
      setDate(editingIncome.date);
      setType(editingIncome.type);
    } else {
      resetForm();
    }
  }, [editingIncome]);

  const resetForm = () => {
    setSource('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setType('récurrent');
    setEditingIncome(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount) return;
    
    const incomeData = {
      source,
      amount: parseFloat(amount),
      date,
      type
    };

    if (editingIncome) {
      updateIncome({ ...incomeData, id: editingIncome.id });
    } else {
      addIncome(incomeData);
    }
    
    resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {editingIncome ? 'Modifier le revenu' : 'Ajouter un revenu'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="source" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Source de revenu</label>
            <input type="text" id="source" value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="ex: Salaire mensuel" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Montant</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="3000" />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md">
            <button type="button" onClick={() => setType('récurrent')} className={`flex-1 py-2 rounded-l-md transition ${type === 'récurrent' ? 'bg-emerald-500/80 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>Récurrent</button>
            <button type="button" onClick={() => setType('ponctuel')} className={`flex-1 py-2 rounded-r-md transition ${type === 'ponctuel' ? 'bg-sky-500/80 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>Ponctuel</button>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date de début / Date perçue</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div className="lg:col-start-4 flex gap-2">
            {editingIncome && (
              <button type="button" onClick={resetForm} className="w-full bg-slate-500 dark:bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-600 dark:hover:bg-slate-700 transition duration-300">
                Annuler
              </button>
            )}
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300">
              {editingIncome ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Vos sources de revenus</h3>
        <div className="space-y-3">
          {incomes.length > 0 ? (
            incomes
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(income => (
                <div key={income.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${income.type === 'récurrent' ? 'bg-emerald-500/10' : 'bg-sky-500/10'}`}>
                      <Icon name={income.type === 'récurrent' ? 'fa-sync' : 'fa-calendar-check'} className={`${income.type === 'récurrent' ? 'text-emerald-400' : 'text-sky-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{income.source}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{income.type} - {new Date(income.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className="font-mono font-semibold text-green-500 dark:text-green-400">+ {income.amount.toFixed(2)} €</p>
                     <button onClick={() => setEditingIncome(income)} className="text-slate-400 dark:text-slate-500 hover:text-yellow-500 transition-colors">
                        <Icon name="fa-pencil" />
                     </button>
                     <button onClick={() => deleteIncome(income.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                        <Icon name="fa-trash-can" />
                     </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-10">
              <Icon name="fa-sack-dollar" className="text-4xl text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-500">Aucune source de revenu enregistrée.</p>
              <p className="text-sm text-slate-400 dark:text-slate-600">Ajoutez-en une pour commencer le suivi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incomes;