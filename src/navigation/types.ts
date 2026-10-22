import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = { Home: undefined; Orders: undefined; Profile: undefined };

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Search: { categoryId?: string; query?: string } | undefined;
  RestaurantDetail: { restaurantId: string };
  DishOptions: { restaurantId: string; dishId: string };   // hiển thị dạng modal/bottom sheet
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string };
};
