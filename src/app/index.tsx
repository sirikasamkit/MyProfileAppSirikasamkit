import {
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { products, addToCart, cart, isAdmin, isUserLoggedIn, username, logout, deleteProduct } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  const parsePrice = (priceStr: string) => parseInt(priceStr.toString().replace(/[^0-9]/g, '')) || 0;

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchText.toLowerCase())
  // เรียงลำดับสินค้าตามราคา (น้อยไปมาก หรือ มากไปน้อย)
  ).sort((a: any, b: any) => {
    if (sortOrder === 'asc') return parsePrice(a.price) - parsePrice(b.price);
    if (sortOrder === 'desc') return parsePrice(b.price) - parsePrice(a.price);
    return 0; // ถ้าไม่เลือกเรียงอะไร ก็ปล่อยไว้แบบเดิม
  });

  // ฟังก์ชันเวลากดซื้อสินค้า
  const handleBuy = (item: any) => {
    addToCart(item); // โยนเข้าตะกร้า
    Alert.alert("เพิ่มลงตะกร้า", `คุณได้เพิ่ม ${item.name} ลงในตะกร้าแล้ว! ไปชำระเงินที่หน้าตะกร้าสินค้า`);
  };

  // ฟังก์ชันสำหรับกดยืนยันการลบสินค้า
  const confirmDelete = (item: any) => {
    if (typeof window !== 'undefined') {
      const confirm = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${item.name}?`);
      if (confirm) {
        deleteProduct(item.id);
      }
    } else {
      Alert.alert('ยืนยันการลบ', `คุณแน่ใจหรือไม่ว่าต้องการลบ ${item.name}?`, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: () => deleteProduct(item.id) }
      ]);
    }
  };

  // ส่วนของการ์ดโชว์สินค้าแต่ละตัว
  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      {/* Top: Image and Info */}
      <TouchableOpacity onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })} style={styles.productTop}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price} ฿</Text>
        </View>
      </TouchableOpacity>
      
      {/* Bottom: Action Buttons */}
      <View style={styles.productActions}>
        <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
          <Ionicons name="cart-outline" size={16} color="#0F172A" style={{ marginRight: 4 }} />
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
        
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity style={[styles.buyButton, { backgroundColor: '#3B82F6', shadowColor: '#3B82F6', paddingHorizontal: 12 }]} onPress={() => router.push({ pathname: '/add', params: { id: item.id } })}>
              <FontAwesome5 name="pen" size={12} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={[styles.buyButtonText, { color: '#FFF', fontSize: 11 }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buyButton, { backgroundColor: '#EF4444', shadowColor: '#EF4444', paddingHorizontal: 12 }]} onPress={() => confirmDelete(item)}>
              <Ionicons name="trash" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={[styles.buyButtonText, { color: '#FFF', fontSize: 11 }]}>Del</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* พื้นหลังไล่สีและลูกไฟอวกาศ */}
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#000000']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PSU Store</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
              <Ionicons name="cart" size={26} color="#F8FAFC" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.reduce((a, c) => a + c.quantity, 0)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search PSU..."
            placeholderTextColor="#999"
            editable={true}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
            <Text style={styles.addButtonText}>+ Add PSU</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Text style={styles.filterText}>Filter ▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={{color: '#fff', textAlign: 'center'}}>ไม่พบสินค้าที่คุณค้นหา</Text>}
        />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, { color: "#F59E0B", fontWeight: 'bold' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cart')}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/sales")}>
            <Text style={styles.navIcon}>📊</Text>
            <Text style={styles.navText}>Sales</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Modal */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เมนู</Text>
            
            {isAdmin || isUserLoggedIn ? (
              <>
                <View style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155', alignItems: 'center' }}>
                  <Text style={{ color: '#F8FAFC', fontSize: 16 }}>สวัสดีคุณ <Text style={{ fontWeight: 'bold', color: '#10B981' }}>{username}</Text></Text>
                  {isAdmin && <Text style={{ color: '#F59E0B', fontSize: 12 }}>[ผู้ดูแลระบบ]</Text>}
                </View>
                {!isAdmin && (
                  <TouchableOpacity style={styles.modalItem} onPress={() => { setMenuVisible(false); router.push('/orders'); }}>
                    <Text style={[styles.modalItemText, { color: '#10B981' }]}>📦 ติดตามสถานะคำสั่งซื้อ (Orders)</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.modalItem} onPress={() => { setMenuVisible(false); router.push('/profile'); }}>
                  <Text style={[styles.modalItemText, { color: '#3B82F6' }]}>👤 โปรไฟล์ส่วนตัว (My Profile)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => { setMenuVisible(false); logout(); }}>
                  <Text style={[styles.modalItemText, { color: '#EF4444' }]}>🚪 ออกจากระบบ (Logout)</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.modalItem} onPress={() => { setMenuVisible(false); router.push('/login'); }}>
                <Text style={[styles.modalItemText, { color: '#3B82F6' }]}>🔐 เข้าสู่ระบบ / สมัครสมาชิก</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setMenuVisible(false)}>
              <Text style={styles.closeModalText}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เรียงลำดับสินค้า</Text>
            <TouchableOpacity style={styles.modalItem} onPress={() => { setSortOrder('default'); setFilterVisible(false); }}>
              <Text style={styles.modalItemText}>⭐ เรียงตามปกติ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => { setSortOrder('asc'); setFilterVisible(false); }}>
              <Text style={styles.modalItemText}>📈 ราคา: ต่ำไปสูง</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => { setSortOrder('desc'); setFilterVisible(false); }}>
              <Text style={styles.modalItemText}>📉 ราคา: สูงไปต่ำ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setFilterVisible(false)}>
              <Text style={styles.closeModalText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  orb1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.4)', // ฟ้า
    shadowColor: '#3B82F6',
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20,
    filter: 'blur(50px)' as any, // ใช้งานได้บน Web/บาง Platform
  },
  orb2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(245, 158, 11, 0.3)', // ส้มทอง
    shadowColor: '#F59E0B',
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20,
    filter: 'blur(60px)' as any,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 24,
    color: "#F8FAFC",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F59E0B",
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#F8FAFC",
  },
  addButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    marginRight: 10,
  },
  addButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  filterButton: {
    justifyContent: "center",
  },
  filterText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  productList: {
    gap: 15,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: "column",
    backgroundColor: "rgba(30, 41, 59, 0.85)", // Glass effect
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    marginBottom: 15,
  },
  productTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 15,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: "#FFFFFF",
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F59E0B",
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F59E0B",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // Pill shape
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  buyButtonText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalItemText: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
