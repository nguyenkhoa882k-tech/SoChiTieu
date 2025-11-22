import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Transaction } from '@/types/transaction';
import { CATEGORY_LIST } from '@/constants/categories';
import { AmountInput } from './AmountInput';

interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTransactionModal({
  visible,
  transaction,
  onClose,
  onSuccess,
}: EditTransactionModalProps) {
  const palette = useThemeStore(state => state.palette);
  const { updateTransaction, deleteTransaction } = useTransactionStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setNote(transaction.note || '');
      setDate(transaction.date);
      setType(transaction.type);
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction || !amount || parseFloat(amount) <= 0 || !category) {
      return;
    }

    await updateTransaction(transaction.id, {
      amount: parseFloat(amount),
      category,
      note: note.trim(),
      date,
      type,
    });

    onSuccess();
    onClose();
  };

  const handleDelete = async () => {
    if (!transaction) return;

    await deleteTransaction(transaction.id);
    onSuccess();
    onClose();
  };

  if (!transaction) return null;

  const categories = CATEGORY_LIST.filter(c => c.type === type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={e => e.stopPropagation()}
          style={[
            styles.content,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>
              Chỉnh sửa giao dịch
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={palette.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.body}>
            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'expense' && {
                    backgroundColor: palette.danger,
                  },
                ]}
                onPress={() => setType('expense')}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === 'expense' ? '#fff' : palette.text,
                    },
                  ]}
                >
                  Chi
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'income' && {
                    backgroundColor: palette.success,
                  },
                ]}
                onPress={() => setType('income')}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === 'income' ? '#fff' : palette.text,
                    },
                  ]}
                >
                  Thu
                </Text>
              </Pressable>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: palette.text }]}>
                Số tiền
              </Text>
              <AmountInput value={amount} onChangeValue={setAmount} />
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: palette.text }]}>
                Danh mục
              </Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor:
                          category === cat.id
                            ? `${cat.color}20`
                            : palette.background,
                        borderColor:
                          category === cat.id ? cat.color : palette.border,
                      },
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Feather
                      name={cat.icon as any}
                      size={20}
                      color={category === cat.id ? cat.color : palette.muted}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color: category === cat.id ? cat.color : palette.text,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Note */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: palette.text }]}>
                Ghi chú (tùy chọn)
              </Text>
              <Pressable
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                  },
                ]}
                onPress={() => {
                  // Simple text input simulation
                }}
              >
                <Text style={{ color: note ? palette.text : palette.muted }}>
                  {note || 'Nhập ghi chú...'}
                </Text>
              </Pressable>
            </View>

            {/* Delete Button */}
            <Pressable
              style={[
                styles.deleteButton,
                {
                  backgroundColor: `${palette.danger}15`,
                  borderColor: palette.danger,
                },
              ]}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={18} color={palette.danger} />
              <Text style={[styles.deleteText, { color: palette.danger }]}>
                Xóa giao dịch
              </Text>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: palette.text }]}>
                Hủy
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: palette.primary },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Lưu</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  noteInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
