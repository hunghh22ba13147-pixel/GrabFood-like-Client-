import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';
import {
  HanoiPlace,
  searchHanoiDatabase,
  searchOnlineNominatim,
  HANOI_DATABASE,
} from '../utils/hanoiLocations';

export type PickedAddress = { address: string; latitude: number; longitude: number; placeId: string };

const CATEGORY_CHIPS = ['Tất cả', 'Đại học', 'TTTM & Tòa nhà', 'Khu đô thị', 'Bệnh viện', 'Đường phố'];
const DISTRICT_CHIPS = ['Tất cả quận', 'Cầu Giấy', 'Đống Đa', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Thanh Xuân', 'Nam Từ Liêm', 'Hà Đông', 'Tây Hồ'];

export default function AddressPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: PickedAddress) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HanoiPlace[]>([]);
  const [selected, setSelected] = useState<PickedAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeDistrict, setActiveDistrict] = useState('Tất cả quận');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;

    const trimmed = query.trim();
    const districtFilter = activeDistrict === 'Tất cả quận' ? undefined : activeDistrict;
    const categoryFilter = activeCategory === 'Tất cả' ? undefined : activeCategory;

    // Tìm kiếm tức thời cục bộ
    const localMatches = searchHanoiDatabase(trimmed, districtFilter, categoryFilter);

    if (trimmed.length < 2) {
      setResults(localMatches.slice(0, 10));
      setLoading(false);
      setError('');
      return;
    }

    setResults(localMatches);

    // Kích hoạt tìm trực tuyến
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const timer = setTimeout(async () => {
      try {
        const onlineMatches = await searchOnlineNominatim(trimmed, controller.signal);
        if (!controller.signal.aborted) {
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
            setError('Chưa thấy địa chỉ chính xác. Bạn có thể bấm "Dùng trực tiếp" bên dưới.');
          }
        }
      } catch (e: any) {
        if (!controller.signal.aborted && localMatches.length === 0) {
          setError('Dịch vụ trực tuyến đang bận. Bạn có thể bấm "Dùng trực tiếp".');
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

  const chooseItem = (item: HanoiPlace) => {
    onSelect({
      address: item.fullAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      placeId: item.id,
    });
    close();
  };

  const handleUseCurrentTypedAddress = () => {
    if (!query.trim()) return;
    const raw = query.trim();
    const cleanAddress = raw.toLowerCase().includes('hà nội') || raw.toLowerCase().includes('ha noi')
      ? raw
      : `${raw}, Hà Nội`;

    onSelect({
      address: cleanAddress,
      latitude: 21.0285,
      longitude: 105.8542,
      placeId: `custom-${Date.now()}`,
    });
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={close}>
            <Text style={s.cancel}>Đóng</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.heading}>Chọn địa chỉ (Hà Nội)</Text>
            <Text style={s.subHeading}>Tra cứu toàn bộ quận huyện & địa danh</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        {/* Ô tìm kiếm */}
        <View style={s.searchBox}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm phố, trường học, TTTM, chung cư ở Hà Nội…"
            placeholderTextColor="#82908a"
            style={s.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Thanh lọc Quận & Thể loại */}
        <View style={s.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {DISTRICT_CHIPS.map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[s.filterChip, activeDistrict === dist && s.filterChipActive]}
                onPress={() => setActiveDistrict(dist)}
              >
                <Text style={[s.filterChipText, activeDistrict === dist && s.filterChipTextActive]}>
                  {dist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, marginTop: 6 }}>
            {CATEGORY_CHIPS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[s.catChip, activeCategory === cat && s.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[s.catChipText, activeCategory === cat && s.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nút dùng trực tiếp */}
        {query.trim().length >= 2 && (
          <TouchableOpacity style={s.useTypedBtn} onPress={handleUseCurrentTypedAddress}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={s.useTypedText} numberOfLines={1}>
              Dùng trực tiếp: <Text style={{ fontWeight: '800' }}>"{query.trim()}"</Text>
            </Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator color={colors.primary} style={{ margin: 6 }} />}
        {!!error && <Text style={s.error}>{error}</Text>}

        {/* Danh sách kết quả */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
          {results.map((item) => (
            <TouchableOpacity key={item.id} style={s.resultItem} onPress={() => chooseItem(item)}>
              <View style={s.iconWrap}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.resultTitle}>{item.name}</Text>
                  <Text style={s.districtBadge}>{item.district}</Text>
                </View>
                <Text style={s.resultSubtitle}>{item.fullAddress}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingVertical: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EB',
  },
  cancel: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 16, fontWeight: '800' },
  subHeading: { fontSize: 11, color: colors.primary, fontWeight: '600' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4E7EB',
    ...shadow,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, outlineStyle: 'none' as any },

  filterBar: { marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4E7EB',
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  filterChipTextActive: { color: '#fff', fontWeight: '800' },

  catChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: '#f1f5f3',
    marginRight: 6,
  },
  catChipActive: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary },
  catChipText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  catChipTextActive: { color: colors.primaryDark, fontWeight: '800' },

  useTypedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  useTypedText: { marginLeft: 6, fontSize: 13, color: colors.primaryDark, flex: 1 },

  error: { color: colors.danger, paddingHorizontal: 16, fontSize: 12, marginBottom: 8 },

  resultItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EB',
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
  resultTitle: { fontWeight: '700', fontSize: 14, color: colors.text },
  districtBadge: {
    fontSize: 10,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    fontWeight: '700',
  },
  resultSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
