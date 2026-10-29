import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
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

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  totalTrips: number;
}

export const DRIVERS: DriverInfo[] = [
  {
    id: 'drv-1',
    name: 'Nguyễn Văn Hùng',
    phone: '0982 123 456',
    vehicle: 'Honda Wave Alpha',
    plate: '29A1-888.88',
    rating: 4.9,
    totalTrips: 1840,
  },
  {
    id: 'drv-2',
    name: 'Trần Đình Trọng',
    phone: '0973 889 912',
    vehicle: 'Yamaha Sirius Fi',
    plate: '29B2-678.39',
    rating: 5.0,
    totalTrips: 2150,
  },
  {
    id: 'drv-3',
    name: 'Lê Hoàng Long',
    phone: '0912 456 789',
    vehicle: 'Honda Vision Trắng',
    plate: '29E1-567.89',
    rating: 4.8,
    totalTrips: 920,
  },
  {
    id: 'drv-4',
    name: 'Phạm Đức Anh',
    phone: '0968 334 556',
    vehicle: 'Honda Lead Vàng',
    plate: '29D1-923.45',
    rating: 4.9,
    totalTrips: 1460,
  },
];

export function getDriverForOrder(orderId?: string): DriverInfo {
  if (!orderId) return DRIVERS[0];
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash * 31 + orderId.charCodeAt(i)) >>> 0;
  }
  return DRIVERS[hash % DRIVERS.length];
}

function getStatusDetails(status: string, driver: DriverInfo): { title: string; subtitle: string; tip: string } {
  switch (status) {
    case 'placed':
      return {
        title: 'Đơn hàng đã được gửi!',
        subtitle: 'Nhà hàng đang kiểm tra thực đơn và xác nhận đơn...',
        tip: 'Vui lòng kiểm tra lại địa chỉ và số điện thoại nhận hàng.',
      };
    case 'preparing':
      return {
        title: 'Nhà hàng đang làm món!',
        subtitle: `Tài xế ${driver.name} đã nhận đơn và đang di chuyển tới quán.`,
        tip: 'Bếp đang nấu theo yêu cầu ghi chú của bạn thật kỹ lưỡng.',
      };
    case 'delivering':
      return {
        title: 'Tài xế đang giao đến bạn!',
        subtitle: `Bác tài ${driver.name} (${driver.vehicle} - ${driver.plate}) đang trên đường tới.`,
        tip: 'Hãy chuẩn bị điện thoại sẵn sàng khi tài xế gọi nhé!',
      };
    case 'completed':
      return {
        title: 'Giao hàng thành công!',
        subtitle: `Đơn hàng đã được tài xế ${driver.name} giao tận tay cho bạn.`,
        tip: 'Chúc bạn có bữa ăn thật ngon miệng!',
      };
    default:
      return {
        title: 'Đang xử lý đơn hàng',
        subtitle: 'Vui lòng chờ trong giây lát...',
        tip: 'Hệ thống đang kết nối tài xế gần bạn nhất.',
      };
  }
}

const RATING_TAGS = [
  'Giao siêu nhanh ⚡',
  'Thân thiện lễ phép 😊',
  'Đóng gói cẩn thận 📦',
  'Món ăn nóng hổi 🍲',
  'Đúng yêu cầu ghi chú 🥢',
];

const QUICK_CHAT_OPTIONS = [
  'Em đứng ở cổng trường ạ 👋',
  'Bác mang lên tầng 3 giúp em nhé 🏢',
  'Đến nơi bác nháy máy em nha 📞',
  'Cho em xin thêm đũa thìa & tương ớt 🥢',
];

