import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';

export default function ProductDetailScreen() {
  // ดึงค่า id ของสินค้าจาก URL ที่กดเข้ามา
  const { id } = useLocalSearchParams();
  // ตัวจัดการการเปลี่ยนหน้าเว็บ (ไปหน้าอื่น หรือ ย้อนกลับ)
  const router = useRouter();
  // ดึงของเล่นจำเป็นมาจากกล่องส่วนกลาง (Context) เช่น สินค้าทั้งหมด, ตะกร้า, เช็คว่าล็อกอินไหม
  const { products, addToCart, token, username } = useAppContext();
  
  // เตรียมที่ว่าง (State) ไว้เก็บข้อมูลสินค้าที่จะเอามาโชว์บนจอ
  const [product, setProduct] = useState<any>(null);
  // ตรงนี้ไว้เก็บรายการคอมเมนต์ทั้งหมดของสินค้านี้ (เริ่มต้นเป็นก้อนว่างๆ)
  const [comments, setComments] = useState<any[]>([]);
  // เวลาลูกค้าพิมพ์คอมเมนต์ใหม่ ข้อความจะมาพักไว้ที่ตัวนี้แหละ
  const [newComment, setNewComment] = useState('');
  // แฟล็กเอาไว้โชว์ไอคอนหมุนๆ ตอนกำลังโหลดข้อมูล 
  const [loading, setLoading] = useState(true);
  // แฟล็กป้องกันคนมือกดส่งคอมเมนต์รัวๆ จนเซิร์ฟเวอร์พัง
  const [posting, setPosting] = useState(false);

  // ระบบจะทำในวงเล็บนี้ทันทีที่เปิดหน้านี้ขึ้นมา
  useEffect(() => {
    // ลองหาดูสิว่ามีสินค้ารหัสนี้ ในคลังสินค้าของเราหรือเปล่า
    const foundProduct = products.find(p => p.id === id);
    setProduct(foundProduct);
    
    if (foundProduct) {
      // ถ้าเจอสินค้าตัวนี้ ก็สั่งให้ไปดึงคอมเมนต์มาโชว์ด้วยเลย
      fetchComments();
    } else {
      // อ้าว หาไม่เจอ งั้นหยุดหมุนโหลดซะ แล้วไปโชว์ว่าไม่พบสินค้า
      setLoading(false);
    }
  }, [id, products]);

  // ฟังก์ชันนี้มีหน้าที่ไปสอยคอมเมนต์มาจากเซิร์ฟเวอร์หลังบ้าน
  const fetchComments = async () => {
    try {
      // เรียก API ไปถามหลังบ้าน
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data); // ได้ข้อมูลมาแล้วก็จับยัดใส่ State โลด!
      }
    } catch (e) {
      console.error('Fetch comments error:', e);
    } finally {
      setLoading(false); // โหลดเสร็จละ สั่งให้วงกลมหมุนๆ หยุดทำงาน
    }
  };

  // ฟังก์ชันตอนคนกดส่งคอมเมนต์
  const handlePostComment = async () => {
    // ถ้าพิมพ์แต่ช่องว่าง (หรือไม่ได้พิมพ์อะไรมาเลย) ก็เด้งกลับไป ไม่ส่งนะจ๊ะ
    if (!newComment.trim()) return; 
    setPosting(true); // เปิดโหมดกันกดปุ่มรัวๆ

    try {
      // ยิงข้อมูลไปให้เซิร์ฟเวอร์เซฟลง Database
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ต้องแนบบัตรผ่าน (Token) ไปด้วยนะ คนแปลกหน้าห้ามส่ง!
        },
        body: JSON.stringify({
          username: username,
          comment_text: newComment.trim() // ตัดช่องว่างหัวท้ายทิ้งก่อนส่ง
        })
      });

      if (res.ok) {
        setNewComment(''); // เคลียร์ช่องพิมพ์ให้ว่างเปล่า
        fetchComments(); // ดึงคอมเมนต์ใหม่มาอัปเดตหน้าจอแบบทันใจ
      } else {
        Alert.alert('ผิดพลาด', 'ไม่สามารถส่งคอมเมนต์ได้');
      }
    } catch (e) {
      console.error('Post comment error:', e);
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setPosting(false);
    }
  };

  // ฟังก์ชันง่ายๆ พอกดซื้อก็โยนเข้าตะกร้าเลย
  const handleBuy = () => {
    if (product) {
      addToCart(product);
      Alert.alert("สำเร็จ", `คุณได้เพิ่ม ${product.name} ลงในตะกร้าแล้ว!`);
    }
  };

  // ถ้ายังโหลดหาข้อมูลอยู่ ให้โชว์หน้าจอหมุนติ้วๆ ไปก่อน
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  // ถ้าโหลดเสร็จแล้ว แต่หาสินค้าไม่เจอ (เช่น โดนลบไปแล้ว) ก็โชว์หน้านี้
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#F8FAFC' }}>ไม่พบสินค้านี้</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดสินค้า</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
          resizeMode="contain"
        />
        
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price} ฿</Text>

          <View style={styles.specBox}>
            <Text style={styles.specTitle}>ข้อมูลทางเทคนิค (Specifications)</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>แบรนด์:</Text>
              <Text style={styles.specValue}>{product.brand || '-'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>กำลังไฟ (Wattage):</Text>
              <Text style={styles.specValue}>{product.wattage ? `${product.wattage}W` : '-'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>มาตรฐาน (80+):</Text>
              <Text style={styles.specValue}>{product.efficiency_rating || '-'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>การถอดสาย:</Text>
              <Text style={styles.specValue}>{product.modular_type || '-'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>สินค้าคงเหลือ:</Text>
              <Text style={styles.specValue}>{product.stock > 0 ? `${product.stock} ชิ้น` : 'สินค้าหมด'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
            <Text style={styles.buyButtonText}>🛒 เพิ่มลงตะกร้า (Buy)</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>💬 รีวิวและความคิดเห็น</Text>
          
          {token ? (
            <View style={styles.commentInputBox}>
              <TextInput
                style={styles.commentInput}
                placeholder="เขียนความคิดเห็นของคุณที่นี่..."
                placeholderTextColor="#94A3B8"
                multiline
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity 
                style={[styles.postButton, !newComment.trim() && { opacity: 0.5 }]} 
                onPress={handlePostComment}
                disabled={!newComment.trim() || posting}
              >
                <Text style={styles.postButtonText}>{posting ? '...' : 'ส่ง'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginToComment}>
              <Text style={{ color: '#94A3B8' }}>กรุณาล็อกอินเพื่อแสดงความคิดเห็น</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={{ color: '#3B82F6', marginTop: 5 }}>เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.commentList}>
            {comments.length === 0 ? (
              <Text style={{ color: '#64748B', textAlign: 'center', marginVertical: 20 }}>
                ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!
              </Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentUser}>👤 {comment.username}</Text>
                  <Text style={styles.commentText}>{comment.comment_text}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString('th-TH', { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
        
        <View style={{ height: 40 }} />
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#F8FAFC' },
  content: { flex: 1 },
  productImage: { width: '100%', height: 300, backgroundColor: '#1E293B' },
  detailsContainer: { padding: 20 },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  productPrice: { fontSize: 24, fontWeight: 'bold', color: '#10B981', marginBottom: 20 },
  specBox: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 15, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  specTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 15 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  specLabel: { color: '#94A3B8', fontSize: 14 },
  specValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '500' },
  buyButton: {
    backgroundColor: '#3B82F6', paddingVertical: 15, borderRadius: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5
  },
  buyButtonText: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  
  commentsSection: { padding: 20, borderTopWidth: 1, borderTopColor: '#1E293B' },
  commentsTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 15 },
  commentInputBox: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  commentInput: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 8, color: '#F8FAFC',
    paddingHorizontal: 15, paddingVertical: 12, minHeight: 50, borderWidth: 1, borderColor: '#334155'
  },
  postButton: {
    backgroundColor: '#10B981', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 15, marginLeft: 10
  },
  postButtonText: { color: '#0F172A', fontWeight: 'bold' },
  loginToComment: {
    backgroundColor: '#1E293B', padding: 20, borderRadius: 8, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  commentList: { marginTop: 10 },
  commentCard: {
    backgroundColor: '#1E293B', padding: 15, borderRadius: 10, marginBottom: 15,
    borderLeftWidth: 4, borderLeftColor: '#3B82F6'
  },
  commentUser: { fontWeight: 'bold', color: '#F8FAFC', marginBottom: 5 },
  commentText: { color: '#CBD5E1', fontSize: 14, lineHeight: 22, marginBottom: 10 },
  commentDate: { color: '#64748B', fontSize: 12, alignSelf: 'flex-end' }
});
