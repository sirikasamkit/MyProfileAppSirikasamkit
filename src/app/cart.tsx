import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, CartItem } from '@/context/AppContext';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart } = useAppContext();

  const total = cart.reduce((sum, item) => {
    const priceStr = item.price.replace(/[^0-9]/g, '');
    const priceNum = parseInt(priceStr) || 0;
    return sum + (priceNum * item.quantity);
  }, 0);

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="contain" />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price} x {item.quantity}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
        <Text style={styles.removeIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={{ width: 30 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ไม่มีสินค้าในตะกร้า</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.back()}>
            <Text style={styles.shopButtonText}>กลับไปเลือกซื้อสินค้า</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>รวมทั้งหมด:</Text>
              <Text style={styles.totalValue}>฿{total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>ดำเนินการชำระเงิน</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F59E0B',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#FFF',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#F59E0B',
  },
  removeButton: {
    padding: 10,
  },
  removeIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    color: '#F8FAFC',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  checkoutButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
