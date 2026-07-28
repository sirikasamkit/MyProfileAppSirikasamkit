import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleLogin = async () => {
    try {
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
      if (res.ok && data.token) {
        login(data.token, data.role, data.username);
        router.replace('/');
      } else {
        Alert.alert('ผิดพลาด', data.error || 'Username หรือ Password ไม่ถูกต้อง');
      }
    } catch (e) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#1E293B',
    borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  backButton: { width: 30, height: 30, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#F8FAFC' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#F59E0B' },
  formContainer: { padding: 20 },
  label: { color: '#F8FAFC', fontSize: 16, marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#1E293B', borderRadius: 8, color: '#F8FAFC',
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  saveButton: { backgroundColor: '#F59E0B', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchButtonText: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' },
  registerButton: { marginTop: 30, alignItems: 'center' },
  registerButtonText: { color: '#10B981', fontSize: 16, fontWeight: 'bold' }
});
