import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();

  const categories = [
    { id: '1', name: 'Power Supply (PSU)', icon: '⚡' },
    { id: '2', name: 'Cables & Wiring', icon: '🔌' },
    { id: '3', name: 'Cooling Fans', icon: '❄️' },
    { id: '4', name: 'Accessories', icon: '📦' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>หมวดหมู่สินค้า</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryCard}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/")}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navText}>PSU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📁</Text>
          <Text style={[styles.navText, { color: "#F59E0B", fontWeight: 'bold' }]}>Categories</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#94A3B8',
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
  }
});
