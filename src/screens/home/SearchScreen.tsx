import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { Category, Restaurant } from '../../models/types';
import RestaurantCard from '../../components/RestaurantCard';
import CartFab from '../../components/CartFab';
import { useNav } from '../../components/Placeholder';
import { colors, radius, spacing } from '../../theme';

export default function SearchScreen() {
  const nav = useNav();
  const params = (useRoute().params ?? {}) as { categoryId?: string; query?: string };
  const [query, setQuery] = useState(params.query ?? '');
  const [categoryId, setCategoryId] = useState<string | undefined>(params.categoryId);
  const [cats, setCats] = useState<Category[]>([]);
  const [list, setList] = useState<Restaurant[] | null>(null);

  useEffect(() => { api.getCategories().then(setCats); }, []);

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
      <View style={s.box}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput style={s.input} value={query} onChangeText={setQuery} placeholder="Tìm quán hoặc món (vd: trà sữa)" autoFocus={!params.categoryId} />
        {!!query && <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setQuery('')} />}
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          <Chip label="Tất cả" active={!categoryId} onPress={() => setCategoryId(undefined)} />
          {cats.map((c) => (
            <Chip key={c.id} label={c.name} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
          ))}
        </ScrollView>
      </View>

      {!list ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 90 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="search-outline" size={48} color={colors.muted} />
              <Text style={s.emptyText}>Không tìm thấy kết quả phù hợp</Text>
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
  box: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, margin: spacing.lg, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm },
  chips: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: colors.muted, marginTop: spacing.md },
});
