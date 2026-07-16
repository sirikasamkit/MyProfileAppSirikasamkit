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

export default function HomeScreen() {
  const router = useRouter();
  const { products, addToCart, cart } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  const parsePrice = (priceStr: string) => parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchText.toLowerCase())
  ).sort((a: any, b: any) => {
    if (sortOrder === 'asc') return parsePrice(a.price) - parsePrice(b.price);
    if (sortOrder === 'desc') return parsePrice(b.price) - parsePrice(a.price);
    return 0;
  });

  const handleBuy = (item: any) => {
    addToCart(item);
    Alert.alert("เพิ่มลงตะกร้า", `คุณได้เพิ่ม ${item.name} ลงในตะกร้าแล้ว!`);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PSU Store</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.reduce((a, c) => a + c.quantity, 0)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search PSU..."
            placeholderTextColor="#999"
            editable={true}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
          <Text style={styles.addButtonText}>+ Add PSU</Text>
        </TouchableOpacity>
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
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add')}>
          <Text style={styles.navIcon}>➕</Text>
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={[styles.navText, { color: "#F59E0B", fontWeight: 'bold' }]}>PSU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/explore")}>
          <Text style={styles.navIcon}>📁</Text>
          <Text style={styles.navText}>Categories</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เมนู</Text>
            <TouchableOpacity style={styles.modalItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.modalItemText}>⚙️ การตั้งค่า (Settings)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.modalItemText}>ℹ️ เกี่ยวกับแอป (About)</Text>
            </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
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
  profileButton: {
    width: 30,
    height: 30,
    backgroundColor: "#F59E0B",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    marginRight: 15,
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
  profileIcon: {
    fontSize: 16,
    color: "#0F172A",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#1E293B",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
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
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: "#FFFFFF",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: "#F59E0B",
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 6,
  },
  buyButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
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
