import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../../models/types';
import { colors, formatVND, radius, spacing } from '../../theme';

interface RestaurantHeroProps {
  restaurant: Restaurant;
}

export default function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  return (
    <View>
      <Image source={{ uri: restaurant.image }} style={styles.cover} />
      <View style={styles.card}>
        <Text style={styles.name}>{restaurant.name}</Text>
        {restaurant.promo ? (
          <View style={styles.promo}>
            <Text style={styles.promoText}>{restaurant.promo}</Text>
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color={colors.star} />
          <Text style={styles.meta}>
            {restaurant.rating} ({restaurant.reviewCount})
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{restaurant.distanceKm} km</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{restaurant.etaMin} phút</Text>
        </View>
        <Text style={styles.address}>{restaurant.address}</Text>
        <Text style={styles.fee}>Phí giao hàng {formatVND(restaurant.deliveryFee)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 180, backgroundColor: colors.border },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: -24,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  promo: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  promoText: { color: colors.primaryDark, fontWeight: '600', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 4 },
  meta: { color: colors.text, fontSize: 13 },
  dot: { color: colors.muted },
  address: { color: colors.muted, marginTop: spacing.sm, fontSize: 13 },
  fee: { color: colors.primaryDark, marginTop: spacing.xs, fontWeight: '600' },
});
