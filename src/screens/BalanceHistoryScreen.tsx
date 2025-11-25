import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';

type ViewMode = 'month' | 'year' | 'lifetime';

export function BalanceHistoryScreen() {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);
  const { transactions } = useTransactionStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      if (viewMode === 'month') {
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }
      if (viewMode === 'year') {
        return date.getFullYear() === selectedYear;
      }
      return true; // lifetime
    });
  }, [transactions, viewMode, selectedMonth, selectedYear]);

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

  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;

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

  const getPeriodLabel = () => {
    if (viewMode === 'month') {
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    }
    if (viewMode === 'year') {
      return `Năm ${selectedYear}`;
    }
    return 'Toàn bộ';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
          Lịch sử số dư
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.modeSelector}>
          {(['month', 'year', 'lifetime'] as ViewMode[]).map(mode => (
            <Pressable
              key={mode}
              style={[
                styles.modeButton,
                {
                  backgroundColor:
                    viewMode === mode ? palette.primary : 'transparent',
                  borderColor: palette.border,
                },
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: viewMode === mode ? '#fff' : palette.text,
                  },
                ]}
              >
                {mode === 'month'
                  ? 'Tháng'
                  : mode === 'year'
                  ? 'Năm'
                  : 'Toàn bộ'}
              </Text>
            </Pressable>
          ))}
        </View>

        {(viewMode === 'month' || viewMode === 'year') && (
          <Pressable
            style={[
              styles.periodSelector,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            onPress={() => {
              if (viewMode === 'month') {
                setShowMonthPicker(true);
              }
            }}
          >
            <Text style={[styles.periodText, { color: palette.text }]}>
              {getPeriodLabel()}
            </Text>
            <Feather name="calendar" size={20} color={palette.primary} />
          </Pressable>
        )}

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
                  {
                    color: netBalance >= 0 ? palette.success : palette.danger,
                  },
                ]}
              >
                {formatCurrency(netBalance)}
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
            Lịch sử giao dịch
          </Text>

          {balanceHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={palette.muted} />
              <Text
                style={{
                  color: palette.muted,
                  textAlign: 'center',
                  marginTop: 12,
                }}
              >
                Chưa có giao dịch nào
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {balanceHistory.map((item, index) => {
                const categoryInfo =
                  CATEGORY_LIST.find(cat => cat.id === item.category) ??
                  CATEGORY_LIST[0];
                return (
                  <View
                    key={index}
                    style={[
                      styles.historyRow,
                      { borderBottomColor: palette.border },
                    ]}
                  >
                    <View style={styles.historyLeft}>
                      <View style={styles.historyHeader}>
                        <View
                          style={[
                            styles.iconContainer,
                            {
                              backgroundColor:
                                item.type === 'income'
                                  ? palette.success + '20'
                                  : palette.danger + '20',
                            },
                          ]}
                        >
                          <Feather
                            name={
                              item.type === 'income'
                                ? 'arrow-down-left'
                                : 'arrow-up-right'
                            }
                            size={16}
                            color={
                              item.type === 'income'
                                ? palette.success
                                : palette.danger
                            }
                          />
                        </View>
                        <View style={styles.headerTextContainer}>
                          <Text
                            style={[
                              styles.categoryText,
                              { color: palette.text },
                            ]}
                          >
                            {categoryInfo.label}
                          </Text>
                          <Text
                            style={[
                              styles.historyDate,
                              { color: palette.muted },
                            ]}
                          >
                            {formatDate(item.date)}
                          </Text>
                        </View>
                      </View>
                      {item.note && (
                        <Text
                          style={[styles.noteText, { color: palette.muted }]}
                          numberOfLines={2}
                        >
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
                              item.type === 'income'
                                ? palette.success
                                : palette.danger,
                          },
                        ]}
                      >
                        {item.type === 'income' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </Text>
                      <View style={styles.balanceContainer}>
                        <Text
                          style={[
                            styles.balanceLabel,
                            { color: palette.muted },
                          ]}
                        >
                          Số dư:
                        </Text>
                        <Text
                          style={[
                            styles.historyBalance,
                            {
                              color:
                                item.balance >= 0
                                  ? palette.success
                                  : palette.danger,
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
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  historyList: {
    gap: 0,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  historyLeft: {
    flex: 1,
    gap: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    gap: 2,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
  },
  noteText: {
    fontSize: 13,
    marginLeft: 48,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 6,
    justifyContent: 'center',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceLabel: {
    fontSize: 12,
  },
  historyBalance: {
    fontSize: 13,
    fontWeight: '600',
  },
});
