// FIX: Implemented missing types module to resolve import errors across the application.

export type TransactionType = 'expense' | 'income';
export type RecurringFrequency = 'mensuel' | 'annuel';
export type IncomeType = 'récurrent' | 'ponctuel';
export type Theme = 'light' | 'dark';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO string format: YYYY-MM-DD
  recurringTransactionId?: string;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
}

export interface RecurringTransaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: TransactionType;
    frequency: RecurringFrequency;
    startDate: string; // ISO string format: YYYY-MM-DD
}

export interface ZenithPrediction {
    projectedExpenses: number;
    projectedBalance: number;
    suggestion: string;
}

// FIX: Added missing Category interface to resolve compilation error in App.tsx.
export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

// FIX: Added missing Income interface to resolve compilation error in Incomes.tsx.
export interface Income {
    id: string;
    source: string;
    amount: number;
    date: string; // ISO string format: YYYY-MM-DD
    type: IncomeType;
}

export interface SavingsGoal {
    id: string;
    amount: number;
}
