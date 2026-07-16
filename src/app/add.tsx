import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';

export default function AddScreen() {
  const router = useRouter();
  const { addProduct } = useAppContext();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert('เกิดข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // Add product to global state
    addProduct({
      id: Math.random().toString(),
      name,
      price: `฿${price}`,
      image_url: image || 'https://raw.githubusercontent.com/sirikasamkit/MyProfileAppSirikasamkit/master/assets/images/psu/fsp.png' // Default image
    });

    Alert.alert('สำเร็จ', 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว!', [
      { text: 'ตกลง', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add PSU</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>ชื่อสินค้า</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น PSU คอม FSP 750W"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>ราคา (บาท)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 1590"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>URL รูปภาพ (ถ้ามี)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor="#94A3B8"
          value={image}
          onChangeText={setImage}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>บันทึกสินค้า</Text>
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
  formContainer: {
    padding: 20,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    color: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
