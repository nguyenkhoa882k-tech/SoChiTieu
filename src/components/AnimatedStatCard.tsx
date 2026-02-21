import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';
import { formatCurrency } from '@/utils/format';

interface AnimatedStatCardProps {
  label: string;
  value: number;
  icon: string;
  variant?: 'primary' | 'success' | 'danger';
  hint?: string;
}

export function AnimatedStatCard({
  label,
  value,
  icon,
  variant = 'primary',
  hint,
}: AnimatedStatCardProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const palette = useThemeStore(state => state.palette);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  const colorMap = {
    primary: palette.primary,
    success: palette.success,
    danger: palette.danger,
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <View
        style={[styles.iconWrapper, { backgroundColor: colorMap[variant] }]}
      >
        <Feather name={icon as any} size={16} color="#fff" />
      </View>
      <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.text }]}>
        {formatCurrency(value)}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: palette.muted }]}>{hint}</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3,
  },
  hint: {
    marginTop: 3,
    fontSize: 10,
  },
});
