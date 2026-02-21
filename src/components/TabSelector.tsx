import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';

interface Tab {
  key: string;
  label: string;
  color?: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabSelector({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  const palette = useThemeStore(state => state.palette);

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const bgColor = isActive ? tab.color || palette.primary : 'transparent';

        return (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              { backgroundColor: bgColor, borderColor: palette.border },
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              style={[styles.text, { color: isActive ? '#fff' : palette.text }]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 5,
  },
  tab: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
