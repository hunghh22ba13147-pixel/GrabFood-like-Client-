import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Category, Dish, Restaurant } from '../../models/types';
import { useAuthStore } from '../../store/authStore';
import RestaurantCard from '../../components/RestaurantCard';
import CartFab from '../../components/CartFab';
import SkeletonList from '../../components/SkeletonList';
import AddressPicker, { PickedAddress } from '../../components/AddressPicker';
import { showToast } from '../../components/Toast';
import { useNav } from '../../components/Placeholder';
import { colors, radius, shadow, spacing, formatVND } from '../../theme';

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&h=400&fit=crop&q=80`;
const BANNERS = [
  { id: 'b1', title: 'Giảm 15.000đ', sub: 'Mã GIAM15K cho đơn từ 50k', color: colors.primary, image: U('1558857563-b371033873b8') },
  { id: 'b2', title: 'Miễn phí giao hàng', sub: 'Mã FREESHIP cho đơn từ 40k', color: '#FF8A00', image: U('1568901346375-23c9450c58cd') },
  { id: 'b3', title: 'Trà sữa -10%', sub: 'Mã SALE10 cho đơn từ 100k', color: '#7C4DFF', image: U('1582878826629-29b7ad1cdc43') },
];

export default function HomeScreen() {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const address = useAuthStore((s) => s.user?.address) ?? '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội';
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [cats, setCats] = useState<Category[]>([]);
  const [list, setList] = useState<Restaurant[] | null>(null);
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCats);
    api.getRestaurants().then(setList);
    api.getFeaturedDishes().then(setFeaturedDishes);
  }, []);

  const handleSelectAddress = async (place: PickedAddress) => {
    setShowAddressPicker(false);
    try {
      await updateProfile({ address: place.address });
      showToast('Đã đổi địa chỉ giao hàng!');
    } catch {
      showToast('Chưa lưu được địa chỉ giao hàng. Vui lòng thử lại.');
    }
  };

  const header = (
    <View>
      {/* Ô tìm kiếm thông minh */}
      <Pressable style={s.search} onPress={() => nav.navigate('Search')}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <Text style={s.searchText}>Bạn muốn ăn gì hôm nay?</Text>
      </Pressable>

      {/* Banner khuyến mãi cuộn mượt */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.82 + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      >
        {BANNERS.map((b) => (
          <ImageBackground
            key={b.id}
            source={{ uri: b.image }}
            style={[s.banner, { width: width * 0.82 }]}
            imageStyle={{ borderRadius: radius.lg }}
          >
            <View style={[s.bannerOverlay, { backgroundColor: b.color + 'D9' }]}>
              <View style={s.bannerBadge}>
                <Text style={s.bannerBadgeText}>Khuyến mãi hot</Text>
              </View>
              <Text style={s.bannerTitle}>{b.title}</Text>
              <Text style={s.bannerSub}>{b.sub}</Text>
            </View>
          </ImageBackground>
        ))}
      </ScrollView>

      {/* Danh mục món ăn */}
      <View style={s.catsContainer}>
        <Text style={s.catsTitle}>Danh mục món ngon</Text>
        <View style={s.cats}>
          {cats.map((c) => (
            <Pressable
              key={c.id}
              style={s.cat}
              onPress={() => nav.navigate('Search', { categoryId: c.id })}
            >
              <View style={s.catIcon}>
                <Ionicons name={c.icon as any} size={26} color={colors.primary} />
              </View>
              <Text style={s.catName}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Mục: Món bán chạy nhất (Cuộn ngang) */}
      {featuredDishes.length > 0 && (
        <View style={s.featuredSection}>
          <View style={s.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flame" size={22} color="#FF5722" />
              <Text style={s.sectionHeaderTitle}>Món bán chạy nhất</Text>
            </View>
            <Text style={s.sectionSubTitle}>Gợi ý cho bạn</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 6 }}
          >
            {featuredDishes.map((dish) => (
              <Pressable
                key={dish.id}
                style={s.dishCard}
                onPress={() =>
                  nav.navigate('DishOptions', {
                    restaurantId: dish.restaurantId,
                    dishId: dish.id,
                  })
                }
              >
                <Image source={{ uri: dish.image }} style={s.dishThumb} />
                <View style={s.dishInfo}>
                  <Text style={s.dishName} numberOfLines={1}>
                    {dish.name}
                  </Text>
                  <Text style={s.dishPrice}>{formatVND(dish.price)}</Text>
                  <View style={s.addBtnSmall}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={s.addBtnSmallText}>Đặt món</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quán ngon gần bạn */}
      <View style={s.sectionHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="restaurant" size={20} color={colors.primary} />
          <Text style={s.sectionHeaderTitle}>Quán ngon gần bạn</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Top Header thanh địa chỉ - BẤM VÀO ĐỂ ĐỔI ĐỊA CHỈ & MỞ BẢN ĐỒ / TÌM ĐỊA CHỈ */}
      <TouchableOpacity
        style={s.top}
        onPress={() => setShowAddressPicker(true)}
        activeOpacity={0.7}
      >
        <View style={s.locPin}>
          <Ionicons name="location" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.locTitle}>Giao đến:</Text>
            <Ionicons name="chevron-down" size={14} color={colors.muted} style={{ marginLeft: 3 }} />
          </View>
          <Text style={s.address} numberOfLines={1}>
            {address}
          </Text>
        </View>
        <View style={s.changeBtn}>
          <Text style={s.changeBtnText}>Thay đổi</Text>
        </View>
      </TouchableOpacity>

      {!list ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <RestaurantCard
                item={item}
                onPress={() => nav.navigate('RestaurantDetail', { restaurantId: item.id })}
              />
            </View>
          )}
        />
      )}
      <CartFab />

      {/* Modal tìm kiếm địa chỉ / bản đồ */}
      <AddressPicker
        visible={showAddressPicker}
        onClose={() => setShowAddressPicker(false)}
        onSelect={handleSelectAddress}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locTitle: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  address: { fontWeight: '700', color: colors.text, fontSize: 13, marginTop: 1 },
  changeBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginLeft: 6,
  },
  changeBtnText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  searchText: { marginLeft: spacing.sm, color: colors.muted, fontSize: 14 },

  banner: { height: 135, marginRight: spacing.md },
  bannerOverlay: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  bannerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  bannerSub: { color: '#fff', marginTop: 2, fontSize: 13, fontWeight: '500' },

  catsContainer: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...shadow,
  },
  catsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: 4,
  },
  cats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.xs },
  cat: { alignItems: 'center', width: 72 },
  catIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { marginTop: 6, fontSize: 12, color: colors.text, fontWeight: '600', textAlign: 'center' },

  featuredSection: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm + 2,
  },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginLeft: 6 },
  sectionSubTitle: { fontSize: 12, color: colors.muted, fontWeight: '600' },

  dishCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginRight: spacing.md,
    overflow: 'hidden',
    ...shadow,
  },
  dishThumb: { width: 140, height: 105, backgroundColor: colors.border },
  dishInfo: { padding: spacing.sm },
  dishName: { fontSize: 13, fontWeight: '700', color: colors.text },
  dishPrice: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 2 },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 4,
    marginTop: 6,
  },
  addBtnSmallText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 2 },
});
