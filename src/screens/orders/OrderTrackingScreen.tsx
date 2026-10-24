import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useOrderStore, STATUS_FLOW, STATUS_LABEL, AUTO_ADVANCE_SECONDS } from '../../store/orderStore';


const getTotal = (o: any) =>
  o.total ?? o.finalTotal ?? (o.subtotal + o.deliveryFee - (o.discount || 0));

export default function OrderTrackingScreen({ route }: any) {
  const orders = useOrderStore((s) => s.orders);
  const advance = useOrderStore((s) => s.advance);


  const orderId = route?.params?.orderId ?? orders[0]?.id;
  const order = orders.find((o) => o.id === orderId);


  useEffect(() => {
    if (!order || order.status === 'completed' || AUTO_ADVANCE_SECONDS <= 0) return;
    const t = setInterval(() => advance(order.id), AUTO_ADVANCE_SECONDS * 1000);
    return () => clearInterval(t);
  }, [order?.id, order?.status, advance]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Chưa có đơn hàng nào. Hãy đặt món nhé!</Text>
      </View>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const isDone = order.status === 'completed';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Theo dõi đơn hàng</Text>

      {/* Stepper 4 bước */}
      <View style={styles.stepperRow}>
        {STATUS_FLOW.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.circle, i <= currentIdx ? styles.circleDone : styles.circleTodo]}>
              <Text style={styles.circleText}>{i < currentIdx || isDone ? '✓' : i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= currentIdx ? styles.labelDone : styles.labelTodo]}>
              {STATUS_LABEL[s]}
            </Text>
          </View>
        ))}
      </View>

      {/* Thông tin đơn */}
      <View style={styles.card}>
        <Text style={styles.restaurant}>{order.restaurant?.name ?? 'Quán ăn'}</Text>
        <Text style={styles.info}>Số món: {order.items?.length ?? 0}</Text>
        <Text style={styles.info}>Thanh toán: {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Ví điện tử'}</Text>
        <Text style={styles.info}>Giao đến: {order.address}</Text>
        <Text style={styles.info}>Trạng thái: {STATUS_LABEL[order.status]}</Text>
        <Text style={styles.total}>Tổng: {getTotal(order).toLocaleString('vi-VN')}đ</Text>
      </View>


      <TouchableOpacity
        style={[styles.button, isDone && styles.buttonDisabled]}
        onPress={() => advance(order.id)}
        disabled={isDone}
      >
        <Text style={styles.buttonText}>
          {isDone ? 'Đơn đã hoàn thành' : 'Chuyển trạng thái (Demo Mode)'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', width: '100%', maxWidth: 520, alignSelf: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  empty: { fontSize: 16, color: '#888' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  stepItem: { alignItems: 'center', width: 72 },
  circle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  circleDone: { backgroundColor: '#00B14F' },
  circleTodo: { backgroundColor: '#ddd' },
  circleText: { color: '#fff', fontWeight: 'bold' },
  stepLabel: { fontSize: 11, marginTop: 6, textAlign: 'center' },
  labelDone: { color: '#00B14F', fontWeight: '600' },
  labelTodo: { color: '#888' },
  card: { backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16, marginBottom: 24 },
  restaurant: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  info: { fontSize: 14, color: '#555', marginBottom: 4 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#00B14F', marginTop: 8 },
  button: { backgroundColor: '#00B14F', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});