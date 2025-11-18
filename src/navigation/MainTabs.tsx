import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { OverviewScreen } from '@/screens/OverviewScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { useThemeStore } from '@/stores/themeStore';

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
  const translateY = useSharedValue(focused ? -8 : 0);
  const scale = useSharedValue(focused ? 1.1 : 1);
  const iconName = TAB_ICONS[routeName] ?? 'circle';

  React.useEffect(() => {
    if (focused) {
      // Lift up animation
      translateY.value = withSpring(-8, {
        damping: 15,
        stiffness: 150,
      });
      scale.value = withSpring(1.1, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [focused, translateY, scale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={iconAnimatedStyle}>
      <View style={styles.iconWrapper}>
        <View
          style={[
            styles.iconContainer,
            focused && [
              styles.iconContainerFocused,
              { backgroundColor: `${color}20` },
            ],
          ]}
        >
          <Feather name={iconName as any} size={size} color={color} />
        </View>
      </View>
    </Animated.View>
  );
}

const TabIcon = React.memo(AnimatedIcon);

export function MainTabs() {
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
      screenOptions={({
        route,
      }: {
        route: { name: keyof TabParamList };
      }) => ({
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

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconContainerFocused: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
});
