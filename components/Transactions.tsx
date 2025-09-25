import React from 'react';
// FIX: Update imported types to include Category.
import { Transaction, Category } from '../types';
import TransactionForm from './TransactionForm';
import Icon from './Icon';

// --- PROPS INTERFACE ---
interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  // FIX: Update deleteTransaction signature to include date for precise identification.
  deleteTransaction: (id: string, date: string) => void;
  // FIX: Changed prop from customCategories string array to a Category object array.
  categories: Category[];
}

// --- SUB-COMPONENTS ---
// FIX: Update onDelete prop to match the new deleteTransaction signature.
const TransactionItem: React.FC<{ transaction: Transaction; onDelete: (id: string, date: string) => void }> = ({ transaction, onDelete }) => {
    // FIX: Property 'recurringIncomeId' does not exist on type 'Transaction'. Removed it from destructuring.
    const { id, type, description, category, amount, date, recurringTransactionId } = transaction;
    const isExpense = type === 'expense';
    const amountColor = isExpense ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const formattedAmount = `${isExpense ? '-' : '+'} ${amount.toFixed(2)} €`;
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    // FIX: Updated recurring check to only use recurringTransactionId.
    const isRecurring = !!recurringTransactionId;

    return (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
                 <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    <Icon name={isExpense ? 'fa-arrow-down' : 'fa-arrow-up'} className={`${isExpense ? 'text-red-500' : 'text-green-500'}`} />
                 </div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {description}
                      {isRecurring && <Icon name="fa-repeat" className="text-xs text-emerald-400" title="Généré par une récurrence" />}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{category}</p>
                </div>
            </div>
            <div className="text-right flex items-center gap-4">
                <div>
                    <p className={`font-mono font-semibold ${amountColor}`}>{formattedAmount}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">{formattedDate}</p>
                </div>
                 {/* FIX: Pass both id and date to the onDelete handler. */}
                 <button onClick={() => onDelete(id, date)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                    <Icon name="fa-trash-can" />
                 </button>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, deleteTransaction, categories }) => {
  return (
    <div className="space-y-8">
      {/* FIX: Pass the full categories array to the form component. */}
      <TransactionForm addTransaction={addTransaction} categories={categories} />
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Historique du mois</h3>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(tx => <TransactionItem key={tx.id} transaction={tx} onDelete={deleteTransaction} />)
          ) : (
            <div className="text-center py-10">
              <Icon name="fa-file-invoice-dollar" className="text-4xl text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-500">Aucune transaction pour le moment.</p>
              <p className="text-sm text-slate-400 dark:text-slate-600">Ajoutez-en une via le formulaire ci-dessus.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;