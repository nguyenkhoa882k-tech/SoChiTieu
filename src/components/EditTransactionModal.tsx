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
import { ConfirmModal } from './ConfirmModal';

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

  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setCategory(transaction.category);
      setNote(transaction.note || '');
      setDate(transaction.date);
      setType(transaction.type);
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction || !amount || amount <= 0 || !category) {
      return;
    }

    await updateTransaction(transaction.id, {
      amount,
      category,
      note: note.trim(),
      date,
      type,
    });

    onSuccess();
    onClose();
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!transaction) return;

    await deleteTransaction(transaction.id);
    setShowDeleteConfirm(false);
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
              <Feather name="x" size={20} color={palette.text} />
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
                      size={16}
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
                <Text
                  style={{
                    color: note ? palette.text : palette.muted,
                    fontSize: 12,
                  }}
                >
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
              onPress={handleDeleteConfirm}
            >
              <Feather name="trash-2" size={16} color={palette.danger} />
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  noteInput: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
