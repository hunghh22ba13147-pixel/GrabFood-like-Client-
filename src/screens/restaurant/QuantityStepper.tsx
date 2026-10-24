import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}

export default function QuantityStepper({ quantity, onChange, min = 1 }: QuantityStepperProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, quantity <= min && styles.btnDisabled]}
        onPress={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
      >
        <Ionicons name="remove" size={18} color={quantity <= min ? colors.muted : colors.text} />
      </Pressable>
      <Text style={styles.value}>{quantity}</Text>
      <Pressable style={styles.btn} onPress={() => onChange(quantity + 1)}>
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  btnDisabled: { opacity: 0.5 },
  value: { minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
});
