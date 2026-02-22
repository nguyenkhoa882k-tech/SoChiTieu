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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatCurrency } from '@/utils/format';
import LinearGradient from 'react-native-linear-gradient';

type RouteParams = {
  CategoryDetail: {
    categoryId: string;
    categoryLabel: string;
    categoryColor: string;
    type: 'expense' | 'income';
  };
};

export function CategoryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CategoryDetail'>>();
  const { transactions } = useTransactionStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { categoryId, categoryLabel, categoryColor, type } = route.params;

  // Get data by month for the selected year
  const monthlyData = useMemo(() => {
    const data: Array<{
      month: number;
      amount: number;
      count: number;
    }> = [];

    for (let m = 0; m < 12; m++) {
      const monthTx = transactions.filter(tx => {
        const date = new Date(tx.date);
        return (
          tx.category === categoryId &&
          tx.type === type &&
          date.getMonth() === m &&
          date.getFullYear() === selectedYear
        );
      });

      const amount = monthTx.reduce((sum, tx) => sum + tx.amount, 0);
      data.push({ month: m, amount, count: monthTx.length });
    }

    return data;
  }, [transactions, categoryId, type, selectedYear]);

  const totalAmount = monthlyData.reduce((sum, d) => sum + d.amount, 0);
  const totalCount = monthlyData.reduce((sum, d) => sum + d.count, 0);
  const maxValue = Math.max(...monthlyData.map(d => d.amount), 1);

  const monthNames = [
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
    'T9',
    'T10',
    'T11',
    'T12',
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
        <Text style={styles.headerTitle}>{categoryLabel}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Year Selector */}
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

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Tổng {type === 'expense' ? 'chi' : 'thu'}
              </Text>
              <Text
                style={[
                  styles.totalText,
                  { color: type === 'expense' ? '#EC4899' : '#10B981' },
                ]}
              >
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Số giao dịch</Text>
              <Text style={styles.totalText}>{totalCount}</Text>
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
              const hasData = data.amount > 0;
              if (!hasData) return null;

              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max((data.amount / maxValue) * 100, 2),
                          backgroundColor: categoryColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthLabel}>
                    {monthNames[data.month]}
                  </Text>
                  <Text
                    style={[
                      styles.amountText,
                      { color: type === 'expense' ? '#EC4899' : '#10B981' },
                    ]}
                  >
                    {formatCurrency(data.amount).replace(' ₫', '')}
                  </Text>
                  <Text style={styles.countText}>{data.count} GD</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Monthly Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết theo tháng</Text>

          <View style={styles.monthList}>
            {monthlyData.map((data, index) => {
              if (data.amount === 0) return null;

              return (
                <View key={index} style={styles.monthRow}>
                  <View style={styles.monthInfo}>
                    <Text style={styles.monthName}>Tháng {data.month + 1}</Text>
                    <Text style={styles.countLabel}>
                      {data.count} giao dịch
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.monthAmount,
                      { color: type === 'expense' ? '#EC4899' : '#10B981' },
                    ]}
                  >
                    {formatCurrency(data.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
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
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  chartContainer: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 10,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 4,
    minWidth: 50,
  },
  barContainer: {
    height: 100,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
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
  amountText: {
    fontSize: 9,
    fontWeight: '600',
  },
  countText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  monthList: {
    gap: 0,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthInfo: {
    gap: 2,
  },
  monthName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  countLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  monthAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
