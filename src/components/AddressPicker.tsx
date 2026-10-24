import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';

const HANOI: Region = { latitude: 21.0285, longitude: 105.8542, latitudeDelta: 0.12, longitudeDelta: 0.12 };
export type PickedAddress = { address: string; latitude: number; longitude: number; placeId: string };
type Feature = { properties: { name?: string; street?: string; housenumber?: string; district?: string; city?: string; state?: string; country?: string; osm_id?: string }; geometry: { coordinates: [number, number] } };

export default function AddressPicker({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (place: PickedAddress) => void }) {
  const map = useRef<MapView>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Feature[]>([]);
  const [selected, setSelected] = useState<PickedAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || query.trim().length < 3) { setResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${HANOI.latitude}&lon=${HANOI.longitude}&limit=6&lang=vi`;
        const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'GrabFoodClient/1.0' } });
        if (!response.ok) throw new Error('Chưa tìm được địa chỉ. Thử lại sau nhé.');
        const data = await response.json(); setResults(data.features ?? []);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Lỗi kết nối dịch vụ tìm kiếm.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, visible]);

  const choose = (feature: Feature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const p = feature.properties;
    const address = [p.housenumber, p.street || p.name, p.district, p.city || p.state, p.country].filter(Boolean).join(', ');
    const place = { address, latitude, longitude, placeId: String(p.osm_id ?? `${latitude},${longitude}`) };
    setSelected(place); setQuery(address); setResults([]);
    map.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 450);
  };
  const close = () => { setQuery(''); setResults([]); setSelected(null); setError(''); onClose(); };

  return <Modal visible={visible} animationType="slide" onRequestClose={close}>
    <View style={styles.container}>
      <View style={styles.header}><Pressable onPress={close}><Text style={styles.cancel}>Đóng</Text></Pressable><Text style={styles.heading}>Chọn địa chỉ</Text><View style={{ width: 42 }} /></View>
      <TextInput value={query} onChangeText={setQuery} placeholder="Tìm địa chỉ ở Hà Nội…" placeholderTextColor="#82908a" style={styles.search} />
      {loading && <ActivityIndicator color="#00a86b" style={{ margin: 8 }} />}{!!error && <Text style={styles.error}>{error}</Text>}
      {results.length > 0 && <View style={styles.results}>{results.map((item) => <Pressable key={String(item.properties.osm_id) + item.geometry.coordinates.join(',')} onPress={() => choose(item)} style={styles.result}><Text style={styles.resultTitle}>{item.properties.name || item.properties.street || 'Địa điểm'}</Text><Text style={styles.resultSubtitle}>{[item.properties.street, item.properties.district, item.properties.city || item.properties.state].filter(Boolean).join(', ')}</Text></Pressable>)}</View>}
      <MapView ref={map} style={styles.map} initialRegion={HANOI} onPress={(event) => { const { latitude, longitude } = event.nativeEvent.coordinate; setSelected({ address: query || 'Vị trí đã chọn trên bản đồ', latitude, longitude, placeId: '' }); }}>
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} {...({ userAgent: "GrabFoodClient/1.0" } as object)} />
        {selected && <Marker coordinate={{ latitude: selected.latitude, longitude: selected.longitude }} />}
      </MapView>
      <Text style={styles.attribution}>© OpenStreetMap contributors · Tìm kiếm: Photon / komoot</Text>
      <Pressable disabled={!selected} onPress={() => selected && onSelect(selected)} style={[styles.confirm, !selected && { opacity: 0.5 }]}><Text style={styles.confirmText}>Dùng địa chỉ này</Text></Pressable>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff', paddingTop: 44 }, header: { height: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }, heading: { fontSize: 17, fontWeight: '800', color: '#18211d' }, cancel: { color: '#16865b', fontWeight: '700' }, search: { margin: 14, paddingHorizontal: 14, height: 48, borderRadius: 12, backgroundColor: '#f1f5f2', color: '#18211d' }, error: { color: '#b42318', paddingHorizontal: 16, fontSize: 12 }, results: { marginHorizontal: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5eae7', zIndex: 2, maxHeight: 220 }, result: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5eae7' }, resultTitle: { color: '#18211d', fontWeight: '700' }, resultSubtitle: { color: '#69756e', fontSize: 12, marginTop: 3 }, map: { flex: 1, marginTop: 8 }, attribution: { textAlign: 'center', color: '#69756e', fontSize: 10, padding: 6 }, confirm: { margin: 14, backgroundColor: '#00a86b', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' }, confirmText: { color: '#fff', fontWeight: '800' } });
