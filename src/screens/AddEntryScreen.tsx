import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { AmountInput } from '@/components/AmountInput';
import { CustomModal } from '@/components/CustomModal';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { CATEGORY_LIST, DEFAULT_WALLETS } from '@/constants/categories';
import { formatDateLabel } from '@/utils/format';
import { TransactionType } from '@/types/transaction';

const IOS_INTERSTITIAL = 'ca-app-pub-3940256099942544/4411468910';
const ANDROID_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

export function AddEntryScreen() {
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [wallet, setWallet] = useState(DEFAULT_WALLETS[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ title: '', message: '', type: 'info' });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const { customCategories, addCustomCategory } = useCategoryStore();

  const adUnitId = Platform.select({
    ios: IOS_INTERSTITIAL,
    android: ANDROID_INTERSTITIAL,
    default: TestIds.INTERSTITIAL,
  })!;

  const { isLoaded, isClosed, load, show } = useInterstitialAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  React.useEffect(() => {
    if (__DEV__) {
      load();
    }
  }, [load]);

  React.useEffect(() => {
    if (__DEV__ && isClosed) {
      load();
    }
  }, [isClosed, load]);

  const availableCategories = useMemo(() => {
    const defaultCats = CATEGORY_LIST.filter(item =>
      item.type === 'common' ? true : item.type === type,
    );
    const customCats = customCategories.filter(item =>
      item.type === 'common' ? true : item.type === type,
    );
    return [...defaultCats, ...customCats];
  }, [type, customCategories]);

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        onChange: (_event: DateTimePickerEvent, date?: Date) => {
          if (date) {
            setSelectedDate(date);
          }
        },
        mode: 'date',
      });
    } else {
      setShowIosPicker(true);
    }
  };

  const handleIosDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = async () => {
    if (!amount) {
      setModalConfig({
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập số tiền',
        type: 'warning',
      });
      setModalVisible(true);
      return;
    }
    setSubmitting(true);
    try {
      await addTransaction({
        amount,
        category,
        type,
        note,
        wallet,
        date: selectedDate.toISOString(),
      });
      setModalConfig({
        title: 'Thành công',
        message: 'Giao dịch đã được lưu',
        type: 'success',
      });
      setModalVisible(true);

      if (__DEV__ && isLoaded) {
        show();
      }

      setAmount(0);
      setNote('');
    } catch (error) {
      console.error('Failed to add transaction', error);
      setModalConfig({
        title: 'Lỗi',
        message: 'Không thể lưu, vui lòng thử lại',
        type: 'error',
      });
      setModalVisible(true);
    } finally {
      setSubmitting(false);
    }
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

      <View style={styles.content}>
        <View style={styles.statusBarSpacer} />

        <View style={styles.toggleRow}>
          {[
            { key: 'expense', label: 'Khoản chi', icon: 'arrow-up-right' },
            { key: 'income', label: 'Khoản thu', icon: 'arrow-down-left' },
          ].map(item => {
            const active = type === item.key;
            return (
              <Pressable
                key={item.key}
                style={styles.toggle}
                onPress={() => setType(item.key as TransactionType)}
              >
                <LinearGradient
                  colors={
                    active
                      ? item.key === 'expense'
                        ? ['#EC4899', '#BE185D']
                        : ['#10B981', '#059669']
                      : [
                          'rgba(255, 255, 255, 0.08)',
                          'rgba(255, 255, 255, 0.03)',
                        ]
                  }
                  style={styles.toggleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Feather
                    name={item.icon as any}
                    size={16}
                    color={active ? '#fff' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.toggleLabel,
                      { color: active ? '#fff' : '#94A3B8' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        <AmountInput value={amount} onChangeValue={setAmount} label="Số tiền" />

        <Text style={styles.label}>Danh mục</Text>
        <View style={styles.categoryContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.categoryScrollContainer}
            contentContainerStyle={styles.categoryScroll}
          >
            {availableCategories.map(item => {
              const active = item.id === category;
              return (
                <Pressable
                  key={item.id}
                  style={styles.categoryCard}
                  onPress={() => setCategory(item.id)}
                >
                  <LinearGradient
                    colors={
                      active
                        ? ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']
                        : [
                            'rgba(255, 255, 255, 0.05)',
                            'rgba(255, 255, 255, 0.02)',
                          ]
                    }
                    style={styles.categoryCardInner}
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
                        styles.categoryText,
                        { color: active ? '#10B981' : '#F1F5F9' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
            <Pressable
              style={styles.categoryCard}
              onPress={() => setShowAddCategory(true)}
            >
              <LinearGradient
                colors={[
                  'rgba(16, 185, 129, 0.15)',
                  'rgba(16, 185, 129, 0.08)',
                ]}
                style={[styles.categoryCardInner, styles.addCategoryCard]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="plus" size={14} color="#10B981" />
                <Text
                  style={[styles.categoryText, { color: '#10B981' }]}
                  numberOfLines={1}
                >
                  Thêm
                </Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>

        <Text style={styles.label}>Ví sử dụng</Text>
        <View style={styles.walletRow}>
          {DEFAULT_WALLETS.map(walletName => {
            const active = walletName === wallet;
            return (
              <Pressable
                key={walletName}
                style={styles.walletChip}
                onPress={() => setWallet(walletName)}
              >
                <LinearGradient
                  colors={
                    active
                      ? ['rgba(16, 185, 129, 0.25)', 'rgba(16, 185, 129, 0.15)']
                      : [
                          'rgba(255, 255, 255, 0.05)',
                          'rgba(255, 255, 255, 0.02)',
                        ]
                  }
                  style={styles.walletChipInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text
                    style={[
                      styles.walletText,
                      { color: active ? '#10B981' : '#F1F5F9' },
                    ]}
                  >
                    {walletName}
                  </Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Ngày giao dịch</Text>
        <Pressable style={styles.datePicker} onPress={openDatePicker}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.datePickerInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dateIconWrapper}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.dateIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather name="calendar" size={16} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.dateText}>
              {formatDateLabel(selectedDate.toISOString())}
            </Text>
          </LinearGradient>
        </Pressable>
        {Platform.OS === 'ios' && showIosPicker ? (
          <DateTimePicker
            mode="date"
            value={selectedDate}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              handleIosDateChange(event, date);
              setShowIosPicker(false);
            }}
          />
        ) : null}

        <Text style={styles.label}>Ghi chú</Text>
        <View style={styles.noteInputWrapper}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.noteInputGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập ghi chú ngắn"
              placeholderTextColor="#64748B"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </LinearGradient>
        </View>

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          disabled={submitting}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveText}>
              {submitting ? 'Đang lưu...' : 'Lưu giao dịch'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      />

      <AddCategoryModal
        visible={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onAdd={newCategory => {
          addCustomCategory(newCategory);
          setModalConfig({
            title: 'Thành công',
            message: `Đã thêm danh mục "${newCategory.label}"`,
            type: 'success',
          });
          setModalVisible(true);
        }}
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
    top: 150,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowRight: {
    position: 'absolute',
    right: -80,
    top: 400,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
  },
  content: {
    flex: 1,
    padding: 12,
    paddingBottom: 80,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggle: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    marginTop: 4,
    marginBottom: 4,
    fontWeight: '700',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryContainer: {
    maxHeight: 140,
  },
  categoryScrollContainer: {
    maxHeight: 140,
  },
  categoryScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryCard: {
    width: '31.5%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 4,
    minHeight: 40,
  },
  categoryText: {
    fontWeight: '700',
    fontSize: 11,
  },
  addCategoryCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  walletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  walletChip: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletChipInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  walletText: {
    fontWeight: '700',
    fontSize: 11,
  },
  datePicker: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  datePickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  dateIconWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#F1F5F9',
  },
  noteInputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noteInputGradient: {
    padding: 12,
  },
  noteInput: {
    minHeight: 50,
    textAlignVertical: 'top',
    fontSize: 13,
    color: '#F1F5F9',
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
