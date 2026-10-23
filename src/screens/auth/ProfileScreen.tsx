import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import AddressPicker, { PickedAddress } from '../../components/AddressPicker';

const EMPTY_ADDRESS = 'Chưa thêm địa chỉ giao hàng';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [label, setLabel] = useState('Nhà');
  const [newAddress, setNewAddress] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [pickedAddress, setPickedAddress] = useState<PickedAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const addresses = user?.addresses ?? (user?.address && user.address !== EMPTY_ADDRESS
    ? [{ id: 'legacy-home', label: 'Địa chỉ đã lưu', address: user.address }]
    : []);

  useEffect(() => { setName(user?.name ?? ''); setPhone(user?.phone ?? ''); }, [user?.id]);

  const saveProfile = async () => {
    if (name.trim().length < 2) return Alert.alert('Tên chưa hợp lệ', 'Tên cần có ít nhất 2 ký tự.');
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      Alert.alert('Đã lưu', 'Thông tin cá nhân đã được cập nhật.');
    } catch { Alert.alert('Chưa lưu được', 'Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const addAddress = async () => {
    const cleanLabel = label.trim(); const cleanAddress = newAddress.trim();
    if (!cleanLabel || !cleanAddress) return Alert.alert('Thiếu thông tin', 'Nhập tên gợi nhớ và địa chỉ đầy đủ.');
    const next = [...addresses, { id: `address-${Date.now()}`, label: cleanLabel, address: cleanAddress, ...(pickedAddress ? { latitude: pickedAddress.latitude, longitude: pickedAddress.longitude, placeId: pickedAddress.placeId } : {}) }];
    setSaving(true);
    try {
      await updateProfile({ addresses: next, address: addresses.length ? (user?.address ?? EMPTY_ADDRESS) : cleanAddress });
      setNewAddress(''); setLabel('Nhà'); setPickedAddress(null); setShowAddressForm(false);
    } catch { Alert.alert('Chưa lưu được', 'Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const chooseAddress = async (selected: string) => {
    try { await updateProfile({ address: selected, addresses }); }
    catch { Alert.alert('Chưa lưu được', 'Vui lòng thử lại.'); }
  };

  const removeAddress = (id: string) => Alert.alert('Xóa địa chỉ', 'Bạn muốn xóa địa chỉ này khỏi sổ?', [
    { text: 'Giữ lại', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: async () => {
      const next = addresses.filter((item) => item.id !== id);
      const selectedWasRemoved = addresses.find((item) => item.id === id)?.address === user?.address;
      await updateProfile({ addresses: next, address: selectedWasRemoved ? (next[0]?.address ?? EMPTY_ADDRESS) : (user?.address ?? EMPTY_ADDRESS) });
    } },
  ]);

  const signOut = () => Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất khỏi tài khoản này không?', [
    { text: 'Ở lại', style: 'cancel' },
    { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } },
  ]);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Tài khoản</Text><Text style={styles.subtitle}>Quản lý thông tin và địa chỉ giao hàng của bạn.</Text>
    <View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>{(name.trim()[0] || 'G').toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.profileName}>{name || 'Thành viên GrabFood'}</Text><Text style={styles.profileEmail}>{user?.email ?? ''}</Text></View><Text style={styles.badge}>DEMO</Text></View>
    <Text style={styles.section}>Thông tin cá nhân</Text>
    <Field label="Họ và tên" value={name} onChangeText={setName} placeholder="Tên của bạn" />
    <Field label="Số điện thoại" value={phone} onChangeText={setPhone} placeholder="Thêm số điện thoại" keyboardType="phone-pad" />
    <Pressable disabled={saving} onPress={saveProfile} style={[styles.save, saving && { opacity: 0.6 }]}><Text style={styles.saveText}>{saving ? 'Đang lưu…' : 'Lưu thông tin'}</Text></Pressable>

    <View style={styles.addressHeading}><View><Text style={styles.section}>Sổ địa chỉ</Text><Text style={styles.helper}>Chọn địa chỉ dùng mặc định khi đặt món.</Text></View><Pressable onPress={() => setShowAddressForm((shown) => !shown)} style={styles.addButton}><Text style={styles.addButtonText}>{showAddressForm ? 'Đóng' : '+ Thêm'}</Text></Pressable></View>
    {addresses.length === 0 && <View style={styles.empty}><Text style={styles.emptyTitle}>Chưa có địa chỉ nào</Text><Text style={styles.helper}>Thêm địa chỉ nhà, trường học hoặc nơi làm việc.</Text></View>}
    {addresses.map((item) => {
      const selected = item.address === user?.address;
      return <View key={item.id} style={[styles.addressCard, selected && styles.addressSelected]}>
        <View style={styles.addressTop}><Text style={styles.addressLabel}>{item.label}</Text>{selected && <Text style={styles.defaultBadge}>MẶC ĐỊNH</Text>}</View>
        <Text style={styles.addressText}>{item.address}</Text>
        <View style={styles.addressActions}>{!selected && <Pressable onPress={() => chooseAddress(item.address)}><Text style={styles.actionText}>Dùng địa chỉ này</Text></Pressable>}<Pressable onPress={() => removeAddress(item.id)}><Text style={styles.deleteText}>Xóa</Text></Pressable></View>
      </View>;
    })}
    {showAddressForm && <View style={styles.form}><Text style={styles.formTitle}>Địa chỉ mới</Text><Field label="Tên gợi nhớ" value={label} onChangeText={setLabel} placeholder="Nhà, Trường, Văn phòng…"/><Field label="Địa chỉ đầy đủ" value={newAddress} onChangeText={(value) => { setNewAddress(value); setPickedAddress(null); }} placeholder="Số nhà, đường, phường/quận" multiline/><Pressable onPress={() => setShowAddressPicker(true)} style={styles.mapButton}><Text style={styles.mapButtonText}>Chọn trên bản đồ</Text></Pressable><Pressable disabled={saving} onPress={addAddress} style={styles.save}><Text style={styles.saveText}>{saving ? 'Đang lưu…' : 'Lưu địa chỉ'}</Text></Pressable></View>}
    <AddressPicker visible={showAddressPicker} onClose={() => setShowAddressPicker(false)} onSelect={(place) => { setPickedAddress(place); setNewAddress(place.address); setShowAddressPicker(false); }} />
    <View style={styles.info}><Text style={styles.infoTitle}>Tài khoản demo</Text><Text style={styles.infoText}>Thông tin và địa chỉ được lưu trên thiết bị này. Ứng dụng chưa kết nối dịch vụ trực tuyến.</Text></View>
    <Pressable onPress={signOut} style={styles.logout}><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
  </ScrollView>;
}

