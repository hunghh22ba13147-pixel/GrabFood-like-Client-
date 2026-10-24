import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../theme';

const HANOI: Region = { latitude: 21.0285, longitude: 105.8542, latitudeDelta: 0.08, longitudeDelta: 0.08 };

export type PickedAddress = { address: string; latitude: number; longitude: number; placeId: string };

type PlaceResult = {
  placeId: string;
  name: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
};

// Danh sách địa chỉ mẫu phổ biến tại Hà Nội & TP.HCM để người dùng bấm chọn nhanh 1-chạm
const QUICK_SUGGESTIONS: PlaceResult[] = [
  {
    placeId: 's1',
    name: 'Ngõ Hoà Bình 7, Minh Khai',
    fullAddress: 'Ngõ Hoà Bình 7, Phố Minh Khai, Hai Bà Trưng, Hà Nội',
    latitude: 20.9984,
    longitude: 105.8625,
  },
  {
    placeId: 's2',
    name: 'Đại học Bách Khoa Hà Nội',
    fullAddress: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
    latitude: 21.0049,
    longitude: 105.8431,
  },
  {
    placeId: 's3',
    name: 'Hồ Hoàn Kiếm (Bờ Hồ)',
    fullAddress: 'Phố Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm, Hà Nội',
    latitude: 21.0287,
    longitude: 105.8523,
  },
  {
    placeId: 's4',
    name: '1 Lê Lợi, Bến Nghé, Quận 1',
    fullAddress: '1 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    latitude: 10.7769,
    longitude: 106.7009,
  },
  {
    placeId: 's5',
    name: 'Tòa nhà Landmark 81',
    fullAddress: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    latitude: 10.795,
    longitude: 106.7218,
  },
];

