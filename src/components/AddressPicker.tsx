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
import {
  HanoiPlace,
  searchHanoiDatabase,
  searchOnlineNominatim,
  reverseGeocodeHanoi,
  HANOI_DATABASE,
} from '../utils/hanoiLocations';

// Vùng trung tâm Hà Nội
const HANOI: Region = { latitude: 21.0285, longitude: 105.8542, latitudeDelta: 0.08, longitudeDelta: 0.08 };

export type PickedAddress = { address: string; latitude: number; longitude: number; placeId: string };

const CATEGORY_CHIPS = ['Tất cả', 'Đại học', 'TTTM & Tòa nhà', 'Khu đô thị', 'Bệnh viện', 'Đường phố'];
const DISTRICT_CHIPS = ['Tất cả quận', 'Cầu Giấy', 'Đống Đa', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Thanh Xuân', 'Nam Từ Liêm', 'Hà Đông', 'Tây Hồ', 'Bắc Từ Liêm', 'Long Biên'];

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
  const [results, setResults] = useState<HanoiPlace[]>([]);
  const [selected, setSelected] = useState<PickedAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeDistrict, setActiveDistrict] = useState('Tất cả quận');
  const [error, setError] = useState('');

  // 1. Tự động tìm kiếm kết hợp: Cục bộ tức thì (0ms) + Nominatim trực tuyến (300ms debounce)
  useEffect(() => {
    if (!visible) return;

    const trimmed = query.trim();
    const districtFilter = activeDistrict === 'Tất cả quận' ? undefined : activeDistrict;
    const categoryFilter = activeCategory === 'Tất cả' ? undefined : activeCategory;

    // Lấy ngay kết quả cục bộ tức thời trong danh bạ Hà Nội
    const localMatches = searchHanoiDatabase(trimmed, districtFilter, categoryFilter);

    if (trimmed.length < 2) {
      setResults(localMatches.slice(0, 8));
      setLoading(false);
      setError('');
      return;
    }

    setResults(localMatches);

    // Kích hoạt tìm kiếm sâu trực tuyến qua Nominatim (với các địa chỉ, số nhà, ngõ cụ thể)
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const timer = setTimeout(async () => {
      try {
        const onlineMatches = await searchOnlineNominatim(trimmed, controller.signal);
        if (!controller.signal.aborted) {
          // Gộp kết quả cục bộ + trực tuyến, lọc trùng lặp theo tên hoặc tọa độ gần nhau
          const merged = [...localMatches];
          for (const item of onlineMatches) {
            const exists = merged.some(
              (m) =>
                m.name.toLowerCase() === item.name.toLowerCase() ||
                (Math.abs(m.latitude - item.latitude) < 0.0005 &&
                  Math.abs(m.longitude - item.longitude) < 0.0005)
            );
            if (!exists) merged.push(item);
          }

          setResults(merged);
          if (merged.length === 0) {
            setError('Chưa thấy địa chỉ chính xác trên bản đồ. Bạn có thể bấm "Dùng trực tiếp" bên dưới.');
          }
        }
      } catch (e: any) {
        if (!controller.signal.aborted) {
          // Nếu mạng chậm, vẫn giữ nguyên kết quả cục bộ
          if (localMatches.length === 0) {
            setError('Dịch vụ trực tuyến đang bận. Bạn có thể chọn trên bản đồ hoặc dùng trực tiếp.');
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, activeCategory, activeDistrict, visible]);

  // 2. Chọn một địa điểm trong danh sách gợi ý
  const chooseItem = (item: HanoiPlace) => {
    Keyboard.dismiss();
    const place: PickedAddress = {
      address: item.fullAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      placeId: item.id,
    };
    setSelected(place);
    setQuery(item.name);
    map.current?.animateToRegion(
      {
        latitude: item.latitude,
        longitude: item.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      400
    );
  };

  // 3. Chạm trên bản đồ -> Tra cứu ngược địa chỉ thực tế (Reverse Geocoding)
  const handleMapPress = async (latitude: number, longitude: number) => {
    Keyboard.dismiss();
    setIsReverseGeocoding(true);
    setSelected({
      address: 'Đang xác định địa chỉ...',
      latitude,
      longitude,
      placeId: `pin-${Date.now()}`,
    });

    try {
      const geo = await reverseGeocodeHanoi(latitude, longitude);
      const cleanAddress = geo.fullAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Hà Nội`;
      setSelected({
        address: cleanAddress,
        latitude,
        longitude,
        placeId: `pin-${Date.now()}`,
      });
      setQuery(geo.name || cleanAddress);
    } catch {
      setSelected({
        address: `Vị trí tại Hà Nội (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        latitude,
        longitude,
        placeId: `pin-${Date.now()}`,
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // 4. Dùng trực tiếp địa chỉ người dùng tự gõ
  const handleUseCurrentTypedAddress = () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    const raw = query.trim();
    const cleanAddress = raw.toLowerCase().includes('hà nội') || raw.toLowerCase().includes('ha noi')
      ? raw
      : `${raw}, Hà Nội`;

    const place: PickedAddress = {
      address: cleanAddress,
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
    setActiveCategory('Tất cả');
    setActiveDistrict('Tất cả quận');
    onClose();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Đại học':
        return 'school-outline';
      case 'TTTM & Tòa nhà':
        return 'business-outline';
      case 'Khu đô thị':
        return 'home-outline';
      case 'Bệnh viện':
        return 'medkit-outline';
      case 'Danh thắng & Bến xe':
        return 'compass-outline';
      default:
        return 'location-outline';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={close} hitSlop={10}>
            <Text style={styles.cancel}>Đóng</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.heading}>Địa chỉ giao hàng (Hà Nội)</Text>
            <Text style={styles.subHeading}>Tra cứu toàn bộ quận huyện & địa danh Thủ đô</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Ô nhập tìm kiếm địa chỉ */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm phố, trường học, TTTM, chung cư, ngõ ở Hà Nội…"
            placeholderTextColor="#82908a"
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); }} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Thanh lọc Quận huyện & Thể loại */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {DISTRICT_CHIPS.map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[styles.filterChip, activeDistrict === dist && styles.filterChipActive]}
                onPress={() => setActiveDistrict(dist)}
              >
                <Text style={[styles.filterChipText, activeDistrict === dist && styles.filterChipTextActive]}>
                  {dist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, marginTop: 6 }}>
            {CATEGORY_CHIPS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Ionicons
                  name={getCategoryIcon(cat) as any}
                  size={13}
                  color={activeCategory === cat ? colors.primary : colors.muted}
                />
                <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nút bấm nhanh nếu người dùng muốn dùng luôn địa chỉ vừa gõ */}
        {query.trim().length >= 2 && (
          <TouchableOpacity
            style={styles.useTypedBtn}
            onPress={handleUseCurrentTypedAddress}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.useTypedText} numberOfLines={1}>
              Dùng trực tiếp: <Text style={{ fontWeight: '800' }}>"{query.trim()}"</Text>
            </Text>
          </TouchableOpacity>
        )}

        {(loading || isReverseGeocoding) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isReverseGeocoding ? 'Đang nhận diện địa chỉ từ bản đồ...' : 'Đang tìm kiếm...'}
            </Text>
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}

        {/* Danh sách kết quả gợi ý tìm kiếm */}
        {results.length > 0 && (
          <View style={styles.resultsCard}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 210 }}>
              {results.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => chooseItem(item)}
                  style={styles.resultItem}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={getCategoryIcon(item.category) as any} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.districtBadge}>{item.district}</Text>
                    </View>
                    <Text style={styles.resultSubtitle} numberOfLines={2}>
                      {item.fullAddress}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bản đồ tương tác tại Hà Nội */}
        <View style={{ flex: 1, position: 'relative' }}>
          <MapView
            ref={map}
            style={styles.map}
            initialRegion={HANOI}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              handleMapPress(latitude, longitude);
            }}
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              {...({ userAgent: 'GrabFoodHanoiClient/2.0' } as object)}
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
            <Text style={styles.mapInstructionText}>💡 Chạm vào bất kỳ vị trí nào trên bản đồ để nhận diện địa chỉ</Text>
          </View>
        </View>

        {/* Nút chốt địa chỉ */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            disabled={!selected && !query.trim()}
            onPress={() => {
              if (selected && selected.address !== 'Đang xác định địa chỉ...') {
                onSelect(selected);
                close();
              } else if (query.trim()) {
                handleUseCurrentTypedAddress();
              }
            }}
            style={[styles.confirm, !selected && !query.trim() && { opacity: 0.5 }]}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmText} numberOfLines={1}>
              {selected
                ? `Giao đến: ${selected.address}`
                : query.trim()
                ? `Xác nhận: ${query.trim()}`
                : 'Chọn một địa điểm để tiếp tục'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 44 },
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  heading: { fontSize: 16, fontWeight: '800', color: colors.text },
  subHeading: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  cancel: { color: colors.primary, fontWeight: '700', fontSize: 15 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 14 },

  filterBar: { marginBottom: 6 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  filterChipTextActive: { color: '#fff', fontWeight: '800' },

  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: '#f1f5f3',
    marginRight: 6,
  },
  catChipActive: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary },
  catChipText: { fontSize: 11, color: colors.muted, fontWeight: '600', marginLeft: 4 },
  catChipTextActive: { color: colors.primaryDark, fontWeight: '800' },

  useTypedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  useTypedText: { marginLeft: 6, fontSize: 13, color: colors.primaryDark, flex: 1 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 4 },
  loadingText: { marginLeft: 8, fontSize: 12, color: colors.primary, fontWeight: '600' },

  error: { color: colors.danger, paddingHorizontal: 16, fontSize: 12, marginBottom: 4 },

  resultsCard: {
    marginHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
    zIndex: 10,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: { color: colors.text, fontWeight: '700', fontSize: 13, flex: 1, marginRight: 6 },
  districtBadge: {
    fontSize: 10,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    fontWeight: '700',
  },
  resultSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },

  map: { flex: 1 },
  mapInstruction: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
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
    paddingHorizontal: 16,
    ...shadow,
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
