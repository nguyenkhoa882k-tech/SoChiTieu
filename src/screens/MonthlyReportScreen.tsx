import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { AppHeader } from '@/components/AppHeader';

const screenWidth = Dimensions.get('window').width;

type TabType = 'expense' | 'income' | 'total';

export function MonthlyReportScreen() {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);
  const { transactions } = useTransactionStore();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('expense');

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

  // Group transactions by day
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data: Array<{
      day: number;
      income: number;
      expense: number;
      balance: number;
    }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = filteredTransactions.filter(tx => {
        const date = new Date(tx.date);
        return date.getDate() === day;
      });

      const income = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expense = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      data.push({ day, income, expense, balance: income - expense });
    }

    return data;
  }, [filteredTransactions, selectedMonth, selectedYear]);

  // Calculate max value for chart scaling
  const maxValue = useMemo(() => {
    if (activeTab === 'expense') {
      return Math.max(...dailyData.map(d => d.expense), 1);
    } else if (activeTab === 'income') {
      return Math.max(...dailyData.map(d => d.income), 1);
    } else {
      return Math.max(...dailyData.map(d => Math.max(d.income, d.expense)), 1);
    }
  }, [dailyData, activeTab]);

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
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: palette.card }]}
        >
          <Feather name="arrow-left" size={24} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>
          Báo cáo tháng
        </Text>
        <View style={{ width: 40 }} />
      </View>
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'expense' && {
                backgroundColor: palette.danger,
              },
              { borderColor: palette.border },
            ]}
            onPress={() => setActiveTab('expense')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'expense' ? '#fff' : palette.text },
              ]}
            >
              Chi tiêu
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'income' && {
                backgroundColor: palette.success,
              },
              { borderColor: palette.border },
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'income' ? '#fff' : palette.text },
              ]}
            >
              Thu nhập
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'total' && {
                backgroundColor: palette.primary,
              },
              { borderColor: palette.border },
            ]}
            onPress={() => setActiveTab('total')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'total' ? '#fff' : palette.text },
              ]}
            >
              Tổng
            </Text>
          </Pressable>
        </View>

        {/* Summary Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                Thu nhập
              </Text>
              <Text style={[styles.incomeText, { color: palette.success }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                Chi tiêu
              </Text>
              <Text style={[styles.expenseText, { color: palette.danger }]}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>Số dư</Text>
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

        {/* Chart */}
        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: palette.text }]}>
            Biểu đồ theo ngày
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartContainer}
          >
            {dailyData.map(data => {
              const hasData =
                activeTab === 'expense'
                  ? data.expense > 0
                  : activeTab === 'income'
                  ? data.income > 0
                  : data.income > 0 || data.expense > 0;

              if (!hasData) return null;

              return (
                <View key={data.day} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    {activeTab === 'total' ? (
                      <>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(
                                (data.income / maxValue) * 150,
                                2,
                              ),
                              backgroundColor: palette.success,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(
                                (data.expense / maxValue) * 150,
                                2,
                              ),
                              backgroundColor: palette.danger,
                              marginLeft: 4,
                            },
                          ]}
                        />
                      </>
                    ) : (
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(
                              ((activeTab === 'expense'
                                ? data.expense
                                : data.income) /
                                maxValue) *
                                150,
                              2,
                            ),
                            backgroundColor:
                              activeTab === 'expense'
                                ? palette.danger
                                : palette.success,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={[styles.dayLabel, { color: palette.text }]}>
                    {data.day}
                  </Text>
                  {activeTab === 'total' && (
                    <View style={styles.amountContainer}>
                      <Text
                        style={[styles.amountText, { color: palette.success }]}
                      >
                        {data.income > 0
                          ? formatCurrency(data.income).replace(' ₫', '')
                          : ''}
                      </Text>
                      <Text
                        style={[styles.amountText, { color: palette.danger }]}
                      >
                        {data.expense > 0
                          ? formatCurrency(data.expense).replace(' ₫', '')
                          : ''}
                      </Text>
                    </View>
                  )}
                  {activeTab !== 'total' && (
                    <Text
                      style={[
                        styles.amountText,
                        {
                          color:
                            activeTab === 'expense'
                              ? palette.danger
                              : palette.success,
                        },
                      ]}
                    >
                      {formatCurrency(
                        activeTab === 'expense' ? data.expense : data.income,
                      ).replace(' ₫', '')}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {activeTab === 'total' && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: palette.success },
                  ]}
                />
                <Text style={[styles.legendText, { color: palette.text }]}>
                  Thu nhập
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: palette.danger },
                  ]}
                />
                <Text style={[styles.legendText, { color: palette.text }]}>
                  Chi tiêu
                </Text>
              </View>
            </View>
          )}
        </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '700',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 12,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 8,
    minWidth: 50,
  },
  barContainer: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 6,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    gap: 2,
  },
  amountText: {
    fontSize: 10,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
