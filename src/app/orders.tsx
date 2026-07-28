import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';

export default function OrdersScreen() {
  const router = useRouter();
  const { token, isAdmin } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Fetch orders error', e);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>📦 ติดตามสถานะคำสั่งซื้อ</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        {isAdmin ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: '#94A3B8', textAlign: 'center' }}>
              บัญชี Admin โปรดใช้เมนู "Sales" เพื่อดูคำสั่งซื้อทั้งหมด
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 16 }}>
              ยังไม่มีประวัติการสั่งซื้อ
            </Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
              <Text style={{ color: '#0F172A', fontWeight: 'bold' }}>ไปเลือกซื้อสินค้า</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {orders.map((order, index) => (
              <View key={index} style={styles.orderCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>คำสั่งซื้อ #{order.id}</Text>
                  <Text style={{ 
                    color: order.status === 'จัดส่งสำเร็จ' ? '#10B981' : (order.status === 'กำลังจัดส่ง' ? '#3B82F6' : '#F59E0B'),
                    fontWeight: 'bold',
                    fontSize: 14
                  }}>
                    {order.status || 'รอตรวจสอบชำระเงิน'}
                  </Text>
                </View>
                <Text style={{ color: '#CBD5E1', marginBottom: 5 }}>สินค้า: {order.name} x {order.quantity}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 14, marginBottom: 10 }}>ราคารวม: {Number(order.total_price).toLocaleString()} ฿</Text>
                
                {order.tracking_number && (
                  <View style={styles.trackingBox}>
                    <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 16 }}>เลขพัสดุ: {order.tracking_number}</Text>
                    <Text style={{ color: '#3B82F6', fontSize: 12, marginTop: 5 }}>นำเลขพัสดุไปเช็คกับขนส่งได้เลยครับ</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 50 },
  shopBtn: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 20 },
  listContainer: { padding: 20 },
  orderCard: {
    backgroundColor: '#1E293B', padding: 20, borderRadius: 12, marginBottom: 15,
    borderWidth: 1, borderColor: '#334155',
  },
  trackingBox: {
    backgroundColor: '#0F172A', padding: 15, borderRadius: 8, marginTop: 10,
    borderWidth: 1, borderColor: '#10B981'
  }
});
