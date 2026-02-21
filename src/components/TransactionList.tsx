import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Transaction } from '@/types/transaction';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency, formatDateLabel } from '@/utils/format';

interface TransactionListProps {
  data: Transaction[];
  emptyLabel?: string;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({
  data,
  emptyLabel,
  onEdit,
}: TransactionListProps) {
  const palette = useThemeStore(state => state.palette);

  const grouped = useMemo(() => {
    const buckets: Record<string, Transaction[]> = {};
    data.forEach(item => {
      const key = item.date.slice(0, 10);
      if (!buckets[key]) {
        buckets[key] = [];
      }
      buckets[key].push(item);
    });
    return Object.entries(buckets)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({ date, items }));
  }, [data]);

  if (!grouped.length) {
    return (
      <View style={styles.emptyState}>
        <Feather name="inbox" size={24} color="#64748B" />
        <Text style={styles.emptyText}>{emptyLabel ?? 'Chưa có dữ liệu'}</Text>
      </View>
    );
  }

  return (
    <>
      {grouped.map(group => (
        <View key={group.date} style={styles.section}>
          <Text style={styles.sectionTitle}>{formatDateLabel(group.date)}</Text>
          {group.items.map(tx => {
            const categoryMeta =
              CATEGORY_LIST.find(category => category.id === tx.category) ??
              CATEGORY_LIST.find(category => category.id === 'others');
            const isIncome = tx.type === 'income';
            return (
              <Pressable
                style={styles.row}
                key={tx.id}
                onPress={() => onEdit?.(tx)}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor: `${categoryMeta?.color ?? '#818CF8'}33`,
                    },
                  ]}
                >
                  <Feather
                    name={(categoryMeta?.icon ?? 'grid') as any}
                    color={categoryMeta?.color ?? '#818CF8'}
                    size={16}
                  />
                </View>
                <View style={styles.flexGrow}>
                  <Text style={styles.rowTitle}>
                    {categoryMeta?.label ?? tx.category}
                  </Text>
                  {tx.note ? <Text style={styles.note}>{tx.note}</Text> : null}
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: isIncome ? '#10B981' : '#EC4899' },
                  ]}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  note: {
    fontSize: 11,
    marginTop: 2,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },
  flexGrow: {
    flex: 1,
  },
  amount: {
    fontWeight: '700',
    fontSize: 14,
  },
});
