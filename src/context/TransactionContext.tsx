import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Transaction, TransactionInput } from '@/types/transaction';
import {
  deleteTransaction,
  fetchTransactions,
  insertTransaction,
  seedDemoDataIfNeeded,
  updateTransaction,
} from '@/data/database';

interface MonthlyStatItem {
  monthLabel: string;
  income: number;
  expense: number;
}

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (input: TransactionInput) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  editTransaction: (
    id: number,
    updates: Partial<TransactionInput>,
  ) => Promise<Transaction | null>;
  refresh: () => Promise<void>;
  stats: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    byCategory: Record<string, number>;
    byMonth: MonthlyStatItem[];
  };
}

const TransactionContext = createContext<TransactionContextValue | undefined>(
  undefined,
);

export function TransactionProvider({ children }: PropsWithChildren) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    await seedDemoDataIfNeeded();
    const items = await fetchTransactions();
    setTransactions(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    hydrate().catch(() => setLoading(false));
  }, [hydrate]);

  const addTransaction = useCallback(async (input: TransactionInput) => {
    const created = await insertTransaction(input);
    setTransactions(prev => [created, ...prev]);
  }, []);

  const removeTransaction = useCallback(async (id: number) => {
    await deleteTransaction(id);
    setTransactions(prev => prev.filter(item => item.id !== id));
  }, []);

  const editTransaction = useCallback(
    async (id: number, updates: Partial<TransactionInput>) => {
      const updated = await updateTransaction(id, updates);
      if (updated) {
        setTransactions(prev =>
          prev.map(item => (item.id === id ? updated : item)),
        );
      }
      return updated;
    },
    [],
  );

  const stats = useMemo(() => {
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      byCategory: {} as Record<string, number>,
      byMonth: [] as MonthlyStatItem[],
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
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
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
          monthLabel: `${month.padStart(2, '0')}/${year}`,
          income: value.income,
          expense: value.expense,
        };
      })
      .slice(-6);

    return summary;
  }, [transactions]);

  const value: TransactionContextValue = {
    transactions,
    loading,
    addTransaction,
    removeTransaction,
    editTransaction,
    refresh: hydrate,
    stats,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransactions must be used inside TransactionProvider');
  }
  return ctx;
}
