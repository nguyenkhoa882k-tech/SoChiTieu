import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatCurrency } from '@/utils/format';
import LinearGradient from 'react-native-linear-gradient';

type TabType = 'expense' | 'income' | 'total';

export function YearlyReportScreen() {
  const navigation = useNavigation();
  const { transactions } = useTransactionStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<TabType>('expense');

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

  const maxValue = useMemo(() => {
    if (activeTab === 'expense') {
      return Math.max(...monthlyData.map(d => d.expense), 1);
    } else if (activeTab === 'income') {
      return Math.max(...monthlyData.map(d => d.income), 1);
    } else {
      return Math.max(
        ...monthlyData.map(d => Math.max(d.income, d.expense)),
        1,
      );
    }
  }, [monthlyData, activeTab]);

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
    <LinearGradient
      colors={['#1a1f2e', '#16213e', '#0f1419']}
      style={styles.screen}
    >
      <View style={styles.statusBarSpacer} />
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={20} color="#F1F5F9" />
        </Pressable>
        <Text style={styles.headerTitle}>Báo cáo năm</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.yearSelector}>
          <Pressable
            style={styles.yearButton}
            onPress={() => setSelectedYear(selectedYear - 1)}
          >
            <Feather name="chevron-left" size={20} color="#10B981" />
          </Pressable>
          <Text style={styles.yearText}>Năm {selectedYear}</Text>
          <Pressable
            style={styles.yearButton}
            onPress={() => setSelectedYear(selectedYear + 1)}
          >
            <Feather name="chevron-right" size={20} color="#10B981" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'expense' && styles.tabTextActive,
              ]}
            >
              Chi
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'income' && styles.tabActiveIncome,
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'income' && styles.tabTextActive,
              ]}
            >
              Thu
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'total' && styles.tabActiveTotal]}
            onPress={() => setActiveTab('total')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'total' && styles.tabTextActive,
              ]}
            >
              Tổng
            </Text>
          </Pressable>
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Thu nhập</Text>
              <Text style={styles.incomeText}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Chi tiêu</Text>
              <Text style={styles.expenseText}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Số dư</Text>
              <Text
                style={[
                  styles.balanceText,
                  { color: balance >= 0 ? '#10B981' : '#EC4899' },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biểu đồ theo tháng</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartContainer}
          >
            {monthlyData.map((data, index) => {
              const hasData =
                activeTab === 'expense'
                  ? data.expense > 0
                  : activeTab === 'income'
                  ? data.income > 0
                  : data.income > 0 || data.expense > 0;

              if (!hasData) return null;

              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    {activeTab === 'total' ? (
                      <>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(
                                (data.income / maxValue) * 100,
                                2,
                              ),
                              backgroundColor: '#10B981',
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(
                                (data.expense / maxValue) * 100,
                                2,
                              ),
                              backgroundColor: '#EC4899',
                              marginLeft: 3,
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
                                100,
                              2,
                            ),
                            backgroundColor:
                              activeTab === 'expense' ? '#EC4899' : '#10B981',
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={styles.monthLabel}>T{data.month + 1}</Text>
                  {activeTab === 'total' && (
                    <View style={styles.amountContainer}>
                      <Text style={styles.amountTextIncome}>
                        {data.income > 0
                          ? formatCurrency(data.income).replace(' ₫', '')
                          : ''}
                      </Text>
                      <Text style={styles.amountTextExpense}>
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
                            activeTab === 'expense' ? '#EC4899' : '#10B981',
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
                  style={[styles.legendDot, { backgroundColor: '#10B981' }]}
                />
                <Text style={styles.legendText}>Thu nhập</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#EC4899' }]}
                />
                <Text style={styles.legendText}>Chi tiêu</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 40 : 20,
  },
  glowLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#10B981',
    opacity: 0.15,
    blur: 60,
  },
  glowRight: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#EC4899',
    opacity: 0.12,
    blur: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: '#F1F5F9',
  },
  container: {
    padding: 14,
    paddingBottom: 20,
    gap: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  tab: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  tabActiveIncome: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tabActiveTotal: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  yearButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  yearText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  card: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  incomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  expenseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EC4899',
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartContainer: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 10,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 5,
    minWidth: 50,
  },
  barContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 5,
    minHeight: 2,
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  amountContainer: {
    alignItems: 'center',
    gap: 1,
  },
  amountText: {
    fontSize: 9,
    fontWeight: '500',
  },
  amountTextIncome: {
    fontSize: 9,
    fontWeight: '500',
    color: '#10B981',
  },
  amountTextExpense: {
    fontSize: 9,
    fontWeight: '500',
    color: '#EC4899',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F1F5F9',
  },
});
