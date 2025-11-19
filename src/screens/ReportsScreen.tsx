import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { pie, arc } from 'd3-shape';
import Feather from 'react-native-vector-icons/Feather';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { AdBanner } from '@/components/AdBanner';
import { MonthYearPicker } from '@/components/MonthYearPicker';

const chartWidth = Dimensions.get('window').width - 70;
const radius = chartWidth / 2.5;

type RangeMode = 'month' | 'year' | 'lifetime';

export function ReportsScreen() {
  const palette = useThemeStore(state => state.palette);
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

  const pieSlices = pie<{ value: number }>()
    .value(d => d.value)
    .sort(null)(expenseByCategory);
  const arcGenerator = arc<any>().innerRadius(radius * 0.45).outerRadius(radius);

  const topExpenses = expenseByCategory.slice(0, 4);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.filterRow}>
        {(
          [
            { key: 'month', label: 'Tháng này', icon: 'calendar' },
            { key: 'year', label: 'Năm nay', icon: 'bar-chart-2' },
            { key: 'lifetime', label: 'Toàn thời gian', icon: 'infinity' },
          ] as const
        ).map(item => {
          const active = viewMode === item.key;
          return (
            <Pressable
              key={item.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? palette.primary : 'transparent',
                  borderColor: palette.border,
                },
              ]}
              onPress={() => setViewMode(item.key)}
            >
              <Feather
                name={item.icon as any}
                size={16}
                color={active ? '#fff' : palette.text}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? '#fff' : palette.text },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {viewMode === 'month' && (
        <View style={[styles.monthPicker, { backgroundColor: palette.card, borderColor: palette.border }]}>
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
            <Feather name="chevron-left" size={24} color={palette.primary} />
          </Pressable>
          <Pressable 
            style={styles.monthDisplay}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={[styles.monthText, { color: palette.text }]}>
              Tháng {selectedMonth + 1}/{selectedYear}
            </Text>
            <Feather name="calendar" size={16} color={palette.muted} />
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
            <Feather name="chevron-right" size={24} color={palette.primary} />
          </Pressable>
        </View>
      )}

      {viewMode === 'year' && (
        <View style={[styles.monthPicker, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Pressable
            style={styles.monthArrow}
            onPress={() => setSelectedYear(selectedYear - 1)}
          >
            <Feather name="chevron-left" size={24} color={palette.primary} />
          </Pressable>
          <View style={styles.monthDisplay}>
            <Text style={[styles.monthText, { color: palette.text }]}>
              Năm {selectedYear}
            </Text>
          </View>
          <Pressable
            style={styles.monthArrow}
            onPress={() => setSelectedYear(selectedYear + 1)}
          >
            <Feather name="chevron-right" size={24} color={palette.primary} />
          </Pressable>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
        accessibilityRole="summary"
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>Báo cáo chi tiêu</Text>
        {expenseByCategory.length ? (
          <View style={styles.pieRow}>
            <View style={styles.chartContainer}>
              <Svg width={chartWidth} height={chartWidth}>
                <G x={chartWidth / 2} y={chartWidth / 2}>
                  {pieSlices.map((slice, index) => (
                    <Path
                      key={`slice-${slice.index}`}
                      d={arcGenerator(slice) ?? undefined}
                      fill={expenseByCategory[index]?.color ?? palette.accent}
                    />
                  ))}
                </G>
              </Svg>
            </View>
            <View style={styles.legend}>
              {topExpenses.map(item => (
                <View key={item.categoryId} style={styles.legendRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.legendLabel, { color: palette.text }]}>
                      {item.label}
                    </Text>
                    <Text style={{ color: palette.muted }}>
                      {formatCurrency(item.value)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={{ color: palette.muted }}>
            Không có dữ liệu chi tiêu cho phạm vi này
          </Text>
        )}
      </View>

      <AdBanner placement="reports" />

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Xu hướng 6 tháng</Text>
        <BarTrend
          data={stats.byMonth}
          successColor={palette.success}
          dangerColor={palette.danger}
          textColor={palette.text}
          borderColor={palette.border}
        />
      </View>

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
    </ScrollView>
  );
}

interface BarTrendProps {
  data: { monthLabel: string; income: number; expense: number }[];
  successColor: string;
  dangerColor: string;
  textColor: string;
  borderColor: string;
}

function BarTrend({ data, successColor, dangerColor, textColor, borderColor }: BarTrendProps) {
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.income, item.expense)),
    1,
  );

  return (
    <View style={styles.barWrapper}>
      {data.map(item => {
        const incomeHeight = (item.income / maxValue) * 120;
        const expenseHeight = (item.expense / maxValue) * 120;
        return (
          <View key={item.monthLabel} style={styles.barColumn}>
            <View style={styles.barArea}>
              <RectBar color={successColor} height={incomeHeight} borderColor={borderColor} />
              <RectBar color={dangerColor} height={expenseHeight} borderColor={borderColor} />
            </View>
            <Text style={[styles.barLabel, { color: textColor }]}>{item.monthLabel}</Text>
          </View>
        );
      })}
    </View>
  );
}

interface RectBarProps {
  color: string;
  height: number;
  borderColor: string;
}

function RectBar({ color, height, borderColor }: RectBarProps) {
  const dynamicStyle = useMemo(
    () => ({ height, backgroundColor: color, borderColor }),
    [height, color, borderColor],
  );
  return <View style={[styles.rectBar, dynamicStyle]} />;
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterLabel: {
    fontWeight: '600',
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  monthArrow: {
    padding: 8,
  },
  monthDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  pieRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  legendLabel: {
    fontWeight: '600',
  },
  barWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: 6,
  },
  barArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  rectBar: {
    width: 18,
    borderRadius: 8,
    borderWidth: 1,
  },
});
