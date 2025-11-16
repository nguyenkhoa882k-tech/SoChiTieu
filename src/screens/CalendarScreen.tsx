import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import { useTransactions } from '@/context/TransactionContext';
import { useThemePalette } from '@/theme/ThemeProvider';
import { formatCurrency, formatDateLabel } from '@/utils/format';
import { Transaction } from '@/types/transaction';
import { TransactionList } from '@/components/TransactionList';
import { AdBanner } from '@/components/AdBanner';

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
}

export function CalendarScreen() {
  const { palette } = useThemePalette();
  const { transactions } = useTransactions();
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const monthlyTransactions = useMemo(() => {
    const key = getMonthKey(monthAnchor);
    return transactions.filter(
      tx => tx.date.slice(0, 7) === key,
    );
  }, [transactions, monthAnchor]);

  const dailyMap = useMemo(() => {
    const map: Record<
      string,
      { income: number; expense: number; items: Transaction[] }
    > = {};
    monthlyTransactions.forEach(tx => {
      const dateKey = tx.date.slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = { income: 0, expense: 0, items: [] };
      }
      map[dateKey].items.push(tx);
      if (tx.type === 'income') {
        map[dateKey].income += tx.amount;
      } else {
        map[dateKey].expense += tx.amount;
      }
    });
    return map;
  }, [monthlyTransactions]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.entries(dailyMap).forEach(([dateKey, stats]) => {
      marks[dateKey] = {
        dots: [
          stats.income
            ? { color: palette.success, key: `${dateKey}-inc` }
            : null,
          stats.expense
            ? { color: palette.danger, key: `${dateKey}-exp` }
            : null,
        ].filter(Boolean),
        selected: dateKey === selectedDate,
        selectedColor: palette.accent,
        selectedTextColor: '#fff',
      };
    });
    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: palette.accent,
        selectedTextColor: '#fff',
      };
    }
    return marks;
  }, [dailyMap, palette, selectedDate]);

  const selectedItems = dailyMap[selectedDate]?.items ?? [];

  const totalIncome = monthlyTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = monthlyTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const changeMonth = (direction: 'prev' | 'next') => {
    setMonthAnchor(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return next;
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.monthHeader}>
        <Pressable
          style={[styles.monthButton, { borderColor: palette.border }]}
          onPress={() => changeMonth('prev')}
        >
          <Feather name="chevron-left" size={18} color={palette.text} />
        </Pressable>
        <Text style={[styles.monthTitle, { color: palette.text }]}>
          Tháng {monthAnchor.getMonth() + 1}, {monthAnchor.getFullYear()}
        </Text>
        <Pressable
          style={[styles.monthButton, { borderColor: palette.border }]}
          onPress={() => changeMonth('next')}
        >
          <Feather name="chevron-right" size={18} color={palette.text} />
        </Pressable>
      </View>

      <Calendar
        current={monthAnchor.toISOString().slice(0, 10)}
        markedDates={markedDates}
        markingType="multi-dot"
        onDayPress={(day: DateObject) => setSelectedDate(day.dateString)}
        theme={{
          calendarBackground: palette.card,
          dayTextColor: palette.text,
          monthTextColor: palette.text,
          todayTextColor: palette.secondary,
        }}
        style={styles.calendar}
      />

      <View
        style={[styles.summaryCard, { backgroundColor: palette.card, borderColor: palette.border }]}
      >
        <View style={styles.summaryColumn}>
          <Text style={[styles.summaryLabel, { color: palette.muted }]}>Thu</Text>
          <Text style={[styles.summaryValue, { color: palette.success }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryColumn}>
          <Text style={[styles.summaryLabel, { color: palette.muted }]}>Chi</Text>
          <Text style={[styles.summaryValue, { color: palette.danger }]}>
            {formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>
        {`Chi tiết ${formatDateLabel(selectedDate)}`}
      </Text>
      <TransactionList data={selectedItems} emptyLabel="Không có giao dịch trong ngày" />

      <AdBanner placement="calendar" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryColumn: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  calendar: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});
