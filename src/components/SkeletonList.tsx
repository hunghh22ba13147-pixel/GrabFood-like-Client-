import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

/** Khung xương nhấp nháy thay cho spinner khi đang tải danh sách quán. */
export default function SkeletonList({ count = 3 }: { count?: number }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={{ padding: spacing.lg }}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[s.card, { opacity: pulse }]}>
          <View style={s.img} />
          <View style={[s.line, { width: '60%' }]} />
          <View style={[s.line, { width: '40%' }]} />
        </Animated.View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  img: { height: 130, borderRadius: radius.md, backgroundColor: colors.border },
  line: { height: 12, borderRadius: 6, backgroundColor: colors.border, marginTop: spacing.md },
});
