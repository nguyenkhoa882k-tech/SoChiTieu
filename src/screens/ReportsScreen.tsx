import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { pie, arc } from 'd3-shape';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTransactionStore } from '@/stores/transactionStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { AdBanner } from '@/components/AdBanner';
import { MonthYearPicker } from '@/components/MonthYearPicker';

const screenWidth = Dimensions.get('window').width;
const chartSize = Math.min(screenWidth * 0.4, 130);
const radius = chartSize / 2;

type RangeMode = 'month' | 'year' | 'lifetime';

export function ReportsScreen() {
  const { transactions, stats } = useTransactionStore();
  const [viewMode, setViewMode] = useState<RangeMode>('month');
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
      return true;
    });
  }, [transactions, viewMode, selectedMonth, selectedYear]);

  const expenseByCategory = useMemo(() => {
    const bucket: Record<string, number> = {};
    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        bucket[tx.category] = (bucket[tx.category] ?? 0) + tx.amount;
      });
    const entries = Object.entries(bucket).map(([categoryId, value]) => {
      const meta =
        CATEGORY_LIST.find(item => item.id === categoryId) ?? CATEGORY_LIST[0];
      return { categoryId, value, color: meta.color, label: meta.label };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const incomeByCategory = useMemo(() => {
    const bucket: Record<string, number> = {};
    filteredTransactions
      .filter(tx => tx.type === 'income')
      .forEach(tx => {
        bucket[tx.category] = (bucket[tx.category] ?? 0) + tx.amount;
      });
    const entries = Object.entries(bucket).map(([categoryId, value]) => {
      const meta =
        CATEGORY_LIST.find(item => item.id === categoryId) ?? CATEGORY_LIST[0];
      return { categoryId, value, color: meta.color, label: meta.label };
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const pieSlices = pie<{ value: number }>()
    .value(d => d.value)
    .sort(null)(expenseByCategory);
  const arcGenerator = arc<any>()
    .innerRadius(radius * 0.55)
    .outerRadius(radius);

  const incomePieSlices = pie<{ value: number }>()
    .value(d => d.value)
    .sort(null)(incomeByCategory);

  const topExpenses = expenseByCategory.slice(0, 3);
  const topIncomes = incomeByCategory.slice(0, 3);

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

        <View style={styles.filterRow}>
          {(
            [
              { key: 'month', label: 'Tháng', icon: 'calendar' },
              { key: 'year', label: 'Năm', icon: 'bar-chart-2' },
              { key: 'lifetime', label: 'Tất cả', icon: 'infinity' },
            ] as const
          ).map(item => {
            const active = viewMode === item.key;
            return (
              <Pressable
                key={item.key}
                style={styles.filterChip}
                onPress={() => setViewMode(item.key)}
              >
                <LinearGradient
                  colors={
                    active
                      ? ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.2)']
                      : [
                          'rgba(255, 255, 255, 0.05)',
                          'rgba(255, 255, 255, 0.02)',
                        ]
                  }
                  style={styles.filterChipInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather
                    name={item.icon as any}
                    size={14}
                    color={active ? '#10B981' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: active ? '#10B981' : '#94A3B8' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {viewMode === 'month' && (
          <View style={styles.monthPicker}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.08)',
                'rgba(255, 255, 255, 0.03)',
              ]}
              style={styles.monthPickerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Pressable
                style={styles.monthArrow}
                onPress={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
              >
                <Feather name="chevron-left" size={20} color="#10B981" />
              </Pressable>
              <Pressable
                style={styles.monthDisplay}
                onPress={() => setShowMonthPicker(true)}
              >
                <Text style={styles.monthText}>
                  Tháng {selectedMonth + 1}/{selectedYear}
                </Text>
                <Feather name="calendar" size={13} color="#94A3B8" />
              </Pressable>
              <Pressable
                style={styles.monthArrow}
                onPress={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
              >
                <Feather name="chevron-right" size={20} color="#10B981" />
              </Pressable>
            </LinearGradient>
          </View>
        )}

        {viewMode === 'year' && (
          <View style={styles.monthPicker}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.08)',
                'rgba(255, 255, 255, 0.03)',
              ]}
              style={styles.monthPickerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Pressable
                style={styles.monthArrow}
                onPress={() => setSelectedYear(selectedYear - 1)}
              >
                <Feather name="chevron-left" size={20} color="#10B981" />
              </Pressable>
              <View style={styles.monthDisplay}>
                <Text style={styles.monthText}>Năm {selectedYear}</Text>
              </View>
              <Pressable
                style={styles.monthArrow}
                onPress={() => setSelectedYear(selectedYear + 1)}
              >
                <Feather name="chevron-right" size={20} color="#10B981" />
              </Pressable>
            </LinearGradient>
          </View>
        )}

        <AdBanner placement="reports" />

        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Chi tiêu</Text>
            {expenseByCategory.length ? (
              <View style={styles.pieRow}>
                <View style={styles.chartContainer}>
                  <Svg width={chartSize} height={chartSize}>
                    <G x={chartSize / 2} y={chartSize / 2}>
                      {pieSlices.map((slice, index) => (
                        <Path
                          key={`slice-${slice.index}`}
                          d={arcGenerator(slice) ?? undefined}
                          fill={expenseByCategory[index]?.color ?? '#EC4899'}
                        />
                      ))}
                    </G>
                  </Svg>
                </View>
                <View style={styles.legend}>
                  {topExpenses.map(item => (
                    <View key={item.categoryId} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <View style={styles.legendContent}>
                        <Text style={styles.legendLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={styles.legendValue} numberOfLines={1}>
                          {formatCurrency(item.value)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Không có dữ liệu</Text>
            )}
          </LinearGradient>
        </View>

        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Thu nhập</Text>
            {incomeByCategory.length ? (
              <View style={styles.pieRow}>
                <View style={styles.chartContainer}>
                  <Svg width={chartSize} height={chartSize}>
                    <G x={chartSize / 2} y={chartSize / 2}>
                      {incomePieSlices.map((slice, index) => (
                        <Path
                          key={`income-slice-${slice.index}`}
                          d={arcGenerator(slice) ?? undefined}
                          fill={incomeByCategory[index]?.color ?? '#10B981'}
                        />
                      ))}
                    </G>
                  </Svg>
                </View>
                <View style={styles.legend}>
                  {topIncomes.map(item => (
                    <View key={item.categoryId} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <View style={styles.legendContent}>
                        <Text style={styles.legendLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={styles.legendValue} numberOfLines={1}>
                          {formatCurrency(item.value)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Không có dữ liệu</Text>
            )}
          </LinearGradient>
        </View>

        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Xu hướng 6 tháng</Text>
            <BarTrend data={stats.byMonth} />
          </LinearGradient>
        </View>
      </ScrollView>

      <MonthYearPicker
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
        }}
      />
    </View>
  );
}

interface BarTrendProps {
  data: { monthLabel: string; income: number; expense: number }[];
}

function BarTrend({ data }: BarTrendProps) {
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.income, item.expense)),
    1,
  );

  return (
    <View style={styles.barWrapper}>
      {data.map(item => {
        const incomeHeight = (item.income / maxValue) * 80;
        const expenseHeight = (item.expense / maxValue) * 80;
        return (
          <View key={item.monthLabel} style={styles.barColumn}>
            <View style={styles.barArea}>
              <RectBar color="#10B981" height={incomeHeight} />
              <RectBar color="#EC4899" height={expenseHeight} />
            </View>
            <Text style={styles.barLabel}>{item.monthLabel}</Text>
          </View>
        );
      })}
    </View>
  );
}

interface RectBarProps {
  color: string;
  height: number;
}

function RectBar({ color, height }: RectBarProps) {
  const dynamicStyle = useMemo(
    () => ({
      height,
      backgroundColor: color,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    }),
    [height, color],
  );
  return <View style={[styles.rectBar, dynamicStyle]} />;
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
    top: 120,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowRight: {
    position: 'absolute',
    right: -80,
    top: 380,
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
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  filterLabel: {
    fontWeight: '700',
    fontSize: 10,
  },
  monthPicker: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthPickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  monthArrow: {
    padding: 4,
  },
  monthDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.2,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    color: '#F1F5F9',
    letterSpacing: -0.2,
  },
  pieRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontWeight: '700',
    fontSize: 11,
    color: '#F1F5F9',
  },
  legendValue: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  barWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  barColumn: {
    alignItems: 'center',
    gap: 5,
  },
  barArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  rectBar: {
    width: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
});
