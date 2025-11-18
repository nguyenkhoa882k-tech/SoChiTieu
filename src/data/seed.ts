import { TransactionInput } from '@/types/transaction';

const now = Date.now();
const daysAgo = (days: number) =>
  new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const seedTransactions: TransactionInput[] = [];
