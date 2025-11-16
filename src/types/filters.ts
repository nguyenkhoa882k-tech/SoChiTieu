export interface TransactionFilter {
  type: 'all' | 'income' | 'expense';
  categories: string[];
  startDate?: string; // yyyy-mm-dd
  endDate?: string; // yyyy-mm-dd
}

export const defaultFilter: TransactionFilter = {
  type: 'all',
  categories: [],
};
