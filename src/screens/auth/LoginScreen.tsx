import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { isFirebaseConfigured } from '../../services/firebase';
import { getAuthErrorMessage } from '../../services/authErrorMessage';

function showAlert(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    globalThis.alert(`${title}\n${message}`);
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
}

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  const resendVerification = useAuthStore((state) => state.resendVerification);
  const hydrationError = useAuthStore((state) => state.hydrationError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (!email.trim() || !password) {
      showAlert('Cần email và mật khẩu', 'Nhập thông tin tài khoản để gửi lại thư xác minh.');
      return;
    }
    setResending(true);
    try {
      await resendVerification(email, password);
      showAlert('Đã gửi thư', 'Kiểm tra hộp thư đến hoặc thư rác để xác minh email.');
    } catch (error) {
      showAlert('Chưa gửi được thư', getAuthErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      showAlert('Thiếu thông tin', 'Nhập email và mật khẩu để tiếp tục.');
      return;
    }
    setBusy(true);
    try {
      const result = await login(email, password);
      if (result === 'verification-required') {
        if (Platform.OS === 'web') {
          if (globalThis.confirm('Hãy xác minh email trước\nMở thư Firebase đã gửi và bấm vào liên kết xác minh.\n\nBạn có muốn gửi lại thư xác minh ngay không?')) {
            await resend();
          }
        } else {
          Alert.alert(
            'Hãy xác minh email trước',
            'Mở thư Firebase đã gửi và bấm vào liên kết xác minh. Sau đó quay lại đăng nhập.',
            [{ text: 'Đóng', style: 'cancel' }, { text: 'Gửi lại thư', onPress: resend }],
          );
        }
        return;
      }
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (error) {
      showAlert('Chưa thể đăng nhập', getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.mark}>
            <Text style={styles.markText}>G</Text>
          </View>
          <Text style={styles.eyebrow}>CHÀO MỪNG TRỞ LẠI</Text>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục khám phá món ngon.</Text>
          {hydrationError && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{getAuthErrorMessage(new Error(hydrationError))}</Text>}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="ban@email.com"
            placeholderTextColor="#9aa49e"
            autoCorrect={false}
            spellCheck={false}
            textContentType="emailAddress"
            style={styles.input}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textContentType="password"
            placeholder="Ít nhất 6 ký tự"
            placeholderTextColor="#9aa49e"
            style={styles.input}
          />

          <Pressable
            onPress={submit}
            disabled={busy || resending}
            style={[styles.button, (busy || resending) && { opacity: 0.65 }]}
          >
            <Text style={styles.buttonText}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</Text>
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.muted}>Chưa có tài khoản? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Đăng ký ngay</Text>
            </Pressable>
          </View>

          <Text style={styles.demo}>
            {isFirebaseConfigured
              ? 'Bạn cần xác minh email sau khi đăng ký trước lần đăng nhập đầu tiên.'
              : 'Chế độ Demo: Nhập email bất kỳ và mật khẩu từ 6 ký tự để trải nghiệm.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, padding: 26, paddingTop: 20, paddingBottom: 40 },
  mark: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  markText: { color: '#fff', fontWeight: '900', fontSize: 30 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: colors.primary },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 7 },
  subtitle: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 7, marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 7, marginTop: 11 },
  input: { height: 48, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 14 },
  button: { height: 52, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 23 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  demo: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 19 },
});
