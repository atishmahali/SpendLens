import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5A5F',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#0c0c0c', borderTopColor: '#222', height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories', tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart" color={color} size={size} /> }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits', tabBarIcon: ({ color, size }) => <Ionicons name="warning" color={color} size={size} /> }} />
      <Tabs.Screen name="connect" options={{ title: 'Connect', tabBarIcon: ({ color, size }) => <Ionicons name="link" color={color} size={size} /> }} />
    </Tabs>
  );
}
