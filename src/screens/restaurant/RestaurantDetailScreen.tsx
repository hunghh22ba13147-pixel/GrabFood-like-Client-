import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dish, Restaurant } from '../../models/types';
import { RootStackParamList } from '../../navigation/types';
import { api } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { colors, formatVND, radius, spacing } from '../../theme';
import DishRow from './DishRow';
import RestaurantHero from './RestaurantHero';

type RestaurantDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;

export default function RestaurantDetailScreen({ navigation, route }: RestaurantDetailScreenProps) {
  const restaurantId = route.params.restaurantId;
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(undefined);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeGroup, setActiveGroup] = useState('Tất cả');
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const cartRestaurant = useCartStore((state) => state.restaurant);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setRestaurant(undefined);
    setDishes([]);
    setActiveGroup('Tất cả');
    Promise.all([api.getRestaurant(restaurantId), api.getDishes(restaurantId)]).then(
      ([nextRestaurant, nextDishes]) => {
        if (cancelled) return;
        setRestaurant(nextRestaurant);
        setDishes(nextDishes);
        setLoading(false);
      },
    ).catch(() => {
      if (cancelled) return;
      setLoadError(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [restaurantId, retryCount]);

  const groups = useMemo(() => {
    const unique = Array.from(new Set(dishes.map((dish) => dish.group)));
    return ['Tất cả', ...unique];
  }, [dishes]);

  const visibleDishes = useMemo(() => {
    if (activeGroup === 'Tất cả') return dishes;
    return dishes.filter((dish) => dish.group === activeGroup);
  }, [activeGroup, dishes]);

  const grouped = useMemo(() => {
    const map = new Map<string, Dish[]>();
    for (const dish of visibleDishes) {
      const list = map.get(dish.group) ?? [];
      list.push(dish);
      map.set(dish.group, list);
    }
    return Array.from(map.entries());
  }, [visibleDishes]);

  const openDish = (dish: Dish) => {
    navigation.navigate('DishOptions', { restaurantId, dishId: dish.id });
  };

  const cartSubtotal =
    cartRestaurant?.id === restaurantId
      ? cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      : 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Đang tải thực đơn...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          {loadError ? 'Không thể tải thông tin quán.' : 'Không tìm thấy quán ăn.'}
        </Text>
        {loadError ? (
          <Pressable style={styles.retryButton} onPress={() => setRetryCount((count) => count + 1)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <RestaurantHero restaurant={restaurant} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {groups.map((group) => {
            const active = group === activeGroup;
            return (
              <Pressable
                key={group}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveGroup(group)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{group}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {grouped.map(([group, items]) => (
          <View key={group}>
            <Text style={styles.groupTitle}>{group}</Text>
            {items.map((dish) => (
              <DishRow key={dish.id} dish={dish} onPress={openDish} />
            ))}
          </View>
        ))}
        {dishes.length === 0 ? (
          <Text style={[styles.muted, styles.empty]}>Quán chưa có món.</Text>
        ) : null}
      </ScrollView>
      {cartCount > 0 && cartRestaurant?.id === restaurantId ? (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartBarText}>
            Giỏ hàng · {cartCount} món · {formatVND(cartSubtotal)}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 96 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muted: { color: colors.muted, marginTop: spacing.sm },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  tabs: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  tab: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  tabText: { color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.primaryDark },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cartBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontWeight: '700' },
});
