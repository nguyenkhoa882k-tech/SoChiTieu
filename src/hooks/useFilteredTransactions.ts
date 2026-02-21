import { useMemo } from 'react';
import { Transaction } from '@/types/transaction';

type ViewMode = 'month' | 'year' | 'lifetime';

export function useFilteredTransactions(
  transactions: Transaction[],
  viewMode: ViewMode,
  selectedMonth: number,
  selectedYear: number,
) {
  return useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      if (viewMode === 'month') {
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }
      if (viewMode === 'year') {
        return date.getFullYear() === selectedYear;
      }
      return true;
    });
  }, [transactions, viewMode, selectedMonth, selectedYear]);
}
