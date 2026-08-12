import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  // ดึงฟังก์ชันลอกอินมาจาก AppContext เพื่อใช้งาน
  const { login } = useAppContext();
  
  // สร้างกล่องเก็บข้อมูลชื่อผู้ใช้ รหัสผ่าน และเช็คว่าเป็นแอดมินหรือผู้ใช้ทั่วไป
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // ฟังก์ชันพระเอกของเรา เอาไว้กดแล้วส่งข้อมูลไปเช็คที่เซิร์ฟเวอร์
  const handleLogin = async () => {
    try {
      // สลับเป้าหมาย API ให้ถูกว่าลอกอินแบบไหน
      const endpoint = isAdminLogin ? '/api/login' : '/api/user/login';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        })
      });
      const data = await res.json();
      
      // ถ้าผ่านฉลุย ได้เหรียญทอง (Token) มา
      if (res.ok && data.token) {
        login(data.token, data.role, data.username); // เอาไปเก็บไว้ใช้งาน
        router.replace('/'); // แล้วพาไปหน้าหลักเลย
      } else {
        Alert.alert('ผิดพลาด', data.error || 'Username หรือ Password ไม่ถูกต้อง');
      }
    } catch (e) {
      Alert.alert('ผิดพลาด', 'เน็ตหลุดหรือเซิร์ฟเวอร์งอแงครับ');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#000000']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isAdminLogin ? 'Admin Login' : 'Login'}</Text>
          <View style={{ width: 30 }} />
        </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          placeholderTextColor="#94A3B8"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleLogin}>
          <Text style={styles.saveButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsAdminLogin(!isAdminLogin)}>
          <Text style={styles.switchButtonText}>
            {isAdminLogin ? 'สลับเป็นเข้าสู่ระบบสมาชิกปกติ' : 'สลับเป็นเข้าสู่ระบบ Admin'}
          </Text>
        </TouchableOpacity>

        {!isAdminLogin && (
          <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => router.push('/forgot-password')}>
            <Text style={{ color: '#F59E0B', fontSize: 14, textDecorationLine: 'underline' }}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>
        )}

        {!isAdminLogin && (
          <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')}>
            <Text style={styles.registerButtonText}>ไม่มีบัญชี? สมัครสมาชิกที่นี่</Text>
          </TouchableOpacity>
        )}
      </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  orb1: {
    position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.4)', shadowColor: '#3B82F6', shadowOpacity: 1,
    shadowRadius: 100, elevation: 20, filter: 'blur(50px)' as any,
  },
  orb2: {
    position: 'absolute', bottom: 100, left: -100, width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(245, 158, 11, 0.3)', shadowColor: '#F59E0B', shadowOpacity: 1,
    shadowRadius: 100, elevation: 20, filter: 'blur(60px)' as any,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'transparent',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: { width: 30, height: 30, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#F8FAFC' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#F59E0B' },
  formContainer: { padding: 20 },
  label: { color: '#F8FAFC', fontSize: 16, marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 12, color: '#F8FAFC',
    paddingHorizontal: 15, paddingVertical: 14, fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#F59E0B', borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 30,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  saveButtonText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchButtonText: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' },
  registerButton: { marginTop: 30, alignItems: 'center' },
  registerButtonText: { color: '#10B981', fontSize: 16, fontWeight: 'bold' }
});
