import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
  const navigation = useNavigation<any>(); const register = useAuthStore((state) => state.register);
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirmation,setConfirmation]=useState(''); const [busy,setBusy]=useState(false);
  const submit=async()=>{
    if(!name.trim()||!email.trim()||!password||!confirmation) return Alert.alert('Thiếu thông tin','Vui lòng điền đầy đủ các mục.');
    if(password!==confirmation) return Alert.alert('Mật khẩu chưa khớp','Nhập lại mật khẩu xác nhận.');
    setBusy(true); try { if(!await register(name,email,password)) return Alert.alert('Thông tin chưa hợp lệ','Tên cần từ 2 ký tự, email đúng định dạng và mật khẩu tối thiểu 6 ký tự.'); navigation.reset({index:0,routes:[{name:'Tabs'}]}); }
    catch { Alert.alert('Chưa thể tạo tài khoản','Không lưu được thông tin trên thiết bị. Vui lòng thử lại.'); } finally {setBusy(false);}
  };
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.mark}><Text style={styles.markText}>G</Text></View><Text style={styles.eyebrow}>TẠO TÀI KHOẢN</Text><Text style={styles.title}>Tham gia GrabFood</Text><Text style={styles.subtitle}>Tạo tài khoản để lưu thông tin và đặt món nhanh hơn.</Text>
    <Field label="Họ và tên" value={name} onChangeText={setName} placeholder="Tên của bạn"/><Field label="Email" value={email} onChangeText={setEmail} placeholder="ban@email.com" keyboardType="email-address" autoCapitalize="none"/><Field label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Ít nhất 6 ký tự" secureTextEntry/><Field label="Nhập lại mật khẩu" value={confirmation} onChangeText={setConfirmation} placeholder="Nhập lại mật khẩu" secureTextEntry/>
    <Pressable onPress={submit} disabled={busy} style={[styles.button,busy&&{opacity:.65}]}><Text style={styles.buttonText}>{busy?'Đang tạo tài khoản…':'Tạo tài khoản'}</Text></Pressable>
    <View style={styles.row}><Text style={styles.muted}>Đã có tài khoản? </Text><Pressable onPress={()=>navigation.goBack()}><Text style={styles.link}>Đăng nhập</Text></Pressable></View><Text style={styles.demo}>Đây là tài khoản demo lưu cục bộ trên thiết bị.</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
function Field(props:{label:string;value:string;onChangeText:(text:string)=>void;placeholder:string;secureTextEntry?:boolean;keyboardType?:'email-address';autoCapitalize?:'none'}) {const {label,...inputProps}=props;return <><Text style={styles.label}>{label}</Text><TextInput {...inputProps} style={styles.input} placeholderTextColor="#9aa49e"/></>;}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{flexGrow:1,justifyContent:'center',padding:26},mark:{width:52,height:52,borderRadius:18,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginBottom:20},markText:{color:'#fff',fontWeight:'900',fontSize:30},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.5,color:colors.primary},title:{fontSize:28,fontWeight:'900',color:colors.text,marginTop:7},subtitle:{fontSize:13,lineHeight:19,color:colors.muted,marginTop:7,marginBottom:15},label:{fontSize:12,fontWeight:'700',color:colors.text,marginBottom:7,marginTop:11},input:{height:48,paddingHorizontal:14,borderRadius:radius.md,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,color:colors.text,fontSize:14},button:{height:52,backgroundColor:colors.primary,borderRadius:radius.md,alignItems:'center',justifyContent:'center',marginTop:23},buttonText:{color:'#fff',fontWeight:'800',fontSize:15},row:{flexDirection:'row',justifyContent:'center',marginTop:20},muted:{color:colors.muted,fontSize:13},link:{color:colors.primary,fontWeight:'800',fontSize:13},demo:{color:colors.muted,fontSize:11,textAlign:'center',marginTop:19}});
