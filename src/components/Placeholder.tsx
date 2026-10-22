import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../theme';

/** Màn hình rỗng dùng tạm - mỗi TV thay bằng UI thật của mình. */
export default function Placeholder({ title, owner, links = [] }: {
  title: string; owner: string; links?: { label: string; go: () => void }[];
}) {
  return (
    <View style={s.root}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.owner}>Phụ trách: {owner}</Text>
      {links.map((l) => (
        <Pressable key={l.label} style={s.btn} onPress={l.go}>
          <Text style={s.btnText}>{l.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
export const useNav = () => useNavigation<any>();

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  owner: { color: colors.muted, marginBottom: spacing.xl, marginTop: spacing.xs },
  btn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill, marginVertical: spacing.xs },
  btnText: { color: '#fff', fontWeight: '600' },
});