export default function OrderTrackingScreen({ route }: any) {
  const { orderId } = route.params;
  const advance = useOrderStore((s) => s.advance);
  const rateOrder = useOrderStore((s) => s.rateOrder);
  const addChatMessage = useOrderStore((s) => s.addChatMessage);
  const allOrders = useOrderStore((s) => s.orders);
  const userId = useAuthStore((s) => s.user?.id);

  // Modal states
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Chat input states
  const [chatText, setChatText] = useState('');
  const [isDriverTyping, setIsDriverTyping] = useState(false);

  // Rating input states
  const [driverStars, setDriverStars] = useState(5);
  const [restaurantStars, setRestaurantStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Giao siêu nhanh ⚡', 'Món ăn nóng hổi 🍲']);
  const [reviewComment, setReviewComment] = useState('');

  const ownedOrders = ordersForUser(allOrders, userId);
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
  const driver = getDriverForOrder(order.id);
  const detail = getStatusDetails(order.status, driver);

  // Gửi tin nhắn cho tài xế kèm giả lập tự động trả lời
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? chatText).trim();
    if (!text || !userId) return;

    addChatMessage(order.id, userId, { text, sender: 'user' });
    setChatText('');
    setIsDriverTyping(true);

    // Bác tài tự động trả lời sau 1.5 giây
    setTimeout(() => {
      if (!useAuthStore.getState().user?.id) return;
      const driverReplies = [
        `Bác ${driver.name} nhận được dặn dò rồi nhé, đồ ăn đang được bọc ấm, bác phi tới ngay đây!`,
        `Ok bạn nhé, bác đang di chuyển theo định vị tới chỗ giao rồi ạ!`,
        `Dạ vâng bạn nhé, tới nơi mình sẽ gọi điện trước 2 phút nha!`,
        `Đã rõ ạ, bác sẽ bảo quán gửi thêm tương ớt và đũa thìa chu đáo cho bạn nhé!`,
      ];
      const reply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
      addChatMessage(order.id, userId, { text: reply, sender: 'driver' });
      setIsDriverTyping(false);
    }, 1500);
  };

  // Gửi đánh giá tài xế & quán
  const handleSubmitRating = () => {
    if (!userId) return;
    rateOrder(order.id, userId, {
      driverRating: driverStars,
      restaurantRating: restaurantStars,
      driverTags: selectedTags,
      comment: reviewComment.trim() || 'Dịch vụ và món ăn rất tuyệt vời!',
      createdAt: Date.now(),
    });
    setShowRatingModal(false);
    const msg = 'Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn giúp GrabFood ngày càng phục vụ tốt hơn.';
    if (Platform.OS === 'web') globalThis.alert(msg);
    else Alert.alert('Đánh giá thành công', msg);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Banner minh họa bản đồ / lộ trình trực quan */}
      <View style={styles.mapSimulation}>
        <View style={styles.mapRouteLine} />
        <View style={styles.mapNodeStart}>
          <Ionicons name="storefront" size={18} color="#fff" />
        </View>
        <View style={styles.mapNodeEnd}>
          <Ionicons name="home" size={18} color="#fff" />
        </View>

        {/* Vị trí tài xế động theo trạng thái */}
        <View
          style={[
            styles.mapRiderMarker,
            currentIdx === 0 && { left: '20%' },
            currentIdx === 1 && { left: '35%' },
            currentIdx === 2 && { left: '60%' },
            currentIdx === 3 && { left: '85%' },
          ]}
        >
          <Ionicons name="bicycle" size={20} color="#fff" />
        </View>

        <View style={styles.mapTag}>
          <Text style={styles.mapTagText}>
            {isDone ? 'Đã giao tới bạn' : `Dự kiến giao: ~${order.restaurant?.etaMin ?? 20} phút`}
          </Text>
        </View>
      </View>

      {/* Trạng thái chính */}
      <View style={styles.statusHero}>
        <View style={styles.heroIconWrap}>
          <Ionicons name={STATUS_ICONS[order.status] ?? 'time-outline'} size={38} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>{detail.title}</Text>
        <Text style={styles.heroSub}>{detail.subtitle}</Text>
        <View style={styles.tipBox}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.tipText}>{detail.tip}</Text>
        </View>
      </View>

      {/* Tiến trình 4 bước */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRow}>
          {STATUS_FLOW.map((s, i) => {
            const isPassed = currentIdx > i;
            const isCurrent = currentIdx === i;
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

      {/* Thẻ thông tin tài xế nhận đơn (Bấm vào xem hồ sơ chi tiết) */}
      {order.status !== 'placed' && (
        <TouchableOpacity
          style={styles.driverCard}
          onPress={() => setShowDriverModal(true)}
          activeOpacity={0.88}
        >
          <View style={styles.driverAvatar}>
            <Ionicons name="bicycle" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
              </View>
            </View>
            <Text style={styles.driverVehicle}>
              {driver.vehicle} • <Text style={{ fontWeight: '700', color: colors.text }}>{driver.plate}</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
              <Text style={styles.driverStats}>{driver.totalTrips.toLocaleString()} chuyến đi</Text>
              <Text style={styles.driverTapHint}>Xem hồ sơ ›</Text>
            </View>
          </View>

          {/* Nút Nhắn tin cho tài xế */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={(e) => {
              e.stopPropagation();
              setShowChatModal(true);
            }}
            activeOpacity={0.8}
            accessibilityLabel={`Nhắn tin cho tài xế ${driver.name}`}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Nút Gọi điện cho tài xế */}
          <TouchableOpacity
            style={styles.callButton}
            onPress={(e) => {
              e.stopPropagation();
              const msg = `Đang kết nối tới bác tài ${driver.name}\nSố điện thoại: ${driver.phone}\n(Tính năng gọi điện mô phỏng)`;
              if (Platform.OS === 'web') globalThis.alert(msg);
              else Alert.alert('Liên hệ tài xế', msg);
            }}
            activeOpacity={0.8}
            accessibilityLabel={`Gọi cho tài xế ${driver.name}`}
          >
            <Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

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

      {/* Đánh giá đơn hàng khi hoàn thành */}
      {isDone && (
        order.rating ? (
          <View style={styles.ratedCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.ratedTitle}>Bạn đã đánh giá đơn hàng này</Text>
            </View>
            <Text style={styles.ratedScores}>
              Tài xế: {order.rating.driverRating} ⭐ • Quán ăn: {order.rating.restaurantRating} ⭐
            </Text>
            {order.rating.comment ? (
              <Text style={styles.ratedComment}>"{order.rating.comment}"</Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.ratingButton}
            onPress={() => setShowRatingModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="star" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={styles.ratingButtonText}>Đánh giá tài xế & quán ăn</Text>
          </TouchableOpacity>
        )
      )}

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

      {/* ======================================================== */}
      {/* 1. MODAL XEM HỒ SƠ TÀI XẾ CHI TIẾT */}
      {/* ======================================================== */}
      <Modal visible={showDriverModal} transparent animationType="fade" onRequestClose={() => setShowDriverModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDriverModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hồ sơ tài xế GrabFood</Text>
              <TouchableOpacity onPress={() => setShowDriverModal(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 14 }}>
              <View style={styles.driverModalAvatar}>
                <Ionicons name="bicycle" size={36} color="#fff" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.driverModalName}>{driver.name}</Text>
                <Ionicons name="shield-checkmark" size={18} color={colors.primary} style={{ marginLeft: 5 }} />
              </View>
              <Text style={styles.driverModalSub}>Đối tác giao nhận tiêu chuẩn Hà Nội</Text>
            </View>

            {/* 3 thẻ chỉ số */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{driver.rating.toFixed(1)} ⭐</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{driver.totalTrips.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Chuyến đi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNum}>99.8%</Text>
                <Text style={styles.statLabel}>Hoàn thành</Text>
              </View>
            </View>

            {/* Thông tin phương tiện */}
            <View style={styles.vehicleInfoBox}>
              <View style={styles.vehicleInfoRow}>
                <Ionicons name="car-outline" size={18} color={colors.muted} />
                <Text style={styles.vehicleInfoLabel}>Phương tiện:</Text>
                <Text style={styles.vehicleInfoVal}>{driver.vehicle}</Text>
              </View>
              <View style={styles.vehicleInfoRow}>
                <Ionicons name="barcode-outline" size={18} color={colors.muted} />
                <Text style={styles.vehicleInfoLabel}>Biển số xe:</Text>
                <Text style={styles.vehicleInfoVal}>{driver.plate}</Text>
              </View>
              <View style={styles.vehicleInfoRow}>
                <Ionicons name="call-outline" size={18} color={colors.muted} />
                <Text style={styles.vehicleInfoLabel}>Điện thoại:</Text>
                <Text style={styles.vehicleInfoVal}>{driver.phone}</Text>
              </View>
            </View>

            {/* Huy hiệu uy tín */}
            <View style={styles.badgeList}>
              <View style={styles.badgePill}><Text style={styles.badgeText}>⚡ Giao siêu tốc</Text></View>
              <View style={styles.badgePill}><Text style={styles.badgeText}>🛡️ Lái xe an toàn</Text></View>
              <View style={styles.badgePill}><Text style={styles.badgeText}>😊 Thân thiện lịch sự</Text></View>
            </View>

            {/* 2 nút hành động lớn */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#3B82F6' }]}
                onPress={() => {
                  setShowDriverModal(false);
                  setShowChatModal(true);
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.modalActionBtnText}>Nhắn tin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const msg = `Đang kết nối tới bác tài ${driver.name}\nSố điện thoại: ${driver.phone}\n(Tính năng gọi điện mô phỏng)`;
                  if (Platform.OS === 'web') globalThis.alert(msg);
                  else Alert.alert('Liên hệ tài xế', msg);
                }}
              >
                <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.modalActionBtnText}>Gọi điện</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* 2. MODAL NHẮN TIN VỚI TÀI XẾ (GRABCHAT) */}
      {/* ======================================================== */}
      <Modal visible={showChatModal} animationType="slide" onRequestClose={() => setShowChatModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.chatModalContainer}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={{ padding: 6 }}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderDriver}>
              <View style={styles.chatAvatarSmall}>
                <Ionicons name="bicycle" size={18} color="#fff" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.chatDriverName}>{driver.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Đang trực tuyến • {driver.plate}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                const msg = `Đang kết nối tới bác tài ${driver.name}\nSố điện thoại: ${driver.phone}\n(Tính năng gọi điện mô phỏng)`;
                if (Platform.OS === 'web') globalThis.alert(msg);
                else Alert.alert('Liên hệ tài xế', msg);
              }}
              style={styles.chatCallIcon}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick reply chips */}
          <View style={styles.quickReplyContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {QUICK_CHAT_OPTIONS.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickChip}
                  onPress={() => handleSendMessage(opt)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickChipText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message List */}
          <ScrollView
            style={styles.chatMessagesScroll}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {(order.chatMessages ?? []).map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.msgBubbleWrap,
                    isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' },
                  ]}
                >
                  <View
                    style={[
                      styles.msgBubble,
                      isMe ? styles.msgBubbleMe : styles.msgBubbleDriver,
                    ]}
                  >
                    <Text style={[styles.msgText, isMe ? { color: '#fff' } : { color: colors.text }]}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={styles.msgTime}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            })}

            {isDriverTyping && (
              <View style={[styles.msgBubbleWrap, { alignItems: 'flex-start' }]}>
                <View style={[styles.msgBubble, styles.msgBubbleDriver, { paddingVertical: 8 }]}>
                  <Text style={{ fontStyle: 'italic', color: colors.muted, fontSize: 13 }}>
                    Bác tài đang nhập tin nhắn... ✍️
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Nhắn tin dặn dò tài xế..."
              placeholderTextColor={colors.muted}
              value={chatText}
              onChangeText={setChatText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.chatSendBtn, !chatText.trim() && { opacity: 0.5 }]}
              onPress={() => handleSendMessage()}
              disabled={!chatText.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* 3. MODAL ĐÁNH GIÁ TÀI XẾ & QUÁN ĂN */}
      {/* ======================================================== */}
      <Modal visible={showRatingModal} transparent animationType="slide" onRequestClose={() => setShowRatingModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowRatingModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {/* Đánh giá tài xế */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingSectionTitle}>1. Bác tài: {driver.name}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setDriverStars(star)} style={{ padding: 4 }}>
                      <Ionicons
                        name={star <= driverStars ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= driverStars ? '#F59E0B' : colors.muted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.starLevelLabel}>
                  {driverStars === 5 ? 'Tuyệt vời (5★)' : driverStars >= 4 ? 'Hài lòng (4★)' : 'Bình thường (3★)'}
                </Text>
              </View>

              {/* Đánh giá quán */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingSectionTitle}>2. Quán ăn: {order.restaurant?.name}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRestaurantStars(star)} style={{ padding: 4 }}>
                      <Ionicons
                        name={star <= restaurantStars ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= restaurantStars ? '#F59E0B' : colors.muted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.starLevelLabel}>
                  {restaurantStars === 5 ? 'Món ngon tuyệt vời (5★)' : restaurantStars >= 4 ? 'Món ngon (4★)' : 'Bình thường (3★)'}
                </Text>
              </View>

              {/* Tags nhận xét nhanh */}
              <Text style={[styles.ratingSectionTitle, { marginTop: 10 }]}>Nhận xét nhanh:</Text>
              <View style={styles.tagsContainer}>
                {RATING_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagItem, isChecked && styles.tagItemActive]}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tagItemText, isChecked && styles.tagItemTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Ô nhập ghi chú */}
              <Text style={[styles.ratingSectionTitle, { marginTop: 12 }]}>Ý kiến chia sẻ thêm:</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Món ăn và bác tài giao hàng thế nào..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitRatingBtn} onPress={handleSubmitRating} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitRatingBtnText}>Gửi đánh giá ngay</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 540, alignSelf: 'center', padding: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: 20 },
  empty: { fontSize: 16, color: colors.muted, marginTop: 12, textAlign: 'center' },

  // Thẻ tài xế
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
    borderWidth: 1,
    borderColor: colors.border,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 3,
  },
  driverVehicle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  driverStats: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  driverTapHint: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  chatButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

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

  // Đánh giá
  ratingButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: radius.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadow,
  },
  ratingButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  ratedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ratedTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginLeft: 6 },
  ratedScores: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 2 },
  ratedComment: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 4 },

  // Common Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 440,
    ...shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.text },

  // Driver Modal Styles
  driverModalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  driverModalName: { fontSize: 18, fontWeight: '800', color: colors.text },
  driverModalSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    paddingVertical: 12,
    marginVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: colors.border },
  vehicleInfoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    padding: 12,
    gap: 8,
    marginVertical: 6,
  },
  vehicleInfoRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleInfoLabel: { fontSize: 13, color: colors.muted, marginLeft: 8, width: 85 },
  vehicleInfoVal: { fontSize: 13, fontWeight: '700', color: colors.text, flex: 1 },
  badgeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8, justifyContent: 'center' },
  badgePill: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  modalActionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Chat Modal Styles
  chatModalContainer: { flex: 1, backgroundColor: colors.bg, maxWidth: 540, width: '100%', alignSelf: 'center' },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 44 : 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  chatHeaderDriver: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
  chatAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDriverName: { fontSize: 15, fontWeight: '800', color: colors.text },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 5 },
  onlineText: { fontSize: 11, color: colors.muted },
  chatCallIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickReplyContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  quickChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipText: { fontSize: 12, fontWeight: '600', color: colors.text },
  chatMessagesScroll: { flex: 1 },
  msgBubbleWrap: { marginVertical: 6 },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  msgBubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  msgBubbleDriver: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  msgText: { fontSize: 14, lineHeight: 19 },
  msgTime: { fontSize: 10, color: colors.muted, marginTop: 3, marginHorizontal: 4 },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Rating Modal Styles
  ratingSection: { marginVertical: 8, alignItems: 'center' },
  ratingSectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  starsRow: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  starLevelLabel: { fontSize: 12, color: '#F59E0B', fontWeight: '700' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  tagItemActive: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  tagItemText: { fontSize: 12, color: colors.muted },
  tagItemTextActive: { color: '#92400E', fontWeight: '700' },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: 'top',
    marginTop: 6,
    minHeight: 65,
  },
  submitRatingBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radius.pill,
    marginTop: 16,
    ...shadow,
  },
  submitRatingBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
