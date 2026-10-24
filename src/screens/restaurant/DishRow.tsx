import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dish } from '../../models/types';
import { colors, formatVND, radius, spacing } from '../../theme';

interface DishRowProps {
  dish: Dish;
  onPress: (dish: Dish) => void;
}

export default function DishRow({ dish, onPress }: DishRowProps) {
  return (
    <Pressable style={styles.row} onPress={() => onPress(dish)}>
      <View style={styles.info}>
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {dish.description}
        </Text>
        <Text style={styles.price}>{formatVND(dish.price)}</Text>
      </View>
      <View>
        <Image source={{ uri: dish.image }} style={styles.image} />
        <View style={styles.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  desc: { color: colors.muted, marginTop: 4, fontSize: 13 },
  price: { marginTop: spacing.sm, fontWeight: '700', color: colors.text },
  image: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.border },
  addBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
