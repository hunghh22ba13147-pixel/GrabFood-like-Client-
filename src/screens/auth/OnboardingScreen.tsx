import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const finishOnboarding = useAuthStore((state) => state.finishOnboarding);
  const [error, setError] = useState<string | null>(null);
  const begin = async () => {
    setError(null);
    try { await finishOnboarding(); navigation.replace('Login'); }
    catch { setError('Chưa lưu được trạng thái bắt đầu. Vui lòng thử lại.'); }
  };
  return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <View style={styles.illustration}><Text style={styles.food}>🍜</Text><Text style={[styles.food, styles.smallFood]}>🥡</Text><Text style={styles.sparkle}>✦</Text></View>
    <Text style={styles.kicker}>CHÀO MỪNG BẠN</Text><Text style={styles.title}>Món ngon,{ '\n' }giao thật nhanh.</Text>
    <Text style={styles.copy}>Khám phá quán ngon quanh bạn, chọn món yêu thích và để chúng mình giao đến tận cửa.</Text>
    <View style={styles.dots}><View style={styles.activeDot}/><View style={styles.dot}/><View style={styles.dot}/></View>
    <Pressable onPress={begin} style={styles.button}><Text style={styles.buttonText}>Bắt đầu đặt món  →</Text></Pressable>
    {error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
    <Text style={styles.note}>Đồ ăn ngon chỉ cách bạn vài thao tác</Text>
  </View></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.bg},content:{flex:1,padding:26,justifyContent:'center'},
  illustration:{height:270,borderRadius:34,backgroundColor:colors.primaryLight,alignItems:'center',justifyContent:'center',marginBottom:38,overflow:'hidden'},
  food:{fontSize:112},smallFood:{position:'absolute',right:32,bottom:25,fontSize:54},sparkle:{position:'absolute',left:38,top:36,width:42,height:42,borderRadius:15,backgroundColor:'#fff',color:colors.primary,textAlign:'center',textAlignVertical:'center',fontSize:24},
  kicker:{color:colors.primary,fontWeight:'800',fontSize:11,letterSpacing:1.5},title:{color:colors.text,fontSize:36,lineHeight:42,fontWeight:'900',marginTop:10},copy:{color:colors.muted,fontSize:15,lineHeight:23,marginTop:13},
  dots:{flexDirection:'row',gap:7,marginTop:25,marginBottom:25},activeDot:{width:23,height:7,borderRadius:4,backgroundColor:colors.primary},dot:{width:7,height:7,borderRadius:4,backgroundColor:'#cbd5ce'},
  button:{backgroundColor:colors.primary,borderRadius:radius.lg,paddingVertical:17,alignItems:'center'},buttonText:{color:'#fff',fontSize:15,fontWeight:'800'},note:{color:colors.muted,fontSize:11,textAlign:'center',marginTop:spacing.md},
});
