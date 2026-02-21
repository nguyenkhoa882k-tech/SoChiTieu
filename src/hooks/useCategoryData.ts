import { useMemo } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';
import { CATEGORY_LIST } from '@/constants/categories';

export function useCategoryData(
  transactions: Transaction[],
  type: TransactionType,
) {
  return useMemo(() => {
    const bucket: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === type)
      .forEach(tx => {
        bucket[tx.category] = (bucket[tx.category] ?? 0) + tx.amount;
      });
    const entries = Object.entries(bucket).map(([categoryId, value]) => {
      const meta =
        CATEGORY_LIST.find(item => item.id === categoryId) ?? CATEGORY_LIST[0];
      return { categoryId, value, color: meta.color, label: meta.label };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [transactions, type]);
}
