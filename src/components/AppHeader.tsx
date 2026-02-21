import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeStore } from '@/stores/themeStore';

interface AppHeaderProps {
  subtitle?: string;
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  const palette = useThemeStore(state => state.palette);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.avatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather name="pie-chart" size={20} color="#FFFFFF" />
      </LinearGradient>
      <View>
        <Text style={styles.title}>Sổ Thu Chi</Text>
        <Text style={styles.subtitle}>
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
    gap: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    color: '#94A3B8',
  },
});
