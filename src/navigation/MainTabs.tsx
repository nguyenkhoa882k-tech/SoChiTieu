import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { OverviewScreen } from '@/screens/OverviewScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { useThemePalette } from '@/theme/ThemeProvider';

export type TabParamList = {
  Overview: undefined;
  AddEntry: undefined;
  Calendar: undefined;
  Reports: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const TAB_ICONS: Record<keyof TabParamList, string> = {
  Overview: 'home',
  AddEntry: 'plus-square',
  Calendar: 'calendar',
  Reports: 'pie-chart',
  More: 'grid',
};

function renderTabIcon(
  routeName: keyof TabParamList,
  color: string,
  size: number,
  focused: boolean,
) {
  const iconName = TAB_ICONS[routeName] ?? 'circle';
  return (
    <Feather
      name={iconName as any}
      size={focused ? size + 2 : size}
      color={color}
    />
  );
}

export function MainTabs() {
  const { palette } = useThemePalette();

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: { name: keyof TabParamList };
      }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarIcon: ({
          color,
          size,
          focused,
        }: {
          color: string;
          size: number;
          focused: boolean;
        }) => renderTabIcon(route.name, color, size, focused),
      })}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{ tabBarLabel: 'Tổng quan' }}
      />
      <Tab.Screen
        name="AddEntry"
        component={AddEntryScreen}
        options={{ tabBarLabel: 'Thêm' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Lịch' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Báo cáo' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: 'Khác' }}
      />
    </Tab.Navigator>
  );
}
