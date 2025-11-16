import { CategoryMeta } from '@/types/transaction';

export const CATEGORY_LIST: CategoryMeta[] = [
  {
    id: 'salary',
    label: 'Lương',
    type: 'income',
    icon: 'dollar-sign',
    color: '#1ABC9C',
    description: 'Thu nhập cố định hàng tháng',
  },
  {
    id: 'freelance',
    label: 'Freelance',
    type: 'income',
    icon: 'briefcase',
    color: '#2ECC71',
    description: 'Dự án phụ và hoa hồng',
  },
  {
    id: 'gift',
    label: 'Quà tặng',
    type: 'income',
    icon: 'gift',
    color: '#E67E22',
  },
  {
    id: 'food',
    label: 'Ăn uống',
    type: 'expense',
    icon: 'coffee',
    color: '#E74C3C',
  },
  {
    id: 'transport',
    label: 'Đi lại',
    type: 'expense',
    icon: 'navigation',
    color: '#9B59B6',
  },
  {
    id: 'home',
    label: 'Nhà cửa',
    type: 'expense',
    icon: 'home',
    color: '#3498DB',
  },
  {
    id: 'shopping',
    label: 'Mua sắm',
    type: 'expense',
    icon: 'shopping-bag',
    color: '#F39C12',
  },
  {
    id: 'health',
    label: 'Sức khỏe',
    type: 'expense',
    icon: 'activity',
    color: '#C0392B',
  },
  {
    id: 'education',
    label: 'Giáo dục',
    type: 'expense',
    icon: 'book',
    color: '#8E44AD',
  },
  {
    id: 'travel',
    label: 'Du lịch',
    type: 'expense',
    icon: 'map-pin',
    color: '#16A085',
  },
  {
    id: 'investment',
    label: 'Đầu tư',
    type: 'income',
    icon: 'trending-up',
    color: '#27AE60',
  },
  {
    id: 'utilities',
    label: 'Tiện ích',
    type: 'expense',
    icon: 'zap',
    color: '#D35400',
  },
  {
    id: 'others',
    label: 'Khác',
    type: 'common',
    icon: 'grid',
    color: '#7F8C8D',
  },
];

export const DEFAULT_WALLETS = [
  'Ví tiền mặt',
  'Thẻ tín dụng',
  'Tài khoản ngân hàng',
];