function Field(props: { label: string; value: string; onChangeText: (text: string) => void; placeholder: string; keyboardType?: 'phone-pad'; multiline?: boolean }) {
  const { label, ...inputProps } = props;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...inputProps} style={[styles.input, props.multiline && styles.multiline]} placeholderTextColor="#9aa49e" /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, content: { padding: 20, paddingBottom: 32 }, title: { fontSize: 25, fontWeight: '900', color: colors.text, marginTop: 8 }, subtitle: { fontSize: 13, color: colors.muted, marginTop: 5, marginBottom: 18 },
  profileCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 23, fontWeight: '900', color: colors.primary }, profileName: { fontSize: 15, fontWeight: '800', color: colors.text }, profileEmail: { fontSize: 12, color: colors.muted, marginTop: 3 }, badge: { fontSize: 9, fontWeight: '800', color: colors.primary, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  section: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 23, marginBottom: 3 }, field: { marginTop: 13 }, label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 7 }, input: { minHeight: 48, paddingHorizontal: 13, borderRadius: radius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 14 }, multiline: { minHeight: 76, paddingTop: 13, textAlignVertical: 'top' },
  save: { height: 48, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, saveText: { fontSize: 14, fontWeight: '800', color: '#fff' }, addressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, helper: { fontSize: 11, color: colors.muted, marginTop: 4 }, addButton: { backgroundColor: colors.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }, addButtonText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12 },
  empty: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16 }, emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 13 }, addressCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 10 }, addressSelected: { borderColor: colors.primary, backgroundColor: '#fbfffc' }, addressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, addressLabel: { color: colors.text, fontWeight: '800', fontSize: 13 }, defaultBadge: { color: colors.primaryDark, backgroundColor: colors.primaryLight, fontSize: 9, fontWeight: '900', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7 }, addressText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }, addressActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, actionText: { color: colors.primaryDark, fontWeight: '800', fontSize: 11 }, deleteText: { color: colors.danger, fontWeight: '700', fontSize: 11 },
  form: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginTop: 4 }, formTitle: { color: colors.text, fontWeight: '800', fontSize: 14 }, mapButton: { marginTop: 10, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: colors.primaryLight }, mapButtonText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' }, info: { backgroundColor: colors.primaryLight, borderRadius: 14, padding: 14, marginTop: 19 }, infoTitle: { fontSize: 12, fontWeight: '800', color: colors.primaryDark }, infoText: { fontSize: 11, lineHeight: 17, color: colors.text, marginTop: 4 }, logout: { height: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1cccc', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 18 }, logoutText: { color: colors.danger, fontSize: 13, fontWeight: '800' },
});
