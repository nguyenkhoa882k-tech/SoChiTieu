import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryMeta, TransactionType } from '@/types/transaction';

interface CategoryState {
  customCategories: CategoryMeta[];
  addCustomCategory: (category: Omit<CategoryMeta, 'id'>) => void;
  removeCustomCategory: (id: string) => void;
  updateCustomCategory: (id: string, category: Partial<CategoryMeta>) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    set => ({
      customCategories: [],

      addCustomCategory: category =>
        set(state => ({
          customCategories: [
            ...state.customCategories,
            {
              ...category,
              id: `custom_${Date.now()}`,
            },
          ],
        })),

      removeCustomCategory: id =>
        set(state => ({
          customCategories: state.customCategories.filter(c => c.id !== id),
        })),

      updateCustomCategory: (id, updates) =>
        set(state => ({
          customCategories: state.customCategories.map(c =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
