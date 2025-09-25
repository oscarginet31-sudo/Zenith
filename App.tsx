import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
import { Transaction, Budget, RecurringTransaction, Theme, Category, SavingsGoal } from './types';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Analytics from './components/Analytics';
import Categories from './components/Categories';
import Icon from './components/Icon';
// FIX: Replace unused RecurringItems with the correct Recurring component.
import Recurring from './components/Recurring';
// FIX: Import MonthNavigator to resolve 'not found' error.
import MonthNavigator from './components/MonthNavigator';


// Constants
import { DEFAULT_CATEGORIES } from './constants';


// Hooks
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

type View = 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'recurring' | 'categories';

const App: React.FC = () => {
    // Abandoned theme feature, keeping dark mode as default.
    // const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
    const [view, setView] = useState<View>('dashboard');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Main data states
    const [transactions, setTransactions] = useLocalStorage<{ [key: string]: Transaction[] }>('all_transactions', {});
    const [budgets, setBudgets] = useLocalStorage<{ [key: string]: Budget[] }>('all_budgets', {});
    const [savingsGoals, setSavingsGoals] = useLocalStorage<{ [key: string]: SavingsGoal }>('all_savings_goals', {});
    const [recurringTxs, setRecurringTxs] = useLocalStorage<RecurringTransaction[]>('recurringTxs', []);
    // FIX: Correctly initialize categories state with Category objects instead of strings to match the defined type.
    const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES.map(name => ({ id: uuidv4(), name, isDefault: true })));
    
    // Helper to get the key for the current month's data
    const getMonthKey = (date: Date) => `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;

    // Generate recurring transactions when month changes
    useEffect(() => {
        const monthKey = getMonthKey(currentMonth);
        const currentMonthStartUTC = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
        const nextMonthStartUTC = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1));
        
        const newTransactionsForMonth: Transaction[] = [];

        recurringTxs.forEach(rtx => {
            const startDateParts = rtx.startDate.split('-').map(Number);
            const startDate = new Date(Date.UTC(startDateParts[0], startDateParts[1] - 1, startDateParts[2]));
            
            if (startDate >= nextMonthStartUTC) return; // Recurring item not started yet

            let transactionDateUTC: Date | null = null;
            
            if (rtx.frequency === 'mensuel') {
                transactionDateUTC = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), startDate.getUTCDate()));
            } else if (rtx.frequency === 'annuel' && startDate.getUTCMonth() === currentMonth.getUTCMonth() && startDate.getUTCFullYear() <= currentMonth.getUTCFullYear()) {
                transactionDateUTC = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), startDate.getUTCDate()));
            }
            
            if(transactionDateUTC && transactionDateUTC >= currentMonthStartUTC && transactionDateUTC < nextMonthStartUTC && transactionDateUTC >= startDate) {
                const year = transactionDateUTC.getUTCFullYear();
                const month = (transactionDateUTC.getUTCMonth() + 1).toString().padStart(2, '0');
                const day = transactionDateUTC.getUTCDate().toString().padStart(2, '0');

                newTransactionsForMonth.push({
                    id: uuidv4(),
                    description: rtx.description,
                    amount: rtx.amount,
                    category: rtx.category,
                    type: rtx.type,
                    date: `${year}-${month}-${day}`,
                    recurringTransactionId: rtx.id,
                });
            }
        });

        if (newTransactionsForMonth.length > 0) {
            setTransactions(prev => {
                const existingMonthTxs = prev[monthKey] || [];
                const nonRecurringExisting = existingMonthTxs.filter(t => !t.recurringTransactionId);
                const uniqueNewRecurring = newTransactionsForMonth.filter(nt => 
                    !existingMonthTxs.some(et => et.recurringTransactionId === nt.recurringTransactionId)
                );
                return { ...prev, [monthKey]: [...nonRecurringExisting, ...uniqueNewRecurring, ...existingMonthTxs.filter(t => t.recurringTransactionId && !uniqueNewRecurring.some(ur => ur.recurringTransactionId === t.recurringTransactionId))] };
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, recurringTxs]);

    // Derived data for the current month
    const monthlyTransactions = useMemo(() => {
        const monthKey = getMonthKey(currentMonth);
        return transactions[monthKey] || [];
    }, [transactions, currentMonth]);

    const monthlyBudgets = useMemo(() => {
        const monthKey = getMonthKey(currentMonth);
        return budgets[monthKey] || [];
    }, [budgets, currentMonth]);
    
    const monthlySavingsGoal = useMemo(() => {
        const monthKey = getMonthKey(currentMonth);
        return savingsGoals[monthKey] || null;
    }, [savingsGoals, currentMonth]);

    // --- CRUD Handlers ---

    // Transactions
    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const monthKey = getMonthKey(new Date(transaction.date));
        const newTransaction = { ...transaction, id: uuidv4() };
        setTransactions(prev => ({
            ...prev,
            [monthKey]: [...(prev[monthKey] || []), newTransaction]
        }));
    };

    const deleteTransaction = (id: string, date: string) => {
        const monthKey = getMonthKey(new Date(date));
        setTransactions(prev => ({
            ...prev,
            [monthKey]: prev[monthKey]?.filter(t => t.id !== id) || []
        }));
    };

    // Budgets
    const addBudget = (budget: Omit<Budget, 'id'>) => {
        const monthKey = getMonthKey(currentMonth);
        const newBudget = { ...budget, id: uuidv4() };
        setBudgets(prev => ({
            ...prev,
            [monthKey]: [...(prev[monthKey] || []), newBudget]
        }));
    };

    const deleteBudget = (id: string) => {
        const monthKey = getMonthKey(currentMonth);
        setBudgets(prev => ({
            ...prev,
            [monthKey]: prev[monthKey]?.filter(b => b.id !== id) || []
        }));
    };
    
    // Savings Goal
    const addOrUpdateSavingsGoal = (amount: number) => {
        const monthKey = getMonthKey(currentMonth);
        const newGoal = { id: monthKey, amount }; // Use monthKey as a stable ID
        setSavingsGoals(prev => ({
            ...prev,
            [monthKey]: newGoal
        }));
    };

    const deleteSavingsGoal = () => {
        const monthKey = getMonthKey(currentMonth);
        setSavingsGoals(prev => {
            const newState = { ...prev };
            delete newState[monthKey];
            return newState;
        });
    };

    // Recurring Transactions
    const addRecurringTx = (tx: Omit<RecurringTransaction, 'id'>) => {
        setRecurringTxs(prev => [...prev, { ...tx, id: uuidv4() }]);
    };
    
    const updateRecurringTx = (updatedTx: RecurringTransaction) => {
        setRecurringTxs(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    
        // Update already generated transactions from this month forward
        setTransactions(prevAllTxs => {
            const newAllTxs = { ...prevAllTxs };
            const currentMonthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
    
            Object.keys(newAllTxs).forEach(monthKey => {
                const monthDate = new Date(`${monthKey}-01T00:00:00Z`); // Create date from key (e.g., "2024-10")
                if (monthDate >= currentMonthStart) {
                    newAllTxs[monthKey] = newAllTxs[monthKey].map(t => {
                        if (t.recurringTransactionId === updatedTx.id) {
                            // Update properties, but keep the original date's year and month
                            const originalDate = new Date(t.date);
                            const newDay = new Date(updatedTx.startDate).getUTCDate();
                            const newDateForTx = new Date(Date.UTC(originalDate.getUTCFullYear(), originalDate.getUTCMonth(), newDay));
                            
                            const year = newDateForTx.getUTCFullYear();
                            const month = (newDateForTx.getUTCMonth() + 1).toString().padStart(2, '0');
                            const day = newDateForTx.getUTCDate().toString().padStart(2, '0');

                            return {
                                ...t,
                                description: updatedTx.description,
                                amount: updatedTx.amount,
                                category: updatedTx.category,
                                type: updatedTx.type,
                                date: `${year}-${month}-${day}`
                            };
                        }
                        return t;
                    });
                }
            });
            return newAllTxs;
        });
    };
    
    const deleteRecurringTx = (id: string) => {
        setRecurringTxs(prev => prev.filter(tx => tx.id !== id));
    
        // Remove already generated transactions from this month forward
        setTransactions(prevAllTxs => {
            const newAllTxs = { ...prevAllTxs };
            const currentMonthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
            
            Object.keys(newAllTxs).forEach(monthKey => {
                const monthDate = new Date(`${monthKey}-01T00:00:00Z`);
                if (monthDate >= currentMonthStart) {
                    newAllTxs[monthKey] = newAllTxs[monthKey].filter(t => t.recurringTransactionId !== id);
                }
            });
            return newAllTxs;
        });
    };

    // Categories
    const addCategory = (categoryName: string) => {
        const newCategory: Category = { id: uuidv4(), name: categoryName, isDefault: false };
        setCategories(prev => [...prev, newCategory]);
    };
    
    const updateCategory = (updatedCategory: Category) => {
        const oldCategoryName = categories.find(c => c.id === updatedCategory.id)?.name;
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    
        // Update in all transactions and budgets across all months
        if (oldCategoryName && oldCategoryName !== updatedCategory.name) {
            setTransactions(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(monthKey => {
                    newState[monthKey] = newState[monthKey].map(t => 
                        t.category === oldCategoryName ? { ...t, category: updatedCategory.name } : t
                    );
                });
                return newState;
            });
            setBudgets(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(monthKey => {
                    newState[monthKey] = newState[monthKey].map(b => 
                        b.category === oldCategoryName ? { ...b, category: updatedCategory.name } : b
                    );
                });
                return newState;
            });
            setRecurringTxs(prev => {
                return prev.map(rtx => 
                    rtx.category === oldCategoryName ? { ...rtx, category: updatedCategory.name } : rtx
                );
            });
        }
    };
    
    const deleteCategory = (id: string) => {
        const categoryToDelete = categories.find(c => c.id === id);
        if (!categoryToDelete || categoryToDelete.isDefault) return;

        setCategories(prev => prev.filter(c => c.id !== id));
        
        // Re-assign transactions and budgets to 'Autre'
        const fallbackCategory = "Autre";
        setTransactions(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(monthKey => {
                newState[monthKey] = newState[monthKey].map(t => 
                    t.category === categoryToDelete.name ? { ...t, category: fallbackCategory } : t
                );
            });
            return newState;
        });
        setBudgets(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(monthKey => {
                newState[monthKey] = newState[monthKey].map(b => 
                    b.category === categoryToDelete.name ? { ...b, category: fallbackCategory } : b
                );
            });
            return newState;
        });
        setRecurringTxs(prev => {
            return prev.map(rtx => 
                rtx.category === categoryToDelete.name ? { ...rtx, category: fallbackCategory } : rtx
            );
        });
    };

    // --- RENDER LOGIC ---

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard transactions={monthlyTransactions} savingsGoal={monthlySavingsGoal} budgets={monthlyBudgets} />;
            case 'transactions':
                return <Transactions transactions={monthlyTransactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} categories={categories} />;
            case 'budgets':
                return <Budgets 
                            budgets={monthlyBudgets} 
                            transactions={monthlyTransactions} 
                            addBudget={addBudget} 
                            deleteBudget={deleteBudget} 
                            categories={categories} 
                            savingsGoal={monthlySavingsGoal}
                            addOrUpdateSavingsGoal={addOrUpdateSavingsGoal}
                            deleteSavingsGoal={deleteSavingsGoal}
                        />;
            case 'analytics':
                return <Analytics transactions={monthlyTransactions} />;
            case 'recurring':
                // FIX: Use the functional Recurring component instead of the placeholder RecurringItems.
                return <Recurring recurringTxs={recurringTxs} addRecurringTx={addRecurringTx} updateRecurringTx={updateRecurringTx} deleteRecurringTx={deleteRecurringTx} categories={categories} />;
            case 'categories':
                return <Categories categories={categories} addCategory={addCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} />;
            default:
                return <Dashboard transactions={monthlyTransactions} savingsGoal={monthlySavingsGoal} budgets={monthlyBudgets} />;
        }
    };

    const NavItem: React.FC<{ currentView: View; viewName: View; icon: string; label: string }> = ({ currentView, viewName, icon, label }) => (
        <button
            onClick={() => setView(viewName)}
            className={`flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-lg transition-colors text-xs
                ${currentView === viewName ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`
            }
        >
            <Icon name={icon} className="text-xl" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="bg-slate-900 text-slate-300 min-h-screen font-sans">
             <header className="bg-slate-800 p-2 flex justify-between items-center sticky top-0 z-10 border-b border-slate-700 h-[69px]">
                <div className="flex items-center gap-4 pl-2">
                     <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <h1 className="text-2xl font-bold text-slate-100">Zenith</h1>
                </div>
                <MonthNavigator currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
                <div className="w-24"></div> 
            </header>
            <div className="flex">
                <nav className="w-24 bg-slate-800 p-2 flex flex-col gap-2 border-r border-slate-700 h-[calc(100vh-69px)] sticky top-[69px]">
                    <NavItem currentView={view} viewName="dashboard" icon="fa-house" label="Dashboard" />
                    <NavItem currentView={view} viewName="transactions" icon="fa-exchange-alt" label="Transactions" />
                    <NavItem currentView={view} viewName="budgets" icon="fa-bullseye" label="Budgets" />
                    <NavItem currentView={view} viewName="analytics" icon="fa-chart-pie" label="Analyse" />
                    <NavItem currentView={view} viewName="recurring" icon="fa-repeat" label="Récurrences" />
                    <NavItem currentView={view} viewName="categories" icon="fa-tags" label="Catégories" />
                </nav>
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;