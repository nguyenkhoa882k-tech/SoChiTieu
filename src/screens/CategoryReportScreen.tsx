import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from '@/utils/format';
import { MonthYearPicker } from '@/components/MonthYearPicker';

const screenWidth = Dimensions.get('window').width;

type ViewMode = 'month' | 'year' | 'lifetime';
type TabType = 'expense' | 'income';

export function CategoryReportScreen() {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);
  const { transactions } = useTransactionStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [activeTab, setActiveTab] = useState<TabType>('expense');
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

  const totalExpense = expenseByCategory.reduce(
    (sum, cat) => sum + cat.value,
    0,
  );
  const totalIncome = incomeByCategory.reduce((sum, cat) => sum + cat.value, 0);

  const maxValue = useMemo(() => {
    const data = activeTab === 'expense' ? expenseByCategory : incomeByCategory;
    return Math.max(...data.map(d => d.value), 1);
  }, [expenseByCategory, incomeByCategory, activeTab]);

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
          Báo cáo danh mục
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'expense' && {
                backgroundColor: palette.danger,
              },
              { borderColor: palette.border },
            ]}
            onPress={() => setActiveTab('expense')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'expense' ? '#fff' : palette.text },
              ]}
            >
              Chi tiêu
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'income' && {
                backgroundColor: palette.success,
              },
              { borderColor: palette.border },
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'income' ? '#fff' : palette.text },
              ]}
            >
              Thu nhập
            </Text>
          </Pressable>
        </View>

        {/* Chart */}
        {((activeTab === 'expense' && expenseByCategory.length > 0) ||
          (activeTab === 'income' && incomeByCategory.length > 0)) && (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Biểu đồ theo danh mục
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartContainer}
            >
              {(activeTab === 'expense'
                ? expenseByCategory
                : incomeByCategory
              ).map((cat, index) => (
                <View key={cat.categoryId} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max((cat.value / maxValue) * 150, 2),
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.categoryLabelShort, { color: palette.text }]}
                    numberOfLines={1}
                  >
                    {cat.label.length > 6
                      ? cat.label.substring(0, 5) + '..'
                      : cat.label}
                  </Text>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color:
                          activeTab === 'expense'
                            ? palette.danger
                            : palette.success,
                      },
                    ]}
                  >
                    {formatCurrency(cat.value).replace(' ₫', '')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category List */}
        {((activeTab === 'expense' && expenseByCategory.length > 0) ||
          (activeTab === 'income' && incomeByCategory.length > 0)) && (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View style={styles.listHeader}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Chi tiết danh mục
              </Text>
              <Text
                style={[
                  styles.totalText,
                  {
                    color:
                      activeTab === 'expense'
                        ? palette.danger
                        : palette.success,
                  },
                ]}
              >
                Tổng:{' '}
                {formatCurrency(
                  activeTab === 'expense' ? totalExpense : totalIncome,
                )}
              </Text>
            </View>

            <View style={styles.categoryList}>
              {(activeTab === 'expense'
                ? expenseByCategory
                : incomeByCategory
              ).map(cat => {
                const total =
                  activeTab === 'expense' ? totalExpense : totalIncome;
                const percent = ((cat.value / total) * 100).toFixed(1);
                return (
                  <Pressable
                    key={cat.categoryId}
                    style={[
                      styles.categoryRow,
                      { borderBottomColor: palette.border },
                    ]}
                    onPress={() => {
                      (navigation as any).navigate('CategoryDetail', {
                        categoryId: cat.categoryId,
                        categoryLabel: cat.label,
                        categoryColor: cat.color,
                        type: activeTab,
                      });
                    }}
                  >
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: cat.color },
                        ]}
                      />
                      <View style={styles.categoryTextContainer}>
                        <Text
                          style={[
                            styles.categoryLabel,
                            { color: palette.text },
                          ]}
                        >
                          {cat.label}
                        </Text>
                        <Text
                          style={[styles.percentText, { color: palette.muted }]}
                        >
                          {percent}% của tổng
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryValues}>
                      <Text
                        style={[
                          styles.categoryAmount,
                          {
                            color:
                              activeTab === 'expense'
                                ? palette.danger
                                : palette.success,
                          },
                        ]}
                      >
                        {formatCurrency(cat.value)}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={20}
                        color={palette.muted}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
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
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  modeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listHeader: {
    gap: 6,
    marginBottom: 6,
  },
  chartContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 10,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 5,
    minWidth: 65,
  },
  barContainer: {
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 32,
    borderRadius: 8,
    minHeight: 2,
  },
  categoryLabelShort: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 70,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 10,
    fontWeight: '500',
  },
  categoryList: {
    gap: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryTextContainer: {
    flex: 1,
    gap: 3,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 12,
  },
  categoryValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
