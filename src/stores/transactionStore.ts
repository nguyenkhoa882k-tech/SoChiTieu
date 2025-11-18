import { create } from 'zustand';
import type { Transaction, TransactionInput } from '@/types/transaction';
import {
  deleteTransaction,
  fetchTransactions,
  insertTransaction,
  updateTransaction,
} from '@/data/database';

interface MonthlyStatItem {
  monthLabel: string;
  income: number;
  expense: number;
}

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  byCategory: Record<string, number>;
  byMonth: MonthlyStatItem[];
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  stats: TransactionStats;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  editTransaction: (
    id: number,
    updates: Partial<TransactionInput>,
  ) => Promise<Transaction | null>;
  refresh: () => Promise<void>;
}

const computeStats = (transactions: Transaction[]): TransactionStats => {
  const summary: TransactionStats = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    byCategory: {},
    byMonth: [],
  };

  const monthlyBucket = new Map<string, { income: number; expense: number }>();

  transactions.forEach(item => {
    if (item.type === 'income') {
      summary.totalIncome += item.amount;
    } else {
      summary.totalExpense += item.amount;
    }

    summary.byCategory[item.category] =
      (summary.byCategory[item.category] ?? 0) + item.amount;

    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}`;
    if (!monthlyBucket.has(key)) {
      monthlyBucket.set(key, { income: 0, expense: 0 });
    }
    const bucket = monthlyBucket.get(key)!;
    if (item.type === 'income') {
      bucket.income += item.amount;
    } else {
      bucket.expense += item.amount;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpense;

  summary.byMonth = Array.from(monthlyBucket.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([key, value]) => {
      const [year, month] = key.split('-');
      return {
        monthLabel: `${month}/${year}`,
        income: value.income,
        expense: value.expense,
      };
    })
    .slice(-6);

  return summary;
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  stats: {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    byCategory: {},
    byMonth: [],
  },

  loadTransactions: async () => {
    set({ loading: true });
    try {
      const items = await fetchTransactions();
      const stats = computeStats(items);
      set({ transactions: items, stats, loading: false });
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({ loading: false });
    }
  },

  addTransaction: async (input: TransactionInput) => {
    const created = await insertTransaction(input);
    const transactions = [created, ...get().transactions];
    const stats = computeStats(transactions);
    set({ transactions, stats });
  },

  removeTransaction: async (id: number) => {
    await deleteTransaction(id);
    const transactions = get().transactions.filter(item => item.id !== id);
    const stats = computeStats(transactions);
    set({ transactions, stats });
  },

  editTransaction: async (id: number, updates: Partial<TransactionInput>) => {
    const updated = await updateTransaction(id, updates);
    if (updated) {
      const transactions = get().transactions.map(item =>
        item.id === id ? updated : item,
      );
      const stats = computeStats(transactions);
      set({ transactions, stats });
    }
    return updated;
  },

  refresh: async () => {
    await get().loadTransactions();
  },
}));
