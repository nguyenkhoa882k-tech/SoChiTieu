import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import { useThemePalette } from '@/theme/ThemeProvider';

interface AmountInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  label?: string;
}

export function AmountInput({ value, onChangeValue, label }: AmountInputProps) {
  const { palette } = useThemePalette();
  const labelStyle = useMemo(() => ({ color: palette.muted }), [palette.muted]);
  const inputThemeStyle = useMemo(
    () => ({
      backgroundColor: palette.card,
      color: palette.text,
      borderColor: palette.border,
    }),
    [palette.card, palette.text, palette.border],
  );

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : null}
      <CurrencyInput
        value={value}
        onChangeValue={(val: number | null) => onChangeValue(val ?? 0)}
        delimiter="."
        separator="," 
        precision={0}
        minValue={0}
        style={[styles.input, inputThemeStyle]}
        prefix="₫ "
        placeholder="Nhập số tiền"
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '700',
  },
});
