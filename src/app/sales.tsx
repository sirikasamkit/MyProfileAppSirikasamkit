import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';

export default function SalesScreen() {
  const router = useRouter();
  const { isAdmin, token } = useAppContext();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for editing order
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [viewingSlip, setViewingSlip] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSales(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchSales();
  }, [isAdmin, token]);

  const handleUpdateStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: editStatus, tracking_number: editTracking })
      });
      if (response.ok) {
        Alert.alert('สำเร็จ', 'อัปเดตสถานะจัดส่งเรียบร้อยแล้ว');
        setEditingId(null);
        fetchSales();
      } else {
        Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตได้');
      }
    } catch (e) {
      Alert.alert('ผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Access Denied</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>เฉพาะ Admin เท่านั้นที่สามารถดูยอดขายได้</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalRevenue = sales.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  const totalItemsSold = sales.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const renderSaleItem = ({ item }: { item: any }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.saleCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.saleName}>{item.name}</Text>
          <Text style={styles.salePrice}>{item.total_price} ฿ (x{item.quantity})</Text>
        </View>
        
        <Text style={styles.buyerText}>
          ผู้ซื้อ: {item.username || 'ผู้ใช้ทั่วไป'}
        </Text>
        <Text style={styles.saleDate}>{new Date(item.created_at).toLocaleString('th-TH')}</Text>

        {!isEditing ? (
          <View style={styles.statusBox}>
            <View>
              <Text style={{ color: '#F8FAFC' }}>สถานะ: <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>{item.status || 'รอตรวจสอบชำระเงิน'}</Text></Text>
              {item.tracking_number && (
                <Text style={{ color: '#10B981', marginTop: 4 }}>เลขพัสดุ: {item.tracking_number}</Text>
              )}
              {item.payment_slip && (
                <TouchableOpacity onPress={() => setViewingSlip(item.payment_slip)} style={{ marginTop: 8 }}>
                  <Text style={{ color: '#3B82F6', textDecorationLine: 'underline', fontWeight: 'bold' }}>ดูสลิปโอนเงิน 🖼️</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => {
                setEditingId(item.id);
                setEditStatus(item.status || 'รอตรวจสอบชำระเงิน');
                setEditTracking(item.tracking_number || '');
              }}
            >
              <Text style={styles.editBtnText}>แก้ไขสถานะ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editBox}>
            <Text style={{ color: '#94A3B8', marginBottom: 5 }}>อัปเดตสถานะ</Text>
            <View style={styles.statusButtons}>
              {['รอตรวจสอบชำระเงิน', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'].map((st) => (
                <TouchableOpacity 
                  key={st}
                  style={[styles.stBtn, editStatus === st && styles.stBtnActive]}
                  onPress={() => setEditStatus(st)}
                >
                  <Text style={[styles.stBtnText, editStatus === st && styles.stBtnTextActive, { fontSize: 10 }]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: '#94A3B8', marginTop: 10, marginBottom: 5 }}>เลขพัสดุ (Tracking Number)</Text>
            <TextInput 
              style={styles.input}
              value={editTracking}
              onChangeText={setEditTracking}
              placeholder="เช่น TH123456789"
              placeholderTextColor="#64748B"
            />
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingId(null)}>
                <Text style={{ color: '#F8FAFC' }}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleUpdateStatus(item.id)}>
                <Text style={{ color: '#0F172A', fontWeight: 'bold' }}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales & Orders Dashboard</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.content}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>รายได้รวม</Text>
              <Text style={styles.summaryValue}>{totalRevenue.toLocaleString()} ฿</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ขายได้ทั้งหมด</Text>
              <Text style={styles.summaryValue}>{totalItemsSold} ชิ้น</Text>
            </View>
          </View>

          <Text style={styles.listTitle}>รายการสั่งซื้อ (Orders)</Text>
          <FlatList
            data={sales}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSaleItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={{ color: '#94A3B8', textAlign: 'center' }}>ยังไม่มีรายการขาย</Text>}
          />
        </View>
      )}

      {/* Slip Viewer Modal */}
      <Modal visible={!!viewingSlip} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setViewingSlip(null)}>
            <Text style={styles.closeModalText}>✕ ปิด</Text>
          </TouchableOpacity>
          {viewingSlip && (
            <Image 
              source={{ uri: `${API_BASE_URL}${viewingSlip}` }} 
              style={styles.slipModalImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>

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
  content: { flex: 1, padding: 20 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center', marginTop: 50 },
  summaryBox: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 20, flexDirection: 'row',
    justifyContent: 'space-around', borderWidth: 1, borderColor: '#334155', marginBottom: 20,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 5 },
  summaryValue: { color: '#10B981', fontSize: 24, fontWeight: 'bold' },
  divider: { width: 1, backgroundColor: '#334155' },
  listTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  listContainer: { gap: 15, paddingBottom: 50 },
  saleCard: {
    backgroundColor: '#1E293B', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  saleName: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', flex: 1 },
  salePrice: { color: '#10B981', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  buyerText: { color: '#3B82F6', fontSize: 14, marginBottom: 5 },
  saleDate: { color: '#94A3B8', fontSize: 12, marginBottom: 15 },
  statusBox: {
    backgroundColor: '#0F172A', padding: 10, borderRadius: 8, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  editBtn: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, alignSelf: 'flex-start' },
  editBtnText: { color: '#F8FAFC', fontSize: 12 },
  editBox: { backgroundColor: '#0F172A', padding: 15, borderRadius: 8, marginTop: 10 },
  statusButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  stBtn: {
    flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#334155',
    alignItems: 'center', marginHorizontal: 2, borderRadius: 5
  },
  stBtnActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  stBtnText: { color: '#94A3B8' },
  stBtnTextActive: { color: '#0F172A', fontWeight: 'bold' },
  input: {
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
    color: '#F8FAFC', padding: 10, borderRadius: 5, fontSize: 14, marginTop: 5
  },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10 },
  cancelBtn: { padding: 10, paddingHorizontal: 15 },
  saveBtn: { backgroundColor: '#10B981', padding: 10, paddingHorizontal: 20, borderRadius: 5 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  closeModalBtn: {
    position: 'absolute', top: 50, right: 20, padding: 10, backgroundColor: '#EF4444', borderRadius: 20, zIndex: 10
  },
  closeModalText: { color: '#FFF', fontWeight: 'bold' },
  slipModalImage: { width: '100%', height: '80%', borderRadius: 10 }
});
