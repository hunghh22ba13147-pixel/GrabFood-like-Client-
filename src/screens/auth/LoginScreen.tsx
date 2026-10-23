import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert('Thiếu thông tin', 'Nhập email và mật khẩu để tiếp tục.');
    setBusy(true);
    try { if (!await login(email, password)) return Alert.alert('Thông tin chưa hợp lệ', 'Email cần đúng định dạng và mật khẩu tối thiểu 6 ký tự.'); navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }); }
    catch { Alert.alert('Chưa thể đăng nhập', 'Không lưu được phiên trên thiết bị. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.mark}><Text style={styles.markText}>G</Text></View><Text style={styles.eyebrow}>CHÀO MỪNG TRỞ LẠI</Text><Text style={styles.title}>Đăng nhập</Text><Text style={styles.subtitle}>Đăng nhập để tiếp tục khám phá món ngon.</Text>
    <Text style={styles.label}>Email</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ban@email.com" placeholderTextColor="#9aa49e" style={styles.input} />
    <Text style={styles.label}>Mật khẩu</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Ít nhất 6 ký tự" placeholderTextColor="#9aa49e" style={styles.input} />
    <Pressable onPress={submit} disabled={busy} style={[styles.button,busy&&{opacity:.65}]}><Text style={styles.buttonText}>{busy?'Đang đăng nhập…':'Đăng nhập'}</Text></Pressable>
    <View style={styles.row}><Text style={styles.muted}>Chưa có tài khoản? </Text><Pressable onPress={()=>navigation.navigate('Register')}><Text style={styles.link}>Đăng ký ngay</Text></Pressable></View>
    <Text style={styles.demo}>Tài khoản demo: dùng email hợp lệ và mật khẩu từ 6 ký tự.</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{flexGrow:1,justifyContent:'center',padding:26},mark:{width:58,height:58,borderRadius:20,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginBottom:24},markText:{color:'#fff',fontWeight:'900',fontSize:34},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.5,color:colors.primary},title:{fontSize:32,fontWeight:'900',color:colors.text,marginTop:7},subtitle:{fontSize:14,color:colors.muted,marginTop:7,marginBottom:30},label:{fontSize:12,fontWeight:'700',color:colors.text,marginBottom:8,marginTop:14},input:{height:52,paddingHorizontal:15,borderRadius:radius.md,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:14},button:{height:54,backgroundColor:colors.primary,borderRadius:radius.md,alignItems:'center',justifyContent:'center',marginTop:26},buttonText:{color:'#fff',fontWeight:'800',fontSize:15},row:{flexDirection:'row',justifyContent:'center',marginTop:23},muted:{color:colors.muted,fontSize:13},link:{color:colors.primary,fontWeight:'800',fontSize:13},demo:{color:colors.muted,fontSize:11,textAlign:'center',marginTop:25,lineHeight:17}});
