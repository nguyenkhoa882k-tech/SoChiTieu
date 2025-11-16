import { TransactionInput } from '@/types/transaction';

const now = Date.now();
const daysAgo = (days: number) =>
  new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const seedTransactions: TransactionInput[] = [
  {
    amount: 25000000,
    type: 'income',
    category: 'salary',
    date: daysAgo(2),
    note: 'Lương tháng 10',
    wallet: 'Tài khoản ngân hàng',
  },
  {
    amount: 3500000,
    type: 'income',
    category: 'freelance',
    date: daysAgo(6),
    note: 'Thiết kế landing page',
    wallet: 'Tài khoản ngân hàng',
  },
  {
    amount: 750000,
    type: 'expense',
    category: 'food',
    date: daysAgo(1),
    note: 'Đi ăn cuối tuần',
    wallet: 'Thẻ tín dụng',
  },
  {
    amount: 1200000,
    type: 'expense',
    category: 'transport',
    date: daysAgo(3),
    note: 'Đổ xăng và gửi xe',
  },
  {
    amount: 4800000,
    type: 'expense',
    category: 'home',
    date: daysAgo(5),
    note: 'Đóng tiền nhà',
  },
  {
    amount: 2200000,
    type: 'expense',
    category: 'shopping',
    date: daysAgo(8),
    note: 'Mua sắm siêu thị',
  },
  {
    amount: 1600000,
    type: 'expense',
    category: 'education',
    date: daysAgo(10),
    note: 'Khóa học online',
  },
  {
    amount: 5400000,
    type: 'income',
    category: 'investment',
    date: daysAgo(12),
    note: 'Lãi chứng chỉ quỹ',
  },
];
