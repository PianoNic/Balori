import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { BottomNavigation } from 'react-native-paper';

const TAB_SCREENS = [
  { name: 'index', title: 'Fuel', icon: 'fire' },
  { name: 'scan', title: 'Scan', icon: 'barcode-scan' },
  { name: 'products', title: 'Products', icon: 'format-list-bulleted' },
  { name: 'trend', title: 'Trend', icon: 'trending-up' },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route }) => {
            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            });
          }}
          renderIcon={({ route, focused, color }) =>
            descriptors[route.key].options.tabBarIcon?.({ focused, color, size: 24 }) ?? null
          }
          getLabelText={({ route }) => descriptors[route.key].options.title!}
        />
      )}>
      {TAB_SCREENS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
