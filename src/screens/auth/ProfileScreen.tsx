import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, formatVND } from '../../theme';
import { useOrderStore, ordersForUser } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { isFirebaseConfigured } from '../../services/firebase';
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
  const allOrders = useOrderStore((s) => s.orders);
  const myOrders = ordersForUser(allOrders, user?.id);
  const totalSpent = myOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const addresses = user?.addresses ?? (user?.address && user.address !== EMPTY_ADDRESS
    ? [{ id: 'legacy-home', label: 'Địa chỉ đã lưu', address: user.address }]
    : []);

  useEffect(() => { setName(user?.name ?? ''); setPhone(user?.phone ?? ''); }, [user?.id]);

  const saveProfile = async () => {
    if (name.trim().length < 2) {
      if (Platform.OS === 'web') globalThis.alert('Tên chưa hợp lệ\nTên cần có ít nhất 2 ký tự.');
      else Alert.alert('Tên chưa hợp lệ', 'Tên cần có ít nhất 2 ký tự.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      if (Platform.OS === 'web') globalThis.alert('Đã lưu thông tin cá nhân thành công.');
      else Alert.alert('Đã lưu', 'Thông tin cá nhân đã được cập nhật.');
    } catch {
      if (Platform.OS === 'web') globalThis.alert('Chưa lưu được. Vui lòng thử lại.');
      else Alert.alert('Chưa lưu được', 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async () => {
    const cleanLabel = label.trim();
    const cleanAddress = newAddress.trim();
    if (!cleanLabel || !cleanAddress) {
      if (Platform.OS === 'web') globalThis.alert('Thiếu thông tin\nNhập tên gợi nhớ và địa chỉ đầy đủ.');
      else Alert.alert('Thiếu thông tin', 'Nhập tên gợi nhớ và địa chỉ đầy đủ.');
      return;
    }
    const next = [
      ...addresses,
      {
        id: `address-${Date.now()}`,
        label: cleanLabel,
        address: cleanAddress,
        ...(pickedAddress ? { latitude: pickedAddress.latitude, longitude: pickedAddress.longitude, placeId: pickedAddress.placeId } : {}),
      },
    ];
    setSaving(true);
    try {
      await updateProfile({ addresses: next, address: addresses.length ? (user?.address ?? EMPTY_ADDRESS) : cleanAddress });
      setNewAddress('');
      setLabel('Nhà');
      setPickedAddress(null);
      setShowAddressForm(false);
    } catch {
      if (Platform.OS === 'web') globalThis.alert('Chưa lưu được địa chỉ. Vui lòng thử lại.');
      else Alert.alert('Chưa lưu được', 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const chooseAddress = async (selected: string) => {
    try {
      await updateProfile({ address: selected, addresses });
    } catch {
      if (Platform.OS === 'web') globalThis.alert('Chưa cập nhật được địa chỉ.');
      else Alert.alert('Chưa lưu được', 'Vui lòng thử lại.');
    }
  };

  const removeAddress = (id: string) => {
    const doDelete = async () => {
      const next = addresses.filter((item) => item.id !== id);
      const selectedWasRemoved = addresses.find((item) => item.id === id)?.address === user?.address;
      try {
        await updateProfile({
          addresses: next,
          address: selectedWasRemoved ? (next[0]?.address ?? EMPTY_ADDRESS) : (user?.address ?? EMPTY_ADDRESS),
        });
      } catch {
        if (Platform.OS === 'web') globalThis.alert('Chưa xóa được địa chỉ. Vui lòng thử lại.');
        else Alert.alert('Chưa xóa được địa chỉ', 'Vui lòng thử lại.');
      }
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm('Bạn muốn xóa địa chỉ này khỏi sổ?')) doDelete();
    } else {
      Alert.alert('Xóa địa chỉ', 'Bạn muốn xóa địa chỉ này khỏi sổ?', [
        { text: 'Giữ lại', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const signOut = () => {
    const doSignOut = async () => {
      try {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } catch {
        const closed = !useAuthStore.getState().user;
        if (closed) navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        const message = closed ? 'Phiên đã đóng nhưng chưa lưu được trạng thái đăng xuất trên máy.' : 'Chưa đăng xuất được. Vui lòng thử lại.';
        if (Platform.OS === 'web') globalThis.alert(message);
        else Alert.alert('Đăng xuất', message);
      }
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm('Bạn có muốn đăng xuất khỏi tài khoản này không?')) doSignOut();
    } else {
      Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất khỏi tài khoản này không?', [
        { text: 'Ở lại', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: doSignOut },
      ]);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tài khoản</Text>
      <Text style={styles.subtitle}>Quản lý thông tin và địa chỉ giao hàng của bạn.</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(name.trim()[0] || 'G').toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{name || 'Thành viên GrabFood'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>
        <Text style={styles.badge}>{isFirebaseConfigured ? 'ONLINE' : 'DEMO'}</Text>
      </View>

      {/* Thống kê hoạt động của tài khoản */}
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <Text style={styles.activityNum}>{myOrders.length}</Text>
          <Text style={styles.activityLabel}>Đơn đã đặt</Text>
        </View>
        <View style={styles.activityDivider} />
        <View style={styles.activityItem}>
          <Text style={styles.activityNum}>{myOrders.filter((o) => o.status === 'completed').length}</Text>
          <Text style={styles.activityLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.activityDivider} />
        <View style={styles.activityItem}>
          <Text style={styles.activityNum}>{formatVND(totalSpent)}</Text>
          <Text style={styles.activityLabel}>Tổng chi tiêu</Text>
        </View>
      </View>

      <Text style={styles.section}>Thông tin cá nhân</Text>
      <Field label="Họ và tên" value={name} onChangeText={setName} placeholder="Tên của bạn" />
      <Field label="Số điện thoại" value={phone} onChangeText={setPhone} placeholder="Thêm số điện thoại" keyboardType="phone-pad" />
      <Pressable disabled={saving} onPress={saveProfile} style={[styles.save, saving && { opacity: 0.6 }]}>
        <Text style={styles.saveText}>{saving ? 'Đang lưu…' : 'Lưu thông tin'}</Text>
      </Pressable>

      <View style={styles.addressHeading}>
        <View>
          <Text style={styles.section}>Sổ địa chỉ</Text>
          <Text style={styles.helper}>Chọn địa chỉ dùng mặc định khi đặt món.</Text>
        </View>
        <Pressable onPress={() => setShowAddressForm((shown) => !shown)} style={styles.addButton}>
          <Text style={styles.addButtonText}>{showAddressForm ? 'Đóng' : '+ Thêm'}</Text>
        </Pressable>
      </View>
      {addresses.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Chưa có địa chỉ nào</Text>
          <Text style={styles.helper}>Thêm địa chỉ nhà, trường học hoặc nơi làm việc.</Text>
        </View>
      )}
      {addresses.map((item) => {
        const selected = item.address === user?.address;
        return (
          <View key={item.id} style={[styles.addressCard, selected && styles.addressSelected]}>
            <View style={styles.addressTop}>
              <Text style={styles.addressLabel}>{item.label}</Text>
              {selected && <Text style={styles.defaultBadge}>MẶC ĐỊNH</Text>}
            </View>
            <Text style={styles.addressText}>{item.address}</Text>
            <View style={styles.addressActions}>
              {!selected && (
                <Pressable onPress={() => chooseAddress(item.address)}>
                  <Text style={styles.actionText}>Dùng địa chỉ này</Text>
                </Pressable>
              )}
              <Pressable onPress={() => removeAddress(item.id)}>
                <Text style={styles.deleteText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {showAddressForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Địa chỉ mới</Text>
          <Field label="Tên gợi nhớ" value={label} onChangeText={setLabel} placeholder="Nhà, Trường, Văn phòng…" />
          <Field
            label="Địa chỉ đầy đủ"
            value={newAddress}
            onChangeText={(value) => {
              setNewAddress(value);
              setPickedAddress(null);
            }}
            placeholder="Số nhà, đường, phường/quận"
            multiline
          />
          <Pressable onPress={() => setShowAddressPicker(true)} style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Chọn trên bản đồ</Text>
          </Pressable>
          <Pressable disabled={saving} onPress={addAddress} style={styles.save}>
            <Text style={styles.saveText}>{saving ? 'Đang lưu…' : 'Lưu địa chỉ'}</Text>
          </Pressable>
        </View>
      )}
      <AddressPicker
        visible={showAddressPicker}
        onClose={() => setShowAddressPicker(false)}
        onSelect={(place) => {
          setPickedAddress(place);
          setNewAddress(place.address);
          setShowAddressPicker(false);
        }}
      />
      <View style={styles.info}>
        <Text style={styles.infoTitle}>
          {isFirebaseConfigured ? 'Tài khoản Firebase trực tuyến' : 'Tài khoản mô phỏng (Cục bộ)'}
        </Text>
        <Text style={styles.infoText}>
          {isFirebaseConfigured
            ? 'Tài khoản được đồng bộ hóa với dịch vụ Firebase Authentication.'
            : 'Thông tin cá nhân và sổ địa chỉ được lưu an toàn trên thiết bị này, được bảo toàn giữa các lần đăng xuất/đăng nhập.'}
        </Text>
      </View>
      <Pressable onPress={signOut} style={styles.logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'phone-pad';
  multiline?: boolean;
}) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[styles.input, props.multiline && styles.multiline]}
        placeholderTextColor="#9aa49e"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 25, fontWeight: '900', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 5, marginBottom: 18 },
  profileCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 23, fontWeight: '900', color: colors.primary },
  profileName: { fontSize: 15, fontWeight: '800', color: colors.text },
  profileEmail: { fontSize: 12, color: colors.muted, marginTop: 3 },
  badge: { fontSize: 9, fontWeight: '800', color: colors.primary, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  section: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 23, marginBottom: 3 },
  field: { marginTop: 13 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 7 },
  input: { minHeight: 48, paddingHorizontal: 13, borderRadius: radius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 14 },
  multiline: { minHeight: 76, paddingTop: 13, textAlignVertical: 'top' },
  save: { height: 48, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  saveText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  addressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  helper: { fontSize: 11, color: colors.muted, marginTop: 4 },
  addButton: { backgroundColor: colors.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  addButtonText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12 },
  empty: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16 },
  emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 13 },
  addressCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  addressSelected: { borderColor: colors.primary, backgroundColor: '#fbfffc' },
  addressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addressLabel: { color: colors.text, fontWeight: '800', fontSize: 13 },
  defaultBadge: { color: colors.primaryDark, backgroundColor: colors.primaryLight, fontSize: 9, fontWeight: '900', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7 },
  addressText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  addressActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionText: { color: colors.primaryDark, fontWeight: '800', fontSize: 11 },
  deleteText: { color: colors.danger, fontWeight: '700', fontSize: 11 },
  form: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginTop: 4 },
  formTitle: { color: colors.text, fontWeight: '800', fontSize: 14 },
  mapButton: { marginTop: 10, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: colors.primaryLight },
  mapButtonText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  info: { backgroundColor: colors.primaryLight, borderRadius: 14, padding: 14, marginTop: 19 },
  infoTitle: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },
  infoText: { fontSize: 11, lineHeight: 17, color: colors.text, marginTop: 4 },
  logout: { height: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1cccc', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  logoutText: { color: colors.danger, fontSize: 13, fontWeight: '800' },
  activityCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
  },
  activityItem: { alignItems: 'center' },
  activityNum: { fontSize: 16, fontWeight: '800', color: colors.primaryDark },
  activityLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  activityDivider: { width: 1, height: 26, backgroundColor: colors.border },
});
