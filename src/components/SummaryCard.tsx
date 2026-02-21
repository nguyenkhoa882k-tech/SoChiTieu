import React from 'react';
import { StyleSheet, Text, View } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { formatCurrency } from '@/utils/format';

interface SummaryCardProps {
  income: number;
  expense: number;
  showBalance?: boolean;
}

export function SummaryCard({
  income,
  expense,
  showBalance = true,
}: SummaryCardProps) {
  const palette = useThemeStore(state => state.palette);
  const balance = income - expense;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={[styles.label, { color: palette.muted }]}>Thu nhập</Text>
          <Text style={[styles.value, { color: palette.success }]}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={[styles.label, { color: palette.muted }]}>Chi tiêu</Text>
          <Text style={[styles.value, { color: palette.danger }]}>
            {formatCurrency(expense)}
          </Text>
        </View>
        {showBalance && (
          <View style={styles.item}>
            <Text style={[styles.label, { color: palette.muted }]}>Số dư</Text>
            <Text
              style={[
                styles.value,
                { color: balance >= 0 ? palette.success : palette.danger },
              ]}
            >
              {formatCurrency(balance)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
});