export default function AddressPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: PickedAddress) => void;
}) {
  const map = useRef<MapView>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<PickedAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    if (query.trim().length < 2) {
      setResults([]);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        // Sử dụng API tìm kiếm Nominatim OpenStreetMap chính xác, hỗ trợ tiếng Việt toàn diện
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&countrycodes=vn&addressdetails=1&limit=6`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'GrabFoodClientDemo/1.0 (contact@grabfooddemo.internal)',
            'Accept-Language': 'vi',
          },
        });

        if (!response.ok) throw new Error('Dịch vụ tìm kiếm đang bận, bạn thử lại nhé.');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const list: PlaceResult[] = data.map((item: any) => ({
            placeId: String(item.place_id),
            name: item.name || item.display_name.split(',')[0],
            fullAddress: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          }));
          setResults(list);
        } else {
          setResults([]);
          setError('Không tìm thấy địa chỉ phù hợp. Bạn thử gõ tên đường hoặc chọn trên bản đồ.');
        }
      } catch (e: any) {
        if (!controller.signal.aborted) {
          setError(e.message || 'Lỗi kết nối tìm kiếm địa chỉ.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, visible]);

  const chooseItem = (item: PlaceResult) => {
    Keyboard.dismiss();
    const place: PickedAddress = {
      address: item.fullAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      placeId: item.placeId,
    };
    setSelected(place);
    setQuery(item.name || item.fullAddress);
    setResults([]);
    map.current?.animateToRegion(
      {
        latitude: item.latitude,
        longitude: item.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400
    );
  };

  const handleUseCurrentTypedAddress = () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    const place: PickedAddress = {
      address: query.trim(),
      latitude: selected?.latitude || HANOI.latitude,
      longitude: selected?.longitude || HANOI.longitude,
      placeId: `custom-${Date.now()}`,
    };
    onSelect(place);
    close();
  };

  const close = () => {
    setQuery('');
    setResults([]);
    setSelected(null);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={close} hitSlop={10}>
            <Text style={styles.cancel}>Đóng</Text>
          </Pressable>
          <Text style={styles.heading}>Chọn địa chỉ giao hàng</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Ô nhập địa chỉ */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nhập địa chỉ (vd: Minh Khai, Cầu Giấy...)"
            placeholderTextColor="#82908a"
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); }} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Nút bấm nhanh nếu người dùng gõ địa chỉ cụ thể và muốn dùng luôn */}
        {query.trim().length > 3 && (
          <TouchableOpacity
            style={styles.useTypedBtn}
            onPress={handleUseCurrentTypedAddress}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.useTypedText} numberOfLines={1}>
              Dùng trực tiếp: <Text style={{ fontWeight: '800' }}>"{query}"</Text>
            </Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 6 }} />}
        {!!error && <Text style={styles.error}>{error}</Text>}

        {/* Danh sách kết quả gợi ý tìm kiếm */}
        {results.length > 0 && (
          <View style={styles.resultsCard}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
              {results.map((item) => (
                <TouchableOpacity
                  key={item.placeId}
                  onPress={() => chooseItem(item)}
                  style={styles.resultItem}
                >
                  <Ionicons name="location-outline" size={18} color={colors.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.resultTitle}>{item.name}</Text>
                    <Text style={styles.resultSubtitle} numberOfLines={2}>
                      {item.fullAddress}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mục gợi ý địa chỉ nhanh */}
        {results.length === 0 && !loading && (
          <View style={styles.quickWrap}>
            <Text style={styles.quickLabel}>Gợi ý nhanh:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {QUICK_SUGGESTIONS.map((sug) => (
                <TouchableOpacity
                  key={sug.placeId}
                  style={styles.quickChip}
                  onPress={() => chooseItem(sug)}
                >
                  <Ionicons name="compass-outline" size={14} color={colors.primary} />
                  <Text style={styles.quickChipText}>{sug.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bản đồ tương tác */}
        <View style={{ flex: 1, position: 'relative' }}>
          <MapView
            ref={map}
            style={styles.map}
            initialRegion={HANOI}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              setSelected({
                address: query || 'Vị trí ghim trên bản đồ',
                latitude,
                longitude,
                placeId: `pin-${Date.now()}`,
              });
            }}
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              {...({ userAgent: 'GrabFoodClientDemo/1.0' } as object)}
            />
            {selected && (
              <Marker
                coordinate={{ latitude: selected.latitude, longitude: selected.longitude }}
                title="Vị trí nhận đồ ăn"
                description={selected.address}
              />
            )}
          </MapView>
          <View style={styles.mapInstruction}>
            <Text style={styles.mapInstructionText}>💡 Chạm vào bản đồ để ghim vị trí nhận hàng</Text>
          </View>
        </View>

        {/* Nút chốt địa chỉ */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            disabled={!selected && !query.trim()}
            onPress={() => {
              if (selected) {
                onSelect(selected);
                close();
              } else if (query.trim()) {
                handleUseCurrentTypedAddress();
              }
            }}
            style={[styles.confirm, !selected && !query.trim() && { opacity: 0.5 }]}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmText}>
              {selected
                ? `Giao đến: ${selected.address.slice(0, 32)}...`
                : query.trim()
                ? `Xác nhận: ${query.trim().slice(0, 28)}...`
                : 'Chọn một địa điểm để tiếp tục'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 48 },
  header: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  heading: { fontSize: 16, fontWeight: '800', color: colors.text },
  cancel: { color: colors.primary, fontWeight: '700', fontSize: 15 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 14 },

  useTypedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  useTypedText: { marginLeft: 6, fontSize: 13, color: colors.primaryDark, flex: 1 },

  error: { color: colors.danger, paddingHorizontal: 16, fontSize: 12, marginBottom: 6 },

  resultsCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
    zIndex: 10,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  resultSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },

  quickWrap: { paddingBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, marginLeft: 14, marginBottom: 4 },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginRight: 8,
  },
  quickChipText: { fontSize: 12, color: colors.text, fontWeight: '600', marginLeft: 4 },

  map: { flex: 1 },
  mapInstruction: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  mapInstructionText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  bottomBar: { padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  confirm: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14, paddingHorizontal: 12 },
});
