import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';

export default function ProfileScreen() {
  const router = useRouter();
  // ดึงชื่อผู้ใช้, Token และฟังก์ชันออกจากระบบมาจากส่วนกลาง
  const { username, token, logout, isAdmin } = useAppContext();
  
  // แก๊งตัวแปรไว้เก็บสถานะโหลด และสถานะว่ากำลังกดแก้ไขอยู่หรือเปล่า
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // ถ้าเปิดหน้านี้ปุ๊บแล้วพบว่าไม่ได้ล็อกอิน (ไม่มี Token) ก็ส่งกลับไปหน้าล็อกอินเลย
  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    // ถ้าล็อกอินแล้วก็ไปดึงข้อมูลโปรไฟล์มาโชว์
    fetchProfileData();
  }, [token]);

  // ฟังก์ชันนี้วิ่งไปถามข้อมูลส่วนตัว (อีเมล, เบอร์โทร, ที่อยู่) จากเซิร์ฟเวอร์
  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false); // เลิกหมุนติ้วๆ
    }
  };

  // ฟังก์ชันเวลากดปุ่ม "บันทึก" ข้อมูลส่วนตัว
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, phone, address })
      });
      if (res.ok) {
        Alert.alert('สำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
        setIsEditing(false); // บันทึกเสร็จก็ปิดโหมดแก้ไข
      } else {
        Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (e) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>โปรไฟล์ส่วนตัว</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ color: '#3B82F6', fontSize: 16 }}>{isEditing ? 'ยกเลิก' : 'แก้ไข'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>{username}</Text>
          {isAdmin && <Text style={{ color: '#F59E0B', marginTop: 5 }}>[ ผู้ดูแลระบบ ]</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูลติดต่อและที่อยู่จัดส่ง</Text>
          
          <Text style={styles.label}>อีเมล (Email)</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            placeholder="ยังไม่ได้ระบุอีเมล"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>เบอร์โทรศัพท์ (Phone)</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            placeholder="ยังไม่ได้ระบุเบอร์โทรศัพท์"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>ที่อยู่สำหรับจัดส่ง (Shipping Address)</Text>
          <TextInput
            style={[styles.input, { height: 80 }, !isEditing && styles.inputDisabled]}
            value={address}
            onChangeText={setAddress}
            editable={isEditing}
            placeholder="กรุณากรอกที่อยู่สำหรับจัดส่งสินค้าให้ครบถ้วน..."
            placeholderTextColor="#64748B"
            multiline
            textAlignVertical="top"
          />

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>การสั่งซื้อ</Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#10B981', padding: 15, borderRadius: 10, alignItems: 'center' }} 
              onPress={() => router.push('/orders')}
            >
              <Text style={{ color: '#0F172A', fontWeight: 'bold', fontSize: 16 }}>📦 ติดตามสถานะคำสั่งซื้อ</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>ออกจากระบบ (Logout)</Text>
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
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#F8FAFC' },
  content: { flex: 1 },
  profileCard: {
    alignItems: 'center', padding: 30, backgroundColor: '#1E293B',
    borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  avatarText: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  section: {
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B'
  },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 15
  },
  label: { color: '#94A3B8', fontSize: 14, marginBottom: 8, marginTop: 10 },
  input: {
    backgroundColor: '#1E293B', borderRadius: 8, color: '#F8FAFC',
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  inputDisabled: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    color: '#CBD5E1'
  },
  saveButton: {
    backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 15,
    alignItems: 'center', marginTop: 20
  },
  saveButtonText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    margin: 20, marginBottom: 50, backgroundColor: '#EF4444',
    padding: 15, borderRadius: 10, alignItems: 'center',
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  orderCard: {
    backgroundColor: '#1E293B', padding: 15, borderRadius: 10, marginBottom: 15,
    borderWidth: 1, borderColor: '#334155'
  },
  trackingBox: {
    marginTop: 10, padding: 10, backgroundColor: '#064E3B', borderRadius: 5,
    borderWidth: 1, borderColor: '#059669'
  }
});
