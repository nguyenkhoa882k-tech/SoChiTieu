import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { pie, arc } from 'd3-shape';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { AppHeader } from '@/components/AppHeader';

const chartWidth = Dimensions.get('window').width - 70;
const radius = chartWidth / 2.5;

export function MonthlyReportScreen() {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);
  const { transactions } = useTransactionStore();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      return (
        date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const bucket: Record<string, number> = {};
    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        bucket[tx.category] = (bucket[tx.category] ?? 0) + tx.amount;
      });
    const entries = Object.entries(bucket).map(([categoryId, value]) => {
      const meta =
        CATEGORY_LIST.find(item => item.id === categoryId) ?? CATEGORY_LIST[0];
      return { categoryId, value, color: meta.color, label: meta.label };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const pieSlices = pie<{ value: number }>()
    .value(d => d.value)
    .sort(null)(expenseByCategory);
  const arcGenerator = arc<any>()
    .innerRadius(radius * 0.45)
    .outerRadius(radius);

  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <AppHeader title="Báo cáo tháng" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable
          style={[
            styles.periodSelector,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
          onPress={() => setShowMonthPicker(true)}
        >
          <Text style={[styles.periodText, { color: palette.text }]}>
            {monthNames[selectedMonth]} {selectedYear}
          </Text>
          <Feather name="calendar" size={20} color={palette.primary} />
        </Pressable>

        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: palette.text }]}>
            Tổng quan tháng
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted }}>Thu nhập</Text>
              <Text style={[styles.incomeText, { color: palette.success }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted }}>Chi tiêu</Text>
              <Text style={[styles.expenseText, { color: palette.danger }]}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted }}>Số dư</Text>
              <Text
                style={[
                  styles.balanceText,
                  { color: balance >= 0 ? palette.success : palette.danger },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>
        </View>

        {expenseByCategory.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Chi tiêu theo danh mục
            </Text>
            <View style={styles.chartWrapper}>
              <Svg width={chartWidth} height={radius * 2}>
                <G x={chartWidth / 2} y={radius}>
                  {pieSlices.map((slice, index) => (
                    <Path
                      key={index}
                      d={arcGenerator(slice) || ''}
                      fill={expenseByCategory[index].color}
                    />
                  ))}
                </G>
              </Svg>
            </View>

            <View style={styles.categoryList}>
              {expenseByCategory.map(cat => {
                const percent = ((cat.value / totalExpense) * 100).toFixed(1);
                return (
                  <View key={cat.categoryId} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[styles.dot, { backgroundColor: cat.color }]}
                      />
                      <Text
                        style={[styles.categoryLabel, { color: palette.text }]}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    <View style={styles.categoryValues}>
                      <Text
                        style={[styles.categoryAmount, { color: palette.text }]}
                      >
                        {formatCurrency(cat.value)}
                      </Text>
                      <Text style={{ color: palette.muted, fontSize: 12 }}>
                        {percent}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <MonthYearPicker
        visible={showMonthPicker}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClose={() => setShowMonthPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  incomeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  expenseText: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryLabel: {
    fontSize: 15,
  },
  categoryValues: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
});
