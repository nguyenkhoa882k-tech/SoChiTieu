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
import LinearGradient from 'react-native-linear-gradient';

type ViewMode = 'month' | 'year' | 'lifetime';
type TabType = 'expense' | 'income';

export function CategoryReportScreen() {
  const navigation = useNavigation();
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
        <Text style={styles.headerTitle}>Báo cáo danh mục</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.modeSelector}>
          {(['month', 'year', 'lifetime'] as ViewMode[]).map(mode => (
            <Pressable
              key={mode}
              style={[
                styles.modeButton,
                viewMode === mode && styles.modeButtonActive,
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  viewMode === mode && styles.modeButtonTextActive,
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
            style={styles.periodSelector}
            onPress={() => {
              if (viewMode === 'month') {
                setShowMonthPicker(true);
              }
            }}
          >
            <Text style={styles.periodText}>{getPeriodLabel()}</Text>
            <Feather name="calendar" size={18} color="#10B981" />
          </Pressable>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'expense' && styles.tabTextActive,
              ]}
            >
              Chi
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'income' && styles.tabActiveIncome,
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'income' && styles.tabTextActive,
              ]}
            >
              Thu
            </Text>
          </Pressable>
        </View>

        {/* Chart */}
        {((activeTab === 'expense' && expenseByCategory.length > 0) ||
          (activeTab === 'income' && incomeByCategory.length > 0)) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Biểu đồ theo danh mục</Text>

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
                          height: Math.max((cat.value / maxValue) * 100, 2),
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryLabelShort} numberOfLines={1}>
                    {cat.label.length > 6
                      ? cat.label.substring(0, 5) + '..'
                      : cat.label}
                  </Text>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color: activeTab === 'expense' ? '#EC4899' : '#10B981',
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
          <View style={styles.card}>
            <View style={styles.listHeader}>
              <Text style={styles.cardTitle}>Chi tiết danh mục</Text>
              <Text
                style={[
                  styles.totalText,
                  { color: activeTab === 'expense' ? '#EC4899' : '#10B981' },
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
                    style={styles.categoryRow}
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
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                        <Text style={styles.percentText}>
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
                              activeTab === 'expense' ? '#EC4899' : '#10B981',
                          },
                        ]}
                      >
                        {formatCurrency(cat.value)}
                      </Text>
                      <Feather name="chevron-right" size={18} color="#94A3B8" />
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
        onSelect={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
          setShowMonthPicker(false);
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
    flex: 1,
    textAlign: 'center',
    color: '#F1F5F9',
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
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  tabActiveIncome: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 5,
  },
  modeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  modeButtonTextActive: {
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
  totalText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listHeader: {
    gap: 5,
    marginBottom: 5,
  },
  chartContainer: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 8,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 4,
    minWidth: 58,
  },
  barContainer: {
    height: 100,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 28,
    borderRadius: 7,
    minHeight: 2,
  },
  categoryLabelShort: {
    fontSize: 10,
    fontWeight: '600',
    maxWidth: 65,
    textAlign: 'center',
    color: '#F1F5F9',
  },
  amountText: {
    fontSize: 9,
    fontWeight: '500',
  },
  categoryList: {
    gap: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryTextContainer: {
    flex: 1,
    gap: 2,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  percentText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  categoryValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
