import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';

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
  const palette = useThemeStore(state => state.palette);
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
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: palette.card }]}
        >
          <Feather name="arrow-left" size={24} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>
          {categoryLabel}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Year Selector */}
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
                Tổng {type === 'expense' ? 'chi' : 'thu'}
              </Text>
              <Text
                style={[
                  styles.totalText,
                  {
                    color:
                      type === 'expense' ? palette.danger : palette.success,
                  },
                ]}
              >
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                Số giao dịch
              </Text>
              <Text style={[styles.totalText, { color: palette.text }]}>
                {totalCount}
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
            Biểu đồ theo tháng
          </Text>

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
                          height: Math.max((data.amount / maxValue) * 150, 2),
                          backgroundColor: categoryColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.monthLabel, { color: palette.text }]}>
                    {monthNames[data.month]}
                  </Text>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color:
                          type === 'expense' ? palette.danger : palette.success,
                      },
                    ]}
                  >
                    {formatCurrency(data.amount).replace(' ₫', '')}
                  </Text>
                  <Text style={[styles.countText, { color: palette.muted }]}>
                    {data.count} GD
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Monthly Details */}
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
              if (data.amount === 0) return null;

              return (
                <View
                  key={index}
                  style={[
                    styles.monthRow,
                    { borderBottomColor: palette.border },
                  ]}
                >
                  <View style={styles.monthInfo}>
                    <Text style={[styles.monthName, { color: palette.text }]}>
                      Tháng {data.month + 1}
                    </Text>
                    <Text style={[styles.countLabel, { color: palette.muted }]}>
                      {data.count} giao dịch
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.monthAmount,
                      {
                        color:
                          type === 'expense' ? palette.danger : palette.success,
                      },
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
    gap: 6,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 16,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
  },
  barContainer: {
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 6,
    minHeight: 2,
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  countText: {
    fontSize: 9,
  },
  monthList: {
    gap: 0,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  monthInfo: {
    gap: 4,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
  },
  countLabel: {
    fontSize: 13,
  },
  monthAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
