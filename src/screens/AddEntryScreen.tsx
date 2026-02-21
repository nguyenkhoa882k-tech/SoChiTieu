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
import { useThemeStore } from '@/stores/themeStore';
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
  const palette = useThemeStore(state => state.palette);
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

  // Chỉ load ads khi ở chế độ debug
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

  const toggleActiveStyle = React.useMemo(
    () => ({
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    }),
    [palette.primary],
  );
  const toggleInactiveStyle = React.useMemo(
    () => ({
      backgroundColor: palette.card,
      borderColor: palette.border,
    }),
    [palette.card, palette.border],
  );
  const toggleInactiveLabelStyle = React.useMemo(
    () => ({ color: palette.text }),
    [palette.text],
  );
  const labelMutedStyle = React.useMemo(
    () => ({ color: palette.muted }),
    [palette.muted],
  );
  const categoryActiveStyle = React.useMemo(
    () => ({
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}15`,
    }),
    [palette.primary],
  );
  const categoryInactiveStyle = React.useMemo(
    () => ({
      borderColor: palette.border,
      backgroundColor: palette.card,
    }),
    [palette.border, palette.card],
  );
  const walletActiveStyle = React.useMemo(
    () => ({
      borderColor: palette.secondary,
      backgroundColor: `${palette.secondary}22`,
    }),
    [palette.secondary],
  );
  const walletInactiveStyle = React.useMemo(
    () => ({
      borderColor: palette.border,
      backgroundColor: 'transparent',
    }),
    [palette.border],
  );
  const walletTextColorStyle = React.useMemo(
    () => ({ color: palette.text }),
    [palette.text],
  );
  const categoryTextColorStyle = React.useMemo(
    () => ({ color: palette.text }),
    [palette.text],
  );
  const datePickerStyle = React.useMemo(
    () => ({ borderColor: palette.border, backgroundColor: palette.card }),
    [palette.border, palette.card],
  );
  const dateTextColorStyle = React.useMemo(
    () => ({ color: palette.text }),
    [palette.text],
  );
  const screenBackgroundStyle = React.useMemo(
    () => ({ backgroundColor: palette.background }),
    [palette.background],
  );

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

      // Chỉ hiển thị interstitial ad khi ở chế độ debug
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
    <View style={[styles.screen, screenBackgroundStyle]}>
      <View style={styles.scrollContent}>
        <View style={styles.toggleRow}>
          {[
            { key: 'expense', label: 'Khoản chi', icon: 'arrow-up-right' },
            { key: 'income', label: 'Khoản thu', icon: 'arrow-down-left' },
          ].map(item => {
            const active = type === item.key;
            const containerStyle = active
              ? toggleActiveStyle
              : toggleInactiveStyle;
            const labelColorStyle = active
              ? styles.toggleLabelActive
              : toggleInactiveLabelStyle;
            return (
              <Pressable
                key={item.key}
                style={[styles.toggle, containerStyle]}
                onPress={() => setType(item.key as TransactionType)}
              >
                <Feather
                  name={item.icon as any}
                  size={16}
                  color={active ? '#fff' : palette.text}
                />
                <Text style={[styles.toggleLabel, labelColorStyle]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AmountInput value={amount} onChangeValue={setAmount} label="Số tiền" />

        <Text style={[styles.label, labelMutedStyle]}>Danh mục</Text>
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
                style={[
                  styles.categoryCard,
                  active ? categoryActiveStyle : categoryInactiveStyle,
                ]}
                onPress={() => setCategory(item.id)}
              >
                <Feather
                  name={item.icon as any}
                  size={14}
                  color={active ? palette.primary : palette.text}
                />
                <Text
                  style={[styles.categoryText, categoryTextColorStyle]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            style={[
              styles.categoryCard,
              styles.addCategoryCard,
              {
                borderColor: palette.primary,
                backgroundColor: `${palette.primary}10`,
              },
            ]}
            onPress={() => setShowAddCategory(true)}
          >
            <Feather name="plus" size={14} color={palette.primary} />
            <Text
              style={[styles.categoryText, { color: palette.primary }]}
              numberOfLines={1}
            >
              Thêm
            </Text>
          </Pressable>
        </ScrollView>

        <Text style={[styles.label, labelMutedStyle]}>Ví sử dụng</Text>
        <View style={styles.walletRow}>
          {DEFAULT_WALLETS.map(walletName => {
            const active = walletName === wallet;
            return (
              <Pressable
                key={walletName}
                style={[
                  styles.walletChip,
                  active ? walletActiveStyle : walletInactiveStyle,
                ]}
                onPress={() => setWallet(walletName)}
              >
                <Text style={[styles.walletText, walletTextColorStyle]}>
                  {walletName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, labelMutedStyle]}>Ngày giao dịch</Text>
        <Pressable
          style={[styles.datePicker, datePickerStyle]}
          onPress={openDatePicker}
        >
          <LinearGradient
            colors={[palette.primary, palette.accent]}
            style={styles.dateIcon}
          >
            <Feather name="calendar" size={16} color="#fff" />
          </LinearGradient>
          <Text style={[styles.dateText, dateTextColorStyle]}>
            {formatDateLabel(selectedDate.toISOString())}
          </Text>
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

        <Text style={[styles.label, { color: palette.muted }]}>Ghi chú</Text>
        <TextInput
          style={[
            styles.noteInput,
            {
              borderColor: palette.border,
              color: palette.text,
              backgroundColor: palette.card,
            },
          ]}
          placeholder="Nhập ghi chú ngắn"
          placeholderTextColor={palette.muted}
          multiline
          value={note}
          onChangeText={setNote}
        />

        <Pressable
          style={[styles.saveButton, { backgroundColor: palette.primary }]}
          onPress={handleSave}
          disabled={submitting}
        >
          <Text style={styles.saveText}>
            {submitting ? 'Đang lưu...' : 'Lưu giao dịch'}
          </Text>
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
  },
  scrollContent: {
    padding: 10,
    gap: 5,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    marginTop: 3,
    marginBottom: 3,
    fontWeight: '600',
    fontSize: 11,
  },
  categoryScrollContainer: {
    maxHeight: 130,
  },
  categoryScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 3,
    width: '31.5%',
    minHeight: 40,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 10,
  },
  addCategoryCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  walletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  walletChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 8,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  dateIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInput: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 50,
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 12,
  },
  saveButton: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
  toggleLabelActive: {
    color: '#fff',
  },
  walletText: {
    fontWeight: '600',
    fontSize: 11,
  },
  dateText: {
    fontWeight: '600',
    fontSize: 12,
  },
});
