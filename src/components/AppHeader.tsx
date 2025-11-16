import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemePalette } from '@/theme/ThemeProvider';

interface AppHeaderProps {
  subtitle?: string;
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  const { palette } = useThemePalette();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[palette.primary, palette.accent]}
        style={styles.avatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather name="pie-chart" size={24} color="#FFFFFF" />
      </LinearGradient>
      <View>
        <Text style={[styles.title, { color: palette.text }]}>Sổ Thu Chi</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          {subtitle ?? 'Theo dõi chi tiêu thông minh'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
