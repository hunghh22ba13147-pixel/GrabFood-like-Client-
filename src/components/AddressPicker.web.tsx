import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// Bản web: react-native-maps không chạy trên web nên chỉ tìm địa chỉ bằng danh sách (không có bản đồ).
const HANOI = { latitude: 21.0285, longitude: 105.8542 };
export type PickedAddress = { address: string; latitude: number; longitude: number; placeId: string };
type Feature = { properties: { name?: string; street?: string; housenumber?: string; district?: string; city?: string; state?: string; country?: string; osm_id?: string }; geometry: { coordinates: [number, number] } };

export default function AddressPicker({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (place: PickedAddress) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || query.trim().length < 3) { setResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${HANOI.latitude}&lon=${HANOI.longitude}&limit=6&lang=vi`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Chưa tìm được địa chỉ. Thử lại sau nhé.');
        const data = await response.json(); setResults(data.features ?? []);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Lỗi kết nối dịch vụ tìm kiếm.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, visible]);

  const close = () => { setQuery(''); setResults([]); setError(''); onClose(); };
  const choose = (feature: Feature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const p = feature.properties;
    const address = [p.housenumber, p.street || p.name, p.district, p.city || p.state, p.country].filter(Boolean).join(', ');
    onSelect({ address, latitude, longitude, placeId: String(p.osm_id ?? `${latitude},${longitude}`) });
    close();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={s.container}>
        <View style={s.header}>
          <Pressable onPress={close}><Text style={s.cancel}>Đóng</Text></Pressable>
          <Text style={s.heading}>Chọn địa chỉ</Text>
          <View style={{ width: 42 }} />
        </View>
        <TextInput value={query} onChangeText={setQuery} placeholder="Nhập địa chỉ (từ 3 ký tự)…" style={s.search} />
        {loading && <ActivityIndicator color="#00B14F" style={{ margin: 8 }} />}
        {!!error && <Text style={s.error}>{error}</Text>}
        {results.map((f, i) => (
          <Pressable key={i} style={s.result} onPress={() => choose(f)}>
            <Text style={s.title}>{f.properties.name || f.properties.street || 'Địa điểm'}</Text>
            <Text style={s.sub}>{[f.properties.street, f.properties.district, f.properties.city || f.properties.state].filter(Boolean).join(', ')}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cancel: { color: '#00B14F', fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '800' },
  search: { borderWidth: 1, borderColor: '#E4E7EB', borderRadius: 12, padding: 12 },
  error: { color: '#E5484D', marginTop: 8 },
  result: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E4E7EB' },
  title: { fontWeight: '700' },
  sub: { color: '#7B8794', marginTop: 2 },
});
