import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';

interface PeriodSelectorProps {
  label: string;
  onPress?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  showArrows?: boolean;
}

export function PeriodSelector({
  label,
  onPress,
  onPrev,
  onNext,
  showArrows = false,
}: PeriodSelectorProps) {
  const palette = useThemeStore(state => state.palette);

  if (showArrows) {
    return (
      <View
        style={[
          styles.arrowContainer,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        {onPrev && (
          <Pressable style={styles.arrow} onPress={onPrev}>
            <Feather name="chevron-left" size={20} color={palette.primary} />
          </Pressable>
        )}
        <Pressable style={styles.center} onPress={onPress}>
          <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
          {onPress && (
            <Feather name="calendar" size={16} color={palette.muted} />
          )}
        </Pressable>
        {onNext && (
          <Pressable style={styles.arrow} onPress={onNext}>
            <Feather name="chevron-right" size={20} color={palette.primary} />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
      <Feather name="calendar" size={16} color={palette.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
  },
  arrow: {
    padding: 4,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
