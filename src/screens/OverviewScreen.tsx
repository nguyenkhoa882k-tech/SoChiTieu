import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { AnimatedStatCard } from '@/components/AnimatedStatCard';
import { TransactionList } from '@/components/TransactionList';
import { AdBanner } from '@/components/AdBanner';
import { FilterSheet } from '@/components/FilterSheet';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { defaultFilter, TransactionFilter } from '@/types/filters';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatCurrency } from '@/utils/format';
import { useThemeStore } from '@/stores/themeStore';
import { TabParamList } from '@/navigation/MainTabs';
import { Transaction } from '@/types/transaction';

export function OverviewScreen() {
  const palette = useThemeStore(state => state.palette);
  const { transactions, stats, loading } = useTransactionStore();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>(defaultFilter);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      if (filter.type !== 'all' && item.type !== filter.type) {
        return false;
      }
      if (
        filter.categories.length > 0 &&
        !filter.categories.includes(item.category)
      ) {
        return false;
      }
      if (filter.startDate && item.date.slice(0, 10) < filter.startDate) {
        return false;
      }
      if (filter.endDate && item.date.slice(0, 10) > filter.endDate) {
        return false;
      }
      return true;
    });
  }, [transactions, filter]);

  const activeFilterCount = useMemo(() => {
    let count = filter.type === 'all' ? 0 : 1;
    count += filter.categories.length;
    if (filter.startDate) count += 1;
    if (filter.endDate) count += 1;
    return count;
  }, [filter]);

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader subtitle="Tổng quan tháng này" />

        <View style={styles.statRow}>
          <AnimatedStatCard
            label="Thu vào"
            value={stats.totalIncome}
            icon="arrow-down-left"
            variant="success"
            hint="Nguồn thu gần nhất"
          />
          <AnimatedStatCard
            label="Chi ra"
            value={stats.totalExpense}
            icon="arrow-up-right"
            variant="danger"
            hint="Theo dõi hạn mức"
          />
        </View>

        <AdBanner placement="overview" />

        <View
          style={[
            styles.balanceCard,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View>
            <Text style={[styles.balanceLabel, { color: palette.muted }]}>
              Số dư dự báo
            </Text>
            <Text style={[styles.balanceValue, { color: palette.text }]}>
              {formatCurrency(stats.netBalance)}
            </Text>
          </View>
          <Pressable
            style={[styles.addButton, { backgroundColor: palette.primary }]}
            onPress={() => navigation.navigate('AddEntry' as never)}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Thêm</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Hoạt động gần đây
          </Text>
          <Pressable
            style={[styles.filterButton, { borderColor: palette.border }]}
            onPress={() => setFilterVisible(true)}
          >
            <Feather name="filter" size={14} color={palette.primary} />
            <Text style={[styles.filterText, { color: palette.primary }]}>
              Bộ lọc
            </Text>
            {activeFilterCount ? (
              <View
                style={[styles.badge, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={palette.primary}
            style={styles.loading}
          />
        ) : (
          <TransactionList
            data={filteredTransactions}
            emptyLabel="Chưa có giao dịch"
            onEdit={tx => setEditingTransaction(tx)}
          />
        )}
      </ScrollView>
      <FilterSheet
        visible={filterVisible}
        value={filter}
        onClose={() => setFilterVisible(false)}
        onApply={next => setFilter(next)}
      />
      <EditTransactionModal
        visible={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={() => {
          // Refresh handled by store
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 80,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  balanceCard: {
    marginTop: 10,
    marginBottom: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    textTransform: 'uppercase',
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
    opacity: 0.7,
  },
  balanceValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  filterRow: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filterText: {
    fontWeight: '700',
    fontSize: 11,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  loading: {
    marginVertical: 20,
  },
});
