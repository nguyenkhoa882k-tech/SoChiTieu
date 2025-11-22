import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { formatCurrency } from '@/utils/format';
import { AppHeader } from '@/components/AppHeader';

export function YearlyReportScreen() {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);
  const { transactions } = useTransactionStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      return date.getFullYear() === selectedYear;
    });
  }, [transactions, selectedYear]);

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

  const monthlyData = useMemo(() => {
    const data: Array<{
      month: number;
      income: number;
      expense: number;
      balance: number;
    }> = [];

    for (let m = 0; m < 12; m++) {
      const monthTx = filteredTransactions.filter(
        tx => new Date(tx.date).getMonth() === m,
      );
      const income = monthTx
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expense = monthTx
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      data.push({ month: m, income, expense, balance: income - expense });
    }

    return data;
  }, [filteredTransactions]);

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
      <AppHeader title="Báo cáo năm" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.yearSelector}>
          <Pressable
            style={[styles.yearButton, { borderColor: palette.border }]}
            onPress={() => setSelectedYear(selectedYear - 1)}
          >
            <Feather name="chevron-left" size={24} color={palette.primary} />
          </Pressable>
          <Text style={[styles.yearText, { color: palette.text }]}>
            Năm {selectedYear}
          </Text>
          <Pressable
            style={[styles.yearButton, { borderColor: palette.border }]}
            onPress={() => setSelectedYear(selectedYear + 1)}
          >
            <Feather name="chevron-right" size={24} color={palette.primary} />
          </Pressable>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: palette.text }]}>
            Tổng quan năm
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

        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: palette.text }]}>
            Chi tiết theo tháng
          </Text>

          <View style={styles.monthList}>
            {monthlyData.map((data, index) => {
              const hasData = data.income > 0 || data.expense > 0;
              if (!hasData) {
                return null;
              }
              return (
                <View
                  key={index}
                  style={[
                    styles.monthRow,
                    { borderBottomColor: palette.border },
                  ]}
                >
                  <Text style={[styles.monthName, { color: palette.text }]}>
                    {monthNames[data.month]}
                  </Text>
                  <View style={styles.monthStats}>
                    <View style={styles.monthStat}>
                      <Text style={{ color: palette.muted, fontSize: 12 }}>
                        Thu
                      </Text>
                      <Text
                        style={[styles.statValue, { color: palette.success }]}
                      >
                        {formatCurrency(data.income)}
                      </Text>
                    </View>
                    <View style={styles.monthStat}>
                      <Text style={{ color: palette.muted, fontSize: 12 }}>
                        Chi
                      </Text>
                      <Text
                        style={[styles.statValue, { color: palette.danger }]}
                      >
                        {formatCurrency(data.expense)}
                      </Text>
                    </View>
                    <View style={styles.monthStat}>
                      <Text style={{ color: palette.muted, fontSize: 12 }}>
                        Dư
                      </Text>
                      <Text
                        style={[
                          styles.statValue,
                          {
                            color:
                              data.balance >= 0
                                ? palette.success
                                : palette.danger,
                          },
                        ]}
                      >
                        {formatCurrency(data.balance)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  yearButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
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
  monthList: {
    gap: 0,
  },
  monthRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  monthStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
