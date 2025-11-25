import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { OverviewScreen } from '@/screens/OverviewScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { MonthlyReportScreen } from '@/screens/MonthlyReportScreen';
import { YearlyReportScreen } from '@/screens/YearlyReportScreen';
import { CategoryReportScreen } from '@/screens/CategoryReportScreen';
import { CategoryDetailScreen } from '@/screens/CategoryDetailScreen';
import { BalanceHistoryScreen } from '@/screens/BalanceHistoryScreen';
import { useThemeStore } from '@/stores/themeStore';

export type RootStackParamList = {
  MainTabs: undefined;
  MonthlyReport: undefined;
  YearlyReport: undefined;
  CategoryReport: undefined;
  CategoryDetail: {
    categoryId: string;
    categoryLabel: string;
    categoryColor: string;
    type: 'expense' | 'income';
  };
  BalanceHistory: undefined;
};

export type TabParamList = {
  Overview: undefined;
  AddEntry: undefined;
  Calendar: undefined;
  Reports: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Overview: 'home',
  AddEntry: 'plus-circle',
  Calendar: 'calendar',
  Reports: 'trending-up',
  More: 'menu',
};

interface AnimatedIconProps {
  routeName: keyof TabParamList;
  color: string;
  size: number;
  focused: boolean;
}

function AnimatedIcon({ routeName, color, size, focused }: AnimatedIconProps) {
  const iconName = TAB_ICONS[routeName] ?? 'circle';
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(focused ? -6 : 0, {
      damping: 12,
      stiffness: 120,
    });
    scale.value = withSpring(focused ? 1.15 : 1, {
      damping: 12,
      stiffness: 120,
    });
    opacity.value = withTiming(focused ? 1 : 0, {
      duration: 200,
    });
  }, [focused]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.iconBackground, backgroundAnimatedStyle]}>
        <View
          style={[
            styles.iconBackgroundInner,
            { backgroundColor: `${color}15` },
          ]}
        />
      </Animated.View>
      <Animated.View style={iconAnimatedStyle}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={size} color={color} />
        </View>
      </Animated.View>
    </View>
  );
}

const TabIcon = React.memo(AnimatedIcon);

function TabNavigator() {
  const palette = useThemeStore(state => state.palette);

  const renderIcon = React.useCallback(
    (route: { name: keyof TabParamList }) =>
      ({
        color,
        size,
        focused,
      }: {
        color: string;
        size: number;
        focused: boolean;
      }) =>
        (
          <TabIcon
            routeName={route.name}
            color={color}
            size={size}
            focused={focused}
          />
        ),
    [],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof TabParamList } }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarIcon: renderIcon(route),
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

export function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="MonthlyReport" component={MonthlyReportScreen} />
      <Stack.Screen name="YearlyReport" component={YearlyReportScreen} />
      <Stack.Screen name="CategoryReport" component={CategoryReportScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="BalanceHistory" component={BalanceHistoryScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  iconBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackgroundInner: {
    width: 50,
    height: 32,
    borderRadius: 16,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
