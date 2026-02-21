import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '@/stores/themeStore';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
}

export function ScreenHeader({ title, showBack = true }: ScreenHeaderProps) {
  const navigation = useNavigation();
  const palette = useThemeStore(state => state.palette);

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: palette.card }]}
        >
          <Feather name="arrow-left" size={20} color={palette.text} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 36,
  },
});
