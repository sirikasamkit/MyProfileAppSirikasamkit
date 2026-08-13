import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/context/AppContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  // แก๊งตัวแปรไว้รับข้อมูลตอนลูกค้ากรอกขอรหัสผ่านใหม่
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ฟังก์ชันพระเอกของเรา เอาไว้กดแล้วส่งไปขอรหัสใหม่
  const handleResetPassword = async () => {
    // โวยวายถ้าลืมกรอกข้อมูลช่องใดช่องหนึ่ง
    if (!username || !email || !newPassword) {
      Alert.alert('ผิดพลาด', 'กรุณากรอกข้อมูลให้ครบทุกช่องนะครับ');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          email: email.trim(),
          newPassword: newPassword.trim() 
        })
      });
      const data = await res.json();
      
      // ถ้าผ่านฉลุย เปลี่ยนรหัสสำเร็จ
      if (res.ok) {
        Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว! ไปล็อกอินกันเลย', [
          { text: 'ไปหน้าเข้าสู่ระบบ', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('ผิดพลาด', data.error || 'ข้อมูลไม่ถูกต้อง เปลี่ยนรหัสผ่านไม่ได้ครับ');
      }
    } catch (e) {
      Alert.alert('ผิดพลาด', 'เน็ตหลุดหรือเซิร์ฟเวอร์งอแงครับ');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ลืมรหัสผ่าน (Reset Password)</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Username (ชื่อผู้ใช้ที่ใช้สมัคร)</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกชื่อผู้ใช้ของคุณ"
          placeholderTextColor="#94A3B8"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email (อีเมลที่เคยสมัครไว้)</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกอีเมลเพื่อยืนยันตัวตน"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>New Password (รหัสผ่านใหม่ที่ต้องการ)</Text>
        <TextInput
          style={styles.input}
          placeholder="ตั้งรหัสผ่านใหม่"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleResetPassword}>
          <Text style={styles.saveButtonText}>รีเซ็ตรหัสผ่าน</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
          <Text style={styles.loginLinkText}>จำรหัสผ่านได้แล้ว? เข้าสู่ระบบ</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#3B82F6' },
  formContainer: { padding: 20, paddingBottom: 50 },
  label: { color: '#F8FAFC', fontSize: 16, marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#1E293B', borderRadius: 8, color: '#F8FAFC',
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  saveButton: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' }
});
