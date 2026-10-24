import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useOrderStore, STATUS_LABEL } from '../stores/orderStore';

const getTotal = (o: any) =>
  o.total ?? o.finalTotal ?? (o.subtotal + o.deliveryFee - (o.discount || 0));

export default function OrderHistoryScreen() {
  const orders = useOrderStore((s) => s.orders);
  const [tab, setTab] = useState<'delivering' | 'completed'>('delivering');

  const delivering = orders.filter((o) => o.status !== 'completed');
  const completed = orders.filter((o) => o.status === 'completed');
  const data = tab === 'delivering' ? delivering : completed;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng của tôi</Text>

      {/* 2 tab */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'delivering' && styles.tabActive]}
          onPress={() => setTab('delivering')}
        >
          <Text style={[styles.tabText, tab === 'delivering' && styles.tabTextActive]}>
            Đang giao ({delivering.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'completed' && styles.tabActive]}
          onPress={() => setTab('completed')}
        >
          <Text style={[styles.tabText, tab === 'completed' && styles.tabTextActive]}>
            Đã hoàn tất ({completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn nào</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.restaurant}>{item.restaurant?.name ?? 'Quán ăn'}</Text>
            <Text style={styles.info}>
              {item.items?.length ?? 0} món • {new Date(item.createdAt).toLocaleString('vi-VN')}
            </Text>
            <Text style={styles.info}>Trạng thái: {STATUS_LABEL[item.status]}</Text>
            <Text style={styles.total}>{getTotal(item).toLocaleString('vi-VN')}đ</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 16, borderRadius: 8, overflow: 'hidden' },
  tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#eee' },
  tabActive: { backgroundColor: '#00B14F' },
  tabText: { color: '#333', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: { backgroundColor: '#f7f7f7', borderRadius: 12, padding: 14, marginBottom: 10 },
  restaurant: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  info: { fontSize: 13, color: '#666', marginBottom: 2 },
  total: { fontSize: 16, fontWeight: 'bold', color: '#00B14F', marginTop: 4 },
});