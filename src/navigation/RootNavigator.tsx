import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from './types';
import { colors } from '../theme';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import RestaurantDetailScreen from '../screens/restaurant/RestaurantDetailScreen';
import DishOptionsScreen from '../screens/restaurant/DishOptionsScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
    Home: 'home',
    Orders: 'receipt',
    Profile: 'person',
  };

  const activeOrdersCount = useOrderStore((s) => s.orders.filter((o) => o.status !== 'completed').length);
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = focused ? icons[route.name] : (`${icons[route.name]}-outline` as any);
          return <Ionicons name={iconName} size={size + 1} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: '#fff',
            fontSize: 10,
            fontWeight: '800',
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{
          title: 'Đơn hàng',
          tabBarBadge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF8A00',
            color: '#fff',
            fontSize: 10,
            fontWeight: '800',
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerTintColor: colors.primary, headerTitleStyle: { color: colors.text } }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Tìm kiếm' }} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: 'Quán ăn' }} />
        <Stack.Screen
          name="DishOptions"
          component={DishOptionsScreen}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Theo dõi đơn hàng' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
