import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { AgentScreen } from '../screens/AgentScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { COLORS } from '../theme';

export type MainTabParams = {
  Dashboard: undefined;
  Tasks: undefined;
  Focus: undefined;
  Agent: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParams>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '◎',
    Tasks: '✓',
    Focus: '⏱',
    Agent: '✦',
    More: '⋯',
  };
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icons[name]}</Text>
    </View>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused, color }) => (
          <Text style={[styles.label, { color }]}>{route.name}</Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.textTertiary,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Agent" component={AgentScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f0e2a',
    borderTopColor: 'rgba(82,80,243,0.25)',
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
    height: 64,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18, color: COLORS.textTertiary },
  iconActive: { color: COLORS.brand },
  label: { fontSize: 10, marginTop: 2 },
});
