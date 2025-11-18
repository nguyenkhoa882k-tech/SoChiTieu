import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Transaction } from '@/types/transaction';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency, formatDateLabel } from '@/utils/format';

interface TransactionListProps {
  data: Transaction[];
  emptyLabel?: string;
}

export function TransactionList({ data, emptyLabel }: TransactionListProps) {
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
        <Feather name="inbox" size={24} color={palette.muted} />
        <Text style={[styles.emptyText, { color: palette.muted }]}>
          {emptyLabel ?? 'Chưa có dữ liệu'}
        </Text>
      </View>
    );
  }

  return (
    <>
      {grouped.map(group => (
        <View key={group.date} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.muted }]}> 
            {formatDateLabel(group.date)}
          </Text>
          {group.items.map(tx => {
            const categoryMeta =
              CATEGORY_LIST.find(category => category.id === tx.category) ??
              CATEGORY_LIST.find(category => category.id === 'others');
            const isIncome = tx.type === 'income';
            return (
              <View
                style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
                key={tx.id}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor: `${categoryMeta?.color ?? palette.accent}33`,
                    },
                  ]}
                >
                  <Feather
                    name={(categoryMeta?.icon ?? 'grid') as any}
                    color={categoryMeta?.color ?? palette.accent}
                    size={18}
                  />
                </View>
                <View style={styles.flexGrow}>
                  <Text style={[styles.rowTitle, { color: palette.text }]}>
                    {categoryMeta?.label ?? tx.category}
                  </Text>
                  {tx.note ? (
                    <Text style={[styles.note, { color: palette.muted }]}>
                      {tx.note}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: isIncome ? palette.success : palette.danger },
                  ]}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                </Text>
              </View>
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    gap: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  flexGrow: {
    flex: 1,
  },
  amount: {
    fontWeight: '600',
  },
});
