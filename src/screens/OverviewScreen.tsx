import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
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
    <View style={styles.screen}>
      {/* Background tối */}
      <LinearGradient
        colors={['#1a1f2e', '#16213e', '#0f1419']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Glow xanh lá bên trái */}
      <View style={styles.glowLeft}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.4)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Glow hồng bên phải */}
      <View style={styles.glowRight}>
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.3)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBarSpacer} />
        <AppHeader subtitle="Tháng này" />

        {/* Glassmorphism Balance Card */}
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.glassCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.glassCardInner}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                <Pressable
                  style={styles.addButtonSmall}
                  onPress={() => navigation.navigate('AddEntry' as never)}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.addButtonSmallGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.addButtonSmallText}>Thêm</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              <Text style={styles.balanceValue}>
                {formatCurrency(stats.netBalance)}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIconIncome}>
                    <Feather name="arrow-down-left" size={14} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Thu</Text>
                    <Text style={styles.statValueIncome}>
                      {formatCurrency(stats.totalIncome)}
                    </Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconExpense}>
                    <Feather name="arrow-up-right" size={14} color="#EC4899" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Chi</Text>
                    <Text style={styles.statValueExpense}>
                      {formatCurrency(stats.totalExpense)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <AdBanner placement="overview" />

        <View style={styles.filterRow}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <Pressable
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <Feather name="filter" size={14} color="#10B981" />
            <Text style={styles.filterText}>Bộ lọc</Text>
            {activeFilterCount ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#10B981"
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
  scrollContent: {
    padding: 12,
    paddingBottom: 80,
  },
  glowLeft: {
    position: 'absolute',
    left: -100,
    top: 100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowRight: {
    position: 'absolute',
    right: -100,
    top: 300,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  glassCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glassCardGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassCardInner: {
    gap: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addButtonSmall: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonSmallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonSmallText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statIconIncome: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconExpense: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  statValueIncome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  statValueExpense: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EC4899',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  filterText: {
    fontWeight: '700',
    fontSize: 11,
    color: '#10B981',
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
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
