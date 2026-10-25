import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { Category, Restaurant } from '../../models/types';
import RestaurantCard from '../../components/RestaurantCard';
import CartFab from '../../components/CartFab';
import SkeletonList from '../../components/SkeletonList';
import { useNav } from '../../components/Placeholder';
import { colors, radius, shadow, spacing } from '../../theme';

export default function SearchScreen() {
  const nav = useNav();
  const params = (useRoute().params ?? {}) as { categoryId?: string; query?: string };
  const [query, setQuery] = useState(params.query ?? '');
  const [categoryId, setCategoryId] = useState<string | undefined>(params.categoryId);
  const [cats, setCats] = useState<Category[]>([]);
  const [list, setList] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    api.getCategories().then(setCats);
  }, []);

  // debounce 300ms khi gõ để không gọi liên tục
  useEffect(() => {
    setList(null);
    const t = setTimeout(() => {
      api.getRestaurants({ categoryId, query }).then(setList);
    }, 300);
    return () => clearTimeout(t);
  }, [query, categoryId]);

  return (
    <View style={s.root}>
      {/* Ô tìm kiếm */}
      <View style={s.box}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <TextInput
          style={s.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm quán hoặc món (vd: phở bò, trà sữa, pizza...)"
          placeholderTextColor="#82908a"
          autoFocus={!params.categoryId}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Bộ lọc danh mục (Chips) */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          <Chip label="Tất cả" active={!categoryId} onPress={() => setCategoryId(undefined)} />
          {cats.map((c) => (
            <Chip key={c.id} label={c.name} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
          ))}
        </ScrollView>
      </View>

      {!list ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 90 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="fast-food-outline" size={48} color={colors.muted} />
              </View>
              <Text style={s.emptyTitle}>Không tìm thấy kết quả phù hợp</Text>
              <Text style={s.emptySub}>
                Rất tiếc không có món ăn hoặc quán nào khớp với từ khóa "{query || 'bộ lọc này'}".
              </Text>
              <TouchableOpacity
                style={s.resetBtn}
                onPress={() => {
                  setQuery('');
                  setCategoryId(undefined);
                }}
              >
                <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={s.resetBtnText}>Xem tất cả quán ăn</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <RestaurantCard item={item} onPress={() => nav.navigate('RestaurantDetail', { restaurantId: item.id })} />
          )}
        />
      )}
      <CartFab />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  input: { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, fontSize: 14, color: colors.text },
  chips: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },

  empty: { alignItems: 'center', marginTop: 40, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
  emptySub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginTop: 18,
    ...shadow,
  },
  resetBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
