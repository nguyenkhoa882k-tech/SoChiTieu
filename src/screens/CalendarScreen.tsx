import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatCurrency, formatDateLabel } from '@/utils/format';
import { Transaction } from '@/types/transaction';
import { TransactionList } from '@/components/TransactionList';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { AdBanner } from '@/components/AdBanner';

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
}

export function CalendarScreen() {
  const transactions = useTransactionStore(state => state.transactions);
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const monthlyTransactions = useMemo(() => {
    const key = getMonthKey(monthAnchor);
    return transactions.filter(tx => tx.date.slice(0, 7) === key);
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
          stats.income ? { color: '#10B981', key: `${dateKey}-inc` } : null,
          stats.expense ? { color: '#EC4899', key: `${dateKey}-exp` } : null,
        ].filter(Boolean),
        selected: dateKey === selectedDate,
        selectedColor: '#10B981',
        selectedTextColor: '#fff',
      };
    });
    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: '#10B981',
        selectedTextColor: '#fff',
      };
    }
    return marks;
  }, [dailyMap, selectedDate]);

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
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1a1f2e', '#16213e', '#0f1419']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.glowLeft}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.3)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      <View style={styles.glowRight}>
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.25)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBarSpacer} />

        <View style={styles.monthHeader}>
          <Pressable
            style={styles.monthButton}
            onPress={() => changeMonth('prev')}
          >
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
              style={styles.monthButtonInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="chevron-left" size={20} color="#10B981" />
            </LinearGradient>
          </Pressable>
          <Text style={styles.monthTitle}>
            Tháng {monthAnchor.getMonth() + 1}, {monthAnchor.getFullYear()}
          </Text>
          <Pressable
            style={styles.monthButton}
            onPress={() => changeMonth('next')}
          >
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
              style={styles.monthButtonInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="chevron-right" size={20} color="#10B981" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.calendarWrapper}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.calendarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Calendar
              current={monthAnchor.toISOString().slice(0, 10)}
              markedDates={markedDates}
              markingType="multi-dot"
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              theme={{
                calendarBackground: 'transparent',
                dayTextColor: '#F1F5F9',
                monthTextColor: '#F1F5F9',
                todayTextColor: '#10B981',
                textDayFontSize: 13,
                textMonthFontSize: 14,
                textDayHeaderFontSize: 11,
                textDayFontWeight: '600',
                textMonthFontWeight: '700',
                selectedDayBackgroundColor: '#10B981',
                selectedDayTextColor: '#fff',
                arrowColor: '#10B981',
              }}
            />
          </LinearGradient>
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.summaryCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Thu</Text>
              <Text style={styles.summaryValueIncome}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Chi</Text>
              <Text style={styles.summaryValueExpense}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <AdBanner placement="calendar" />

        <Text style={styles.sectionTitle}>
          {`Chi tiết ${formatDateLabel(selectedDate)}`}
        </Text>
        <TransactionList
          data={selectedItems}
          emptyLabel="Không có giao dịch trong ngày"
          onEdit={tx => setEditingTransaction(tx)}
        />
      </ScrollView>

      <EditTransactionModal
        visible={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? 20 : 40,
  },
  glowLeft: {
    position: 'absolute',
    left: -80,
    top: 100,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowRight: {
    position: 'absolute',
    right: -80,
    top: 350,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
  },
  container: {
    padding: 12,
    paddingBottom: 100,
    gap: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.3,
  },
  monthButton: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthButtonInner: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarGradient: {
    padding: 8,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  summaryValueIncome: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  summaryValueExpense: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#EC4899',
    letterSpacing: -0.5,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.2,
  },
});
