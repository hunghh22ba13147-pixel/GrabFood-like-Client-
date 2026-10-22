import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../models/types';
import { colors, formatVND, radius, shadow, spacing } from '../theme';

export default function RestaurantCard({ item, onPress }: { item: Restaurant; onPress: () => void }) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <Image source={{ uri: item.image }} style={s.img} />
      {item.promo && (
        <View style={s.promo}><Text style={s.promoText}>{item.promo}</Text></View>
      )}
      <View style={s.body}>
        <Text style={s.name} numberOfLines={1}>{item.name}</Text>
        <View style={s.row}>
          <Ionicons name="star" size={14} color={colors.star} />
          <Text style={s.meta}> {item.rating.toFixed(1)} ({item.reviewCount})</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.meta}>{item.distanceKm} km</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.meta}>{item.etaMin} phút</Text>
        </View>
        <Text style={s.fee}>Phí giao: {formatVND(item.deliveryFee)}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden', ...shadow },
  img: { width: '100%', height: 150, backgroundColor: colors.border },
  promo: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  promoText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { padding: spacing.md },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { color: colors.muted, fontSize: 13 },
  dot: { color: colors.muted, marginHorizontal: 6 },
  fee: { color: colors.primary, fontSize: 13, marginTop: 4, fontWeight: '600' },
});
