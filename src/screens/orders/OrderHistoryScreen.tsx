import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore, STATUS_LABEL } from '../../store/orderStore';
import { colors, radius, shadow, spacing, formatVND } from '../../theme';

const getTotal = (o: any) =>
  o.total ?? o.finalTotal ?? (o.subtotal + o.deliveryFee - (o.discount || 0));

export default function OrderHistoryScreen() {
  const nav = useNavigation<any>();
  const orders = useOrderStore((s) => s.orders);
  const [tab, setTab] = useState<'delivering' | 'completed'>('delivering');

  const delivering = orders.filter((o) => o.status !== 'completed');
  const completed = orders.filter((o) => o.status === 'completed');
  const data = tab === 'delivering' ? delivering : completed;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng của tôi</Text>

      {/* 2 tab lọc */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'delivering' && styles.tabActive]}
          onPress={() => setTab('delivering')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'delivering' && styles.tabTextActive]}>
            Đang giao ({delivering.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'completed' && styles.tabActive]}
          onPress={() => setTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'completed' && styles.tabTextActive]}>
            Lịch sử ({completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={60} color={colors.muted} />
            <Text style={styles.empty}>Chưa có đơn hàng nào trong mục này</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate('OrderTracking', { orderId: item.id })}
            activeOpacity={0.85}
          >
            <View style={styles.headerCard}>
              {item.restaurant?.image ? (
                <Image source={{ uri: item.restaurant.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: colors.primaryLight }]} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.restaurant} numberOfLines={1}>
                  {item.restaurant?.name ?? 'Quán ăn GrabFood'}
                </Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={[styles.badge, item.status === 'completed' ? styles.badgeCompleted : styles.badgeActive]}>
                <Text style={[styles.badgeText, item.status === 'completed' ? styles.badgeTextCompleted : styles.badgeTextActive]}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bodyCard}>
              <Text style={styles.itemSummary} numberOfLines={1}>
                {item.items?.map((it: any) => `${it.quantity}x ${it.dish?.name}`).join(', ')}
              </Text>
              <View style={styles.footerCard}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.total}>{formatVND(getTotal(item))}</Text>
              </View>
            </View>

            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetailsText}>Chi tiết đơn hàng</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg, width: '100%', maxWidth: 540, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: '#E4E7EB',
    borderRadius: radius.pill,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.primary, ...shadow },
  tabText: { color: colors.muted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  emptyWrap: { alignItems: 'center', marginTop: 60 },
  empty: { fontSize: 14, color: colors.muted, marginTop: 12 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    ...shadow,
  },
  headerCard: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.border },
  restaurant: { fontSize: 16, fontWeight: '700', color: colors.text },
  time: { fontSize: 12, color: colors.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeActive: { backgroundColor: colors.primaryLight },
  badgeCompleted: { backgroundColor: '#F0F2F5' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextActive: { color: colors.primaryDark },
  badgeTextCompleted: { color: colors.muted },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  bodyCard: { marginBottom: 6 },
  itemSummary: { fontSize: 13, color: colors.text, marginBottom: 8 },
  footerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: colors.muted },
  total: { fontSize: 16, fontWeight: '800', color: colors.primary },

  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F6F8',
    paddingTop: 8,
  },
  viewDetailsText: { fontSize: 12, fontWeight: '700', color: colors.primary, marginRight: 2 },
});
