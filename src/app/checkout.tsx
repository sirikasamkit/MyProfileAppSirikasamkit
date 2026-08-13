import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';

export default function CheckoutScreen() {
  const router = useRouter();
  // ดึงตะกร้าสินค้า และฟังก์ชันจำเป็นมาจากระบบกลาง
  const { cart, username, token, fetchProducts, clearCart } = useAppContext();
  // ไว้เก็บรูปสลิปโอนเงินที่ลูกค้าอัปโหลด
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // คำนวณยอดเงินรวมที่ต้องจ่าย
  const total = cart.reduce((sum, item) => {
    const priceStr = item.price.toString().replace(/[^0-9.]/g, '');
    const priceNum = parseFloat(priceStr) || 0;
    return sum + (priceNum * item.quantity);
  }, 0);

  // ฟังก์ชันกดปุ่ม "อัปโหลดสลิป" แล้วเปิดแกลเลอรี่รูปขึ้นมา
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'คุณต้องอนุญาตให้เข้าถึงรูปภาพเพื่ออัปโหลดสลิป');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSlipImage(result.assets[0].uri);
    }
  };

  // เมื่อลูกค้ากดปุ่ม "ยืนยันการชำระเงิน"
  const handleConfirmPayment = async () => {
    // โวยวายถ้ายังไม่แนบสลิป
    if (!slipImage) {
      Alert.alert('ผิดพลาด', 'กรุณาอัปโหลดสลิปโอนเงินก่อนยืนยัน');
      return;
    }

    setLoading(true); // หมุนติ้วๆ รอแป๊บนึง
    try {
      // 1. Upload Slip Image
      const formData = new FormData();
      
      try {
        const response = await fetch(slipImage);
        const blob = await response.blob();
        formData.append('image', blob, 'slip.jpg');
      } catch (err) {
        // Fallback for native if fetch(uri) fails
        formData.append('image', {
          uri: slipImage,
          name: 'slip.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('อัปโหลดสลิปไม่สำเร็จ (เซิร์ฟเวอร์อาจไม่รองรับ)');
      const uploadData = await uploadRes.json();
      const slipUrl = uploadData.imageUrl;

      // 2. Submit Checkout Data
      const checkoutRes = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          username: username,
          payment_slip: slipUrl
        })
      });

      if (!checkoutRes.ok) throw new Error('ไม่สามารถบันทึกคำสั่งซื้อได้');

      // Clear Cart globally
      clearCart();
      
      if (typeof window !== 'undefined') {
        window.alert('ชำระเงินและสั่งซื้อเรียบร้อยแล้ว!');
        router.replace('/orders');
      } else {
        Alert.alert('สำเร็จ', 'ชำระเงินและสั่งซื้อเรียบร้อยแล้ว!', [
          { 
            text: 'ดูสถานะสินค้า', 
            onPress: () => {
              router.replace('/orders');
            }
          }
        ]);
      }

    } catch (e: any) {
      Alert.alert('ผิดพลาด', e.message || 'ไม่สามารถชำระเงินได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ชำระเงิน (Checkout)</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>ยอดที่ต้องชำระทั้งหมด</Text>
          <Text style={styles.summaryValue}>{total.toLocaleString()} ฿</Text>
        </View>

        <View style={styles.bankBox}>
          <Text style={styles.bankTitle}>ข้อมูลบัญชีสำหรับโอนเงิน</Text>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>ธนาคาร:</Text>
            <Text style={styles.bankValue}>กสิกรไทย (KBank)</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>เลขบัญชี:</Text>
            <Text style={styles.bankValue}>123-4-56789-0</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>ชื่อบัญชี:</Text>
            <Text style={styles.bankValue}>นายทดสอบ ระบบดีเยี่ยม</Text>
          </View>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>แนบหลักฐานการโอนเงิน (สลิป)</Text>
          
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.uploadBtnText}>{slipImage ? 'เปลี่ยนรูปสลิป' : '📷 เลือกรูปสลิป'}</Text>
          </TouchableOpacity>

          {slipImage && (
            <Image source={{ uri: slipImage }} style={styles.slipPreview} resizeMode="contain" />
          )}
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, (!slipImage || loading) && styles.confirmBtnDisabled]} 
          onPress={handleConfirmPayment}
          disabled={!slipImage || loading}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.confirmBtnText}>ยืนยันการชำระเงิน</Text>
          )}
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
  content: { padding: 20, paddingBottom: 50 },
  summaryBox: {
    backgroundColor: '#1E293B', padding: 20, borderRadius: 10,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#334155'
  },
  summaryTitle: { color: '#94A3B8', fontSize: 16, marginBottom: 5 },
  summaryValue: { color: '#10B981', fontSize: 32, fontWeight: 'bold' },
  bankBox: {
    backgroundColor: '#1E293B', padding: 20, borderRadius: 10, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  bankTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bankLabel: { color: '#94A3B8', fontSize: 16 },
  bankValue: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  uploadSection: {
    backgroundColor: '#1E293B', padding: 20, borderRadius: 10, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155', alignItems: 'center'
  },
  uploadTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  uploadBtn: {
    backgroundColor: '#334155', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 8, borderWidth: 1, borderColor: '#475569'
  },
  uploadBtnText: { color: '#F8FAFC', fontSize: 16 },
  slipPreview: { width: '100%', height: 300, marginTop: 20, borderRadius: 8 },
  confirmBtn: {
    backgroundColor: '#10B981', paddingVertical: 15, borderRadius: 10, alignItems: 'center'
  },
  confirmBtnDisabled: { backgroundColor: '#059669', opacity: 0.5 },
  confirmBtnText: { color: '#0F172A', fontSize: 18, fontWeight: 'bold' }
});
