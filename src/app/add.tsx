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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CustomDropdown = ({ label, value, options, onSelect }: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.input, { justifyContent: 'center', minHeight: 50 }]} 
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: value ? '#F8FAFC' : '#94A3B8' }}>{value || `เลือก${label}`}</Text>
      </TouchableOpacity>
      
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={item => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => { onSelect(item); setVisible(false); }}>
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function AddEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addProduct, updateProduct, deleteProduct, isAdmin, products, token } = useAppContext();
  
  // ถ้ามี id ส่งมาแปลว่าเราจะ "แก้ไข" สินค้าตัวเก่า (หาของเก่ามาโชว์ก่อน)
  const existingProduct = id ? products.find(p => p.id === id) : null;

  // เตรียมที่เก็บข้อมูล (State) ไว้รับค่าจากช่องกรอกต่างๆ
  const [name, setName] = useState(existingProduct?.name || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString().replace(/[^0-9.]/g, '') || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [wattage, setWattage] = useState(existingProduct?.wattage?.toString() || '');
  const [efficiencyRating, setEfficiencyRating] = useState(existingProduct?.efficiency_rating || '');
  const [modularType, setModularType] = useState(existingProduct?.modular_type || '');
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

  // ฟังก์ชันนี้เรียกหน้าต่างอัลบั้มรูปในมือถือให้เด้งขึ้นมา
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // ถ้าเลือกรูปเสร็จและไม่ได้กดยกเลิก
      const selectedUri = result.assets[0].uri;
      
      // เอาละ ได้รูปมาแล้ว ก็เตรียมส่งไปให้เซิร์ฟเวอร์หลังบ้าน
      try {
        const formData = new FormData();
        const filename = selectedUri.split('/').pop() || 'image.jpg';
        
        try {
          // Fix for Web vs Native
          const response = await fetch(selectedUri);
          const blob = await response.blob();
          formData.append('image', blob, filename);
        } catch (err) {
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;
          formData.append('image', { uri: selectedUri, name: filename, type } as any);
        }

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

  // ฟังก์ชันนี้เรียกตอนกดปุ่ม "บันทึก" (Save) หรือ "แก้ไข"
  const handleSave = async () => {
    // ดักไว้ก่อนว่ากรอกชื่อกับราคาหรือยัง ห้ามปล่อยว่างนะ!
    if (!name || !price) {
      Alert.alert('เกิดข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const productData = {
      name,
      price: parseFloat(price),
      brand,
      wattage: wattage ? parseInt(wattage) : 0,
      efficiency_rating: efficiencyRating,
      modular_type: modularType,
      stock: parseInt(stock),
      image
    };

    let success = false;
    if (id && existingProduct) {
      success = await updateProduct(id as string, productData);
    } else {
      success = await addProduct(productData);
    }

    // ลุยเลย! ถ้าสำเร็จก็เด้งแจ้งเตือนแล้วพาผู้ใช้กลับหน้าแรก
    if (success) {
      if (typeof window !== 'undefined') {
        window.alert('บันทึกข้อมูลสุดแสนจะเพอร์เฟกต์เรียบร้อย!');
        router.replace('/');
      } else {
        Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว!', [
          { text: 'ตกลง', onPress: () => router.replace('/') }
        ]);
      }
    } else {
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // ฟังก์ชันสับสวิตช์สั่ง "ลบทิ้ง" (อันนี้มีแต่แอดมินที่กดได้)
  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? (ไม่สามารถกู้คืนได้)');
      if (confirmDelete) {
        processDelete();
      }
    } else {
      Alert.alert('ยืนยันการลบ', 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? (ไม่สามารถกู้คืนได้)', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: processDelete }
      ]);
    }
  };

  const processDelete = async () => {
    if (id) {
      const success = await deleteProduct(id as string);
      if (success) {
        if (typeof window !== 'undefined') {
          window.alert('ลบสินค้าเรียบร้อยแล้ว');
          router.replace('/');
        } else {
          Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: () => router.replace('/') }]);
        }
      } else {
        Alert.alert('ผิดพลาด', 'ไม่สามารถลบสินค้าได้');
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#000000']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
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

        <CustomDropdown
          label="กำลังไฟ (Wattage)"
          value={wattage}
          options={['450', '500', '550', '600', '650', '750', '850', '1000', '1200', '1600']}
          onSelect={setWattage}
        />

        <CustomDropdown
          label="มาตรฐาน 80+ (Efficiency)"
          value={efficiencyRating}
          options={['80 Plus White', '80 Plus Bronze', '80 Plus Silver', '80 Plus Gold', '80 Plus Platinum', '80 Plus Titanium']}
          onSelect={setEfficiencyRating}
        />

        <CustomDropdown
          label="ประเภทสาย (Modular Type)"
          value={modularType}
          options={['Non-Modular', 'Semi-Modular', 'Full Modular']}
          onSelect={setModularType}
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

        {id && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>ลบสินค้านี้</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
        <View style={{ height: 40 }} />
      </ScrollView>
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
    position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.4)', shadowColor: '#3B82F6', shadowOpacity: 1,
    shadowRadius: 100, elevation: 20, filter: 'blur(50px)' as any,
  },
  orb2: {
    position: 'absolute', bottom: 100, left: -100, width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(245, 158, 11, 0.3)', shadowColor: '#F59E0B', shadowOpacity: 1,
    shadowRadius: 100, elevation: 20, filter: 'blur(60px)' as any,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 12,
    color: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1E293B', width: '80%', maxHeight: '60%', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#334155'
  },
  modalOption: {
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingHorizontal: 20
  },
  modalOptionText: {
    color: '#F8FAFC', fontSize: 16, textAlign: 'center'
  }
});
