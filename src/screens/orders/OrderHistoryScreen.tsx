import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore, ordersForUser, STATUS_LABEL } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { cartErrorMessage } from '../../store/cartStore';
import { Order } from '../../models/types';
import { reorderOrder } from './reorder';
import { colors, radius, shadow, spacing, formatVND } from '../../theme';

const getTotal = (order: Order) => order.total;

function confirmReplace(restaurant: Order['restaurant']): Promise<boolean> {
  const message = `Bạn muốn thay toàn bộ giỏ hiện tại bằng các món đặt lại từ "${restaurant.name}"? Giá được tính theo thực đơn hiện tại; voucher cũ không được khôi phục.`;
  if (Platform.OS === 'web') return Promise.resolve(globalThis.confirm(message));
  return new Promise((resolve) => Alert.alert('Thay giỏ hàng?', message, [
    { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
    { text: 'Đồng ý', onPress: () => resolve(true) },
  ], { cancelable: true, onDismiss: () => resolve(false) }));
}

export default function OrderHistoryScreen() {
  const nav = useNavigation<any>();
  const orders = useOrderStore((s) => s.orders);
  const currentUser = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'delivering' | 'completed'>('delivering');
  const [reordering, setReordering] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const reorderBusy = useRef(false);

  // Lọc đơn theo tài khoản hiện tại (tránh lẫn đơn giữa các tài khoản)
  const userOrders = ordersForUser(orders, currentUser?.id);

  const delivering = userOrders.filter((o) => o.status !== 'completed');
  const completed = userOrders.filter((o) => o.status === 'completed');
  const data = tab === 'delivering' ? delivering : completed;

  // Xử lý chức năng "Đặt lại đơn" (Re-order)
  const handleReorder = async (order: Order) => {
    if (reorderBusy.current) return;
    reorderBusy.current = true;
    setReordering(order.id);
    setReorderError(null);
    try {
      if (await reorderOrder(order, { getUserId: () => useAuthStore.getState().user?.id ?? null, confirmReplace })) {
        nav.navigate('Cart');
      }
    } catch (error) {
      setReorderError(cartErrorMessage(error));
    } finally {
      reorderBusy.current = false;
      setReordering(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng của tôi</Text>
      {reorderError && <Text accessibilityRole="alert" style={{ color: colors.danger, marginBottom: spacing.md }}>{reorderError}</Text>}

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
                {item.items?.map((it) => `${it.quantity}x ${it.dish?.name}`).join(', ')}
              </Text>
              <View style={styles.footerCard}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.total}>{formatVND(getTotal(item))}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              {item.status === 'completed' && (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.reorderBtn}
                    disabled={reordering !== null}
                    onPress={(e) => {
                      e.stopPropagation();
                      return handleReorder(item);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="repeat" size={15} color={colors.primary} />
                    <Text style={styles.reorderBtnText}>{reordering === item.id ? 'Đang chuẩn bị…' : 'Đặt lại đơn'}</Text>
                  </TouchableOpacity>

                  {item.rating ? (
                    <View style={styles.ratedBadgeSmall}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratedBadgeSmallText}>{item.rating.driverRating}★ Đã đánh giá</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.rateBtnSmall}
                      onPress={(e) => {
                        e.stopPropagation();
                        nav.navigate('OrderTracking', { orderId: item.id });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="star-outline" size={13} color="#92400E" />
                      <Text style={styles.rateBtnSmallText}>Đánh giá</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={styles.viewDetailsRow}>
                <Text style={styles.viewDetailsText}>Chi tiết</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
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

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  headerCard: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#f0f0f0' },
  restaurant: { fontSize: 16, fontWeight: '700', color: colors.text },
  time: { fontSize: 12, color: colors.muted, marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeCompleted: { backgroundColor: '#F5F5F5' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextActive: { color: colors.primary },
  badgeTextCompleted: { color: colors.muted },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  bodyCard: { marginBottom: spacing.xs },
  itemSummary: { fontSize: 13, color: colors.muted, marginBottom: spacing.xs },
  footerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: colors.muted },
  total: { fontSize: 15, fontWeight: '800', color: colors.text },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  reorderBtnText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  viewDetailsText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginRight: 2 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  empty: { fontSize: 14, color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
  ratedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 3,
  },
  ratedBadgeSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  rateBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 3,
  },
  rateBtnSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
});
