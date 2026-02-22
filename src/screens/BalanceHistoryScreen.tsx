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
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import LinearGradient from 'react-native-linear-gradient';

type ViewMode = 'month' | 'year' | 'lifetime';

export function BalanceHistoryScreen() {
  const navigation = useNavigation();
  const { transactions } = useTransactionStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const filteredTransactions = useFilteredTransactions(
    transactions,
    viewMode,
    selectedMonth,
    selectedYear,
  );

  const balanceHistory = useMemo(() => {
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let runningBalance = 0;
    const history: Array<{
      date: string;
      amount: number;
      type: 'income' | 'expense';
      balance: number;
      category: string;
      note: string;
    }> = [];

    sorted.forEach(tx => {
      if (tx.type === 'income') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }
      history.push({
        date: tx.date,
        amount: tx.amount,
        type: tx.type,
        balance: runningBalance,
        category: tx.category,
        note: tx.note,
      });
    });

    return history.reverse(); // Most recent first
  }, [filteredTransactions]);

  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const tabs = [
    { key: 'month', label: 'Tháng' },
    { key: 'year', label: 'Năm' },
    { key: 'lifetime', label: 'Toàn bộ' },
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
        <Text style={styles.headerTitle}>Lịch sử số dư</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tab, viewMode === tab.key && styles.tabActive]}
              onPress={() => setViewMode(tab.key as ViewMode)}
            >
              <Text
                style={[
                  styles.tabText,
                  viewMode === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {viewMode === 'month' && (
          <Pressable
            style={styles.periodSelector}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={styles.periodText}>
              Tháng {selectedMonth + 1}/{selectedYear}
            </Text>
            <Feather name="calendar" size={16} color="#10B981" />
          </Pressable>
        )}

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
                  {
                    color:
                      totalIncome - totalExpense >= 0 ? '#10B981' : '#EC4899',
                  },
                ]}
              >
                {formatCurrency(totalIncome - totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lịch sử giao dịch</Text>

          {balanceHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>Chưa có giao dịch</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {balanceHistory.map((item, index) => {
                const categoryInfo =
                  CATEGORY_LIST.find(cat => cat.id === item.category) ??
                  CATEGORY_LIST[0];
                return (
                  <View key={index} style={styles.historyRow}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyHeader}>
                        <View
                          style={[
                            styles.iconContainer,
                            {
                              backgroundColor:
                                item.type === 'income'
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : 'rgba(236, 72, 153, 0.2)',
                            },
                          ]}
                        >
                          <Feather
                            name={
                              item.type === 'income'
                                ? 'arrow-down-left'
                                : 'arrow-up-right'
                            }
                            size={14}
                            color={
                              item.type === 'income' ? '#10B981' : '#EC4899'
                            }
                          />
                        </View>
                        <View style={styles.headerTextContainer}>
                          <Text style={styles.categoryText}>
                            {categoryInfo.label}
                          </Text>
                          <Text style={styles.historyDate}>
                            {formatDate(item.date)}
                          </Text>
                        </View>
                      </View>
                      {item.note && (
                        <Text style={styles.noteText} numberOfLines={2}>
                          {item.note}
                        </Text>
                      )}
                    </View>
                    <View style={styles.historyRight}>
                      <Text
                        style={[
                          styles.historyAmount,
                          {
                            color:
                              item.type === 'income' ? '#10B981' : '#EC4899',
                          },
                        ]}
                      >
                        {item.type === 'income' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </Text>
                      <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Số dư:</Text>
                        <Text
                          style={[
                            styles.historyBalance,
                            {
                              color: item.balance >= 0 ? '#10B981' : '#EC4899',
                            },
                          ]}
                        >
                          {formatCurrency(item.balance)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <MonthYearPicker
        visible={showMonthPicker}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
        }}
        onClose={() => setShowMonthPicker(false)}
      />
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
    color: '#F1F5F9',
    flex: 1,
    textAlign: 'center',
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
  historyList: {
    gap: 0,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  historyLeft: {
    flex: 1,
    gap: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    gap: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  historyDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  noteText: {
    fontSize: 11,
    marginLeft: 36,
    color: '#94A3B8',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 3,
    justifyContent: 'center',
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  balanceLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  historyBalance: {
    fontSize: 11,
    fontWeight: '600',
  },
});
