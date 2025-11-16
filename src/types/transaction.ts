export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string
  note?: string;
  wallet?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  wallet?: string;
  tags?: string[];
}

export interface CategoryMeta {
  id: string;
  label: string;
  type: TransactionType | 'common';
  icon: string;
  color: string;
  description?: string;
}
