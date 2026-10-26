import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore, ordersForUser, STATUS_FLOW, STATUS_LABEL, AUTO_ADVANCE_SECONDS } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow, spacing, formatVND } from '../../theme';

const getTotal = (o: any) =>
  o.total ?? o.finalTotal ?? (o.subtotal + o.deliveryFee - (o.discount || 0));

const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  placed: 'receipt-outline',
  preparing: 'restaurant-outline',
  delivering: 'bicycle-outline',
  completed: 'checkmark-circle-outline',
};

const STATUS_DETAILS: Record<string, { title: string; subtitle: string; tip: string }> = {
  placed: {
    title: 'Đơn hàng đã được gửi!',
    subtitle: 'Nhà hàng đang kiểm tra thực đơn và xác nhận đơn...',
    tip: 'Bạn có thể hủy đơn miễn phí trước khi nhà hàng chuẩn bị.',
  },
  preparing: {
    title: 'Nhà hàng đang làm món!',
    subtitle: 'Bếp đang nấu theo yêu cầu ghi chú của bạn thật kỹ lưỡng.',
    tip: 'Tài xế GrabFood đang di chuyển tới quán để nhận món.',
  },
  delivering: {
    title: 'Tài xế đang giao đến bạn!',
    subtitle: 'Bác tài Nguyễn Văn Hùng (Xe máy 29A1-888.88) đang trên đường tới.',
    tip: 'Hãy chuẩn bị điện thoại sẵn sàng khi tài xế gọi nhé!',
  },
  completed: {
    title: 'Giao hàng thành công!',
    subtitle: 'Cảm ơn bạn đã lựa chọn đặt đồ ăn tại GrabFood.',
    tip: 'Chúc bạn có bữa ăn thật ngon miệng!',
  },
};

