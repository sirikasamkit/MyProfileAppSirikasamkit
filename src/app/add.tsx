import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';
import * as ImagePicker from 'expo-image-picker';

export default function AddEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addProduct, updateProduct, isAdmin, products, token } = useAppContext();
  
  // If id is provided, we are in Edit mode
  const existingProduct = id ? products.find(p => p.id === id) : null;

  const [name, setName] = useState(existingProduct?.name || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString().replace(/[^0-9.]/g, '') || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [stock, setStock] = useState(existingProduct?.stock?.toString() || '10');
  const [image, setImage] = useState(existingProduct?.image || existingProduct?.image_url || '');

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
        <View style={styles.formContainer}>
          <Text style={styles.label}>เฉพาะ Admin เท่านั้นที่เข้าถึงหน้านี้ได้</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      
      // Upload to server
      try {
        const formData = new FormData();
        const filename = selectedUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', { uri: selectedUri, name: filename, type } as any);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.imageUrl) {
          // The server returns a path like /uploads/123.jpg
          // We need the full URL
          setImage(`${API_BASE_URL}${data.imageUrl}`);
          Alert.alert('สำเร็จ', 'อัปโหลดรูปภาพเรียบร้อย');
        } else {
          Alert.alert('Error', data.error || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Upload Error:', error);
        Alert.alert('Error', 'เกิดข้อผิดพลาดในการอัปโหลดรูป');
      }
    }
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('เกิดข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const productData = {
      name,
      price: parseFloat(price),
      brand,
      stock: parseInt(stock),
      image
    };

    let success = false;
    if (id && existingProduct) {
      success = await updateProduct(id as string, productData);
    } else {
      success = await addProduct(productData);
    }

    if (success) {
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว!', [
        { text: 'ตกลง', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{id ? 'Edit PSU' : 'Add PSU'}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>ชื่อสินค้า</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น PSU คอม FSP 750W"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>แบรนด์</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น FSP, Corsair"
          placeholderTextColor="#94A3B8"
          value={brand}
          onChangeText={setBrand}
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

        <Text style={styles.label}>จำนวนในสต๊อก</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <Text style={styles.label}>รูปภาพสินค้า</Text>
        <View style={styles.imageRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginTop: 0 }]}
            placeholder="ใส่ URL รูปภาพ หรือ อัปโหลด"
            placeholderTextColor="#94A3B8"
            value={image}
            onChangeText={setImage}
          />
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.uploadBtnText}>เลือกรูป</Text>
          </TouchableOpacity>
        </View>
        
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
        ) : null}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>บันทึกสินค้า</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  imageRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  uploadBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 8,
    backgroundColor: '#1E293B',
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
