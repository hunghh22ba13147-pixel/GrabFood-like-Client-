import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Category, Restaurant } from '../../models/types';
import { useAuthStore } from '../../store/authStore';
import RestaurantCard from '../../components/RestaurantCard';
import CartFab from '../../components/CartFab';
import { useNav } from '../../components/Placeholder';
import { colors, radius, spacing } from '../../theme';

const BANNERS = [
  { id: 'b1', title: 'Giảm 15.000đ', sub: 'Mã GIAM15K cho đơn từ 50k', color: colors.primary },
  { id: 'b2', title: 'Miễn phí giao hàng', sub: 'Mã FREESHIP cho đơn từ 40k', color: '#FF8A00' },
  { id: 'b3', title: 'Trà sữa -10%', sub: 'Mã SALE10 cho đơn từ 100k', color: '#7C4DFF' },
];

export default function HomeScreen() {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const address = useAuthStore((s) => s.user?.address) ?? 'Chọn địa chỉ giao hàng';
  const [cats, setCats] = useState<Category[]>([]);
  const [list, setList] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    api.getCategories().then(setCats);
    api.getRestaurants().then(setList);
  }, []);

  const header = (
    <View>
      <Pressable style={s.search} onPress={() => nav.navigate('Search')}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <Text style={s.searchText}>Bạn muốn ăn gì hôm nay?</Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.8 + spacing.md} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {BANNERS.map((b) => (
          <View key={b.id} style={[s.banner, { width: width * 0.8, backgroundColor: b.color }]}>
            <Text style={s.bannerTitle}>{b.title}</Text>
            <Text style={s.bannerSub}>{b.sub}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={s.cats}>
        {cats.map((c) => (
          <Pressable key={c.id} style={s.cat} onPress={() => nav.navigate('Search', { categoryId: c.id })}>
            <View style={s.catIcon}><Ionicons name={c.icon as any} size={24} color={colors.primary} /></View>
            <Text style={s.catName}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>Quán ngon gần bạn</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.top}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <Text style={s.address} numberOfLines={1}>{address}</Text>
      </View>
      {!list ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <RestaurantCard item={item} onPress={() => nav.navigate('RestaurantDetail', { restaurantId: item.id })} />
            </View>
          )}
        />
      )}
      <CartFab />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  address: { marginLeft: spacing.sm, fontWeight: '600', color: colors.text, flex: 1 },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, margin: spacing.lg, marginTop: 0, padding: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  searchText: { marginLeft: spacing.sm, color: colors.muted },
  banner: { height: 120, borderRadius: radius.lg, padding: spacing.lg, marginRight: spacing.md, justifyContent: 'center' },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bannerSub: { color: '#fff', marginTop: 4 },
  cats: { flexDirection: 'row', justifyContent: 'space-around', padding: spacing.lg },
  cat: { alignItems: 'center', width: 76 },
  catIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  catName: { marginTop: 6, fontSize: 12, color: colors.text, textAlign: 'center' },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