export default function OrderTrackingScreen({ route }: any) {
  const orders = useOrderStore((s) => s.orders);
  const advance = useOrderStore((s) => s.advance);
  const userId = useAuthStore((s) => s.user?.id);

  const ownedOrders = ordersForUser(orders, userId);
  const orderId = route?.params?.orderId ?? ownedOrders[0]?.id;
  const order = ownedOrders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!userId || !order || order.status === 'completed' || AUTO_ADVANCE_SECONDS <= 0) return;
    const t = setInterval(() => {
      if (useAuthStore.getState().user?.id === userId) advance(order.id, userId);
    }, AUTO_ADVANCE_SECONDS * 1000);
    return () => clearInterval(t);
  }, [order?.id, order?.status, userId, advance]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="fast-food-outline" size={64} color={colors.muted} />
        <Text style={styles.empty}>Chưa có đơn hàng nào. Hãy đặt món nhé!</Text>
      </View>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const isDone = order.status === 'completed';
  const detail = STATUS_DETAILS[order.status] || STATUS_DETAILS.placed;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Banner minh họa bản đồ / lộ trình trực quan */}
      <View style={styles.mapSimulation}>
        <View style={styles.mapRouteLine} />
        <View style={styles.mapNodeStart}>
          <Ionicons name="storefront" size={18} color="#fff" />
        </View>
        <View
          style={[
            styles.mapRiderMarker,
            currentIdx === 0 && { left: '16%' },
            currentIdx === 1 && { left: '38%' },
            currentIdx === 2 && { left: '68%' },
            currentIdx === 3 && { left: '88%' },
          ]}
        >
          <Ionicons name="bicycle" size={20} color="#fff" />
        </View>
        <View style={styles.mapNodeEnd}>
          <Ionicons name="home" size={18} color="#fff" />
        </View>
        <View style={styles.mapTag}>
          <Text style={styles.mapTagText}>
            {isDone ? 'Đã giao tới địa chỉ của bạn' : `Dự kiến giao: ${order.restaurant?.etaMin || 20} phút`}
          </Text>
        </View>
      </View>

      {/* Trạng thái chính có biểu tượng sinh động */}
      <View style={styles.statusHero}>
        <View style={[styles.heroIconWrap, isDone && { backgroundColor: colors.primaryLight }]}>
          <Ionicons
            name={STATUS_ICONS[order.status] || 'time-outline'}
            size={36}
            color={colors.primary}
          />
        </View>
        <Text style={styles.heroTitle}>{detail.title}</Text>
        <Text style={styles.heroSub}>{detail.subtitle}</Text>
        <View style={styles.tipBox}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.tipText}>{detail.tip}</Text>
        </View>
      </View>

      {/* Stepper 4 bước chuẩn chỉ */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRow}>
          {STATUS_FLOW.map((s, i) => {
            const isPassed = i < currentIdx || isDone;
            const isCurrent = i === currentIdx && !isDone;
            return (
              <View key={s} style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isPassed && styles.circleDone,
                    isCurrent && styles.circleCurrent,
                    !isPassed && !isCurrent && styles.circleTodo,
                  ]}
                >
                  {isPassed ? (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  ) : (
                    <Text style={[styles.circleText, isCurrent && { color: '#fff' }]}>{i + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (isPassed || isCurrent) && styles.labelDone,
                    isCurrent && { fontWeight: '700' },
                  ]}
                >
                  {STATUS_LABEL[s]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Thông tin nhà hàng & Đơn hàng */}
      <View style={styles.card}>
        <View style={styles.restaurantRow}>
          {order.restaurant?.image ? (
            <Image source={{ uri: order.restaurant.image }} style={styles.restImage} />
          ) : (
            <View style={[styles.restImage, { backgroundColor: colors.primaryLight }]} />
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.restaurant}>{order.restaurant?.name ?? 'Quán ăn'}</Text>
            <Text style={styles.restAddress} numberOfLines={1}>
              {order.restaurant?.address ?? 'Địa chỉ nhà hàng'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeading}>Chi tiết món đã đặt</Text>
        {order.items?.map((it: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemQty}>{it.quantity}x</Text>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text style={styles.itemName}>{it.dish?.name}</Text>
              {it.note ? <Text style={styles.itemNote}>Ghi chú: {it.note}</Text> : null}
            </View>
            <Text style={styles.itemPrice}>{formatVND(it.unitPrice * it.quantity)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.infoValue}>
            {order.paymentMethod === 'cash' ? '💵 Tiền mặt khi nhận hàng' : '💳 Ví điện tử GrabPay (Mô phỏng, không thu tiền thật)'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giao đến:</Text>
          <Text style={styles.infoValue}>{order.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã đơn:</Text>
          <Text style={styles.infoValue}>{order.id}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.total}>{formatVND(getTotal(order))}</Text>
        </View>
      </View>

      {/* Nút bấm chuyển nhanh trạng thái (Dành cho thuyết trình trực tiếp demo) */}
      <TouchableOpacity
        style={[styles.button, isDone && styles.buttonDisabled]}
        onPress={() => { if (userId && useAuthStore.getState().user?.id === userId) advance(order.id, userId); }}
        disabled={isDone}
        activeOpacity={0.8}
      >
        <Ionicons name={isDone ? 'checkmark-circle' : 'play-forward'} size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>
          {isDone ? 'Đơn hàng đã hoàn thành' : 'Chuyển nhanh trạng thái tiếp theo (Demo)'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 540, alignSelf: 'center', padding: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: 20 },
  empty: { fontSize: 16, color: colors.muted, marginTop: 12, textAlign: 'center' },

  // Bản đồ minh họa
  mapSimulation: {
    height: 120,
    backgroundColor: '#EBF5F0',
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#D2EDE0',
    overflow: 'hidden',
  },
  mapRouteLine: {
    position: 'absolute',
    left: 45,
    right: 45,
    height: 4,
    backgroundColor: '#B7E4CD',
    borderRadius: 2,
  },
  mapNodeStart: {
    position: 'absolute',
    left: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8A00',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
  },
  mapNodeEnd: {
    position: 'absolute',
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
  },
  mapRiderMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    top: '35%',
    ...shadow,
  },
  mapTag: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    ...shadow,
  },
  mapTagText: { fontSize: 11, fontWeight: '700', color: colors.text },

  // Status Hero
  statusHero: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  heroSub: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    width: '100%',
  },
  tipText: { fontSize: 12, color: colors.primaryDark, marginLeft: 8, flex: 1, fontWeight: '500' },

  // Stepper
  stepperContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow,
  },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', width: 72 },
  circle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  circleDone: { backgroundColor: colors.primary },
  circleCurrent: { backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.primaryLight },
  circleTodo: { backgroundColor: '#E4E7EB' },
  circleText: { color: colors.muted, fontWeight: 'bold', fontSize: 13 },
  stepLabel: { fontSize: 11, marginTop: 6, textAlign: 'center', color: colors.muted },
  labelDone: { color: colors.primary, fontWeight: '600' },

  // Card chi tiết
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow },
  restaurantRow: { flexDirection: 'row', alignItems: 'center' },
  restImage: { width: 44, height: 44, borderRadius: radius.md },
  restaurant: { fontSize: 16, fontWeight: '700', color: colors.text },
  restAddress: { fontSize: 12, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  itemQty: { fontWeight: '700', color: colors.primary, fontSize: 13 },
  itemName: { fontSize: 13, fontWeight: '600', color: colors.text },
  itemNote: { fontSize: 11, color: colors.muted, fontStyle: 'italic' },
  itemPrice: { fontSize: 13, fontWeight: '600', color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  infoLabel: { fontSize: 13, color: colors.muted },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text, maxWidth: '65%', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  total: { fontSize: 20, fontWeight: '800', color: colors.primary },

  // Nút hành động
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    padding: spacing.md + 2,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  buttonDisabled: { backgroundColor: colors.muted },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
