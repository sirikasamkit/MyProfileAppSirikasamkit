import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/context/AppContext';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('ผิดพลาด', 'กรุณากรอก Username และ Password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('ผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim() 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว!', [
          { text: 'ไปหน้าเข้าสู่ระบบ', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('ผิดพลาด', data.error || 'ไม่สามารถสมัครสมาชิกได้');
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
        <Text style={styles.headerTitle}>สมัครสมาชิก</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Username (ชื่อผู้ใช้)</Text>
        <TextInput
          style={styles.input}
          placeholder="ตั้งชื่อผู้ใช้งาน"
          placeholderTextColor="#94A3B8"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email (อีเมล)</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone (เบอร์โทรศัพท์)</Text>
        <TextInput
          style={styles.input}
          placeholder="08X-XXX-XXXX"
          placeholderTextColor="#94A3B8"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password (รหัสผ่าน)</Text>
        <TextInput
          style={styles.input}
          placeholder="ตั้งรหัสผ่าน"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password (ยืนยันรหัสผ่าน)</Text>
        <TextInput
          style={styles.input}
          placeholder="ยืนยันรหัสผ่านอีกครั้ง"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleRegister}>
          <Text style={styles.saveButtonText}>สมัครสมาชิก</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
          <Text style={styles.loginLinkText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#10B981' },
  formContainer: { padding: 20, paddingBottom: 50 },
  label: { color: '#F8FAFC', fontSize: 16, marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#1E293B', borderRadius: 8, color: '#F8FAFC',
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  saveButton: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' }
});
