import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SummaryCard } from '@/components/SummaryCard';
import { TabSelector } from '@/components/TabSelector';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';

type ViewMode = 'month' | 'year' | 'lifetime';

export function BalanceHistoryScreen() {
  const palette = useThemeStore(state => state.palette);
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
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScreenHeader title="Lịch sử số dư" />
      <ScrollView contentContainerStyle={styles.container}>
        <TabSelector
          tabs={tabs}
          activeTab={viewMode}
          onTabChange={mode => setViewMode(mode as ViewMode)}
        />

        {viewMode === 'month' && (
          <Pressable
            style={[
              styles.periodSelector,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={[styles.periodText, { color: palette.text }]}>
              Tháng {selectedMonth + 1}/{selectedYear}
            </Text>
            <Feather name="calendar" size={16} color={palette.primary} />
          </Pressable>
        )}

        <SummaryCard income={totalIncome} expense={totalExpense} />

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
              <Feather name="inbox" size={40} color={palette.muted} />
              <Text
                style={{
                  color: palette.muted,
                  textAlign: 'center',
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                Chưa có giao dịch
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
                            size={14}
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
        onSelect={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
        }}
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
    padding: 12,
    paddingBottom: 20,
    gap: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  historyList: {
    gap: 0,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
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
  },
  historyDate: {
    fontSize: 10,
  },
  noteText: {
    fontSize: 11,
    marginLeft: 36,
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
  },
  historyBalance: {
    fontSize: 11,
    fontWeight: '600',
  },
});
