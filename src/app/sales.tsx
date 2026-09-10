import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext, API_BASE_URL } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// โมเดลคำนวณ 1D K-Means Clustering บนข้อมูลสินค้า
function computeKMeans(products: any[], k = 3) {
  if (!products || products.length === 0) return { clusteredProducts: [], summary: [] };

  // จำลองยอดขายต่อเดือน (Units sold per month) ให้สอดคล้องกับพฤติกรรมเศรษฐศาสตร์ตามสไลด์ อ.สมเสาว์
  // สินค้าราคาถูก -> ยอดขายสูง (High turnover), สินค้าราคาแพง -> ยอดขายน้อย (Low volume)
  const simulatedMonthlySalesMap: { [key: number]: number } = {
    0: 120, // Budget 1
    1: 95,  // Budget 2
    2: 140, // Budget 3
    3: 110, // Budget 4
    4: 90,  // Mid 1
    5: 60,  // Mid 2
    6: 75,  // Mid 3
    7: 55,  // Mid 4
    8: 22,  // Premium 1
    9: 10,  // Premium 2
  };

  const parsed = products.map((p, idx) => {
    const rawPrice = typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString().replace(/[^0-9.]/g, '') || '0');
    const rawStock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock?.toString().replace(/[^0-9]/g, '') || '0');
    const rawWattage = typeof p.wattage === 'number' ? p.wattage : parseInt(p.wattage?.toString().replace(/[^0-9]/g, '') || '0');
    return {
      ...p,
      numericPrice: rawPrice,
      numericStock: rawStock,
      numericWattage: rawWattage,
      monthlySales: simulatedMonthlySalesMap[idx] || (rawStock * 5) || 50,
    };
  }).sort((a, b) => a.numericPrice - b.numericPrice);

  // อัปเดตยอดขายตามลำดับราคา (ถูกสุดยอดขายเยอะสุด -> แพงสุดยอดขายน้อยสุด)
  const salesPresets = [120, 95, 140, 110, 90, 60, 75, 55, 22, 10];
  parsed.forEach((p, idx) => {
    p.monthlySales = salesPresets[idx] || Math.max(10, 150 - idx * 14);
  });

  const prices = parsed.map(p => p.numericPrice);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  // กำหนด Centroids เริ่มต้น 3 จุด
  let centroids = [
    minP + (maxP - minP) * 0.15,
    minP + (maxP - minP) * 0.5,
    minP + (maxP - minP) * 0.85
  ];

  let assignments = new Array(parsed.length).fill(0);

  // รัน K-Means Iterations
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    for (let i = 0; i < parsed.length; i++) {
      let bestCluster = 0;
      let minDist = Infinity;
      for (let c = 0; c < k; c++) {
        const dist = Math.abs(parsed[i].numericPrice - centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    for (let c = 0; c < k; c++) {
      const clusterPoints = parsed.filter((_, idx) => assignments[idx] === c).map(p => p.numericPrice);
      if (clusterPoints.length > 0) {
        centroids[c] = clusterPoints.reduce((sum, val) => sum + val, 0) / clusterPoints.length;
      }
    }
    if (!changed) break;
  }

  // จัดเรียง Cluster ให้ 0 = budget, 1 = mid-range, 2 = premium
  const sortedCentroidIndices = centroids
    .map((val, idx) => ({ idx, val }))
    .sort((a, b) => a.val - b.val)
    .map((item, rank) => ({ oldIdx: item.idx, newIdx: rank }));

  const mapping: { [key: number]: number } = {};
  sortedCentroidIndices.forEach(item => {
    mapping[item.oldIdx] = item.newIdx;
  });

  const clusteredProducts = parsed.map((p, idx) => ({
    ...p,
    cluster: mapping[assignments[idx]],
  }));

  // ค่า Meta และสีตรงกับสไลด์หน้า 10 ของ อ.สมเสาว์นินดำ (Blue, Orange, Green)
  const clusterMeta = [
    {
      id: 0,
      name: "Cluster 0 (budget)",
      shortName: "Cluster 0 (budget)",
      color: "#2563EB", // น้ำเงินตามสไลด์
      bgColor: "rgba(37, 99, 235, 0.1)",
      borderColor: "rgba(37, 99, 235, 0.3)",
      salesLevel: "High (~116 units)",
      profile: "Cheap products, fast-moving, high turnover",
      profileTh: "สินค้าราคาประหยัด หมุนเวียนไว ซื้อง่าย ยอดขายต่อเดือนสูง"
    },
    {
      id: 1,
      name: "Cluster 1 (mid-range)",
      shortName: "Cluster 1 (mid-range)",
      color: "#EA580C", // ส้มตามสไลด์
      bgColor: "rgba(234, 88, 12, 0.1)",
      borderColor: "rgba(234, 88, 12, 0.3)",
      salesLevel: "Moderate (~70 units)",
      profile: "Mid-range products, steady sales",
      profileTh: "สินค้าระดับกลาง คุณภาพมาตรฐาน ยอดขายสม่ำเสมอต่อเนื่อง"
    },
    {
      id: 2,
      name: "Cluster 2 (premium)",
      shortName: "Cluster 2 (premium)",
      color: "#059669", // เขียวตามสไลด์
      bgColor: "rgba(5, 150, 105, 0.1)",
      borderColor: "rgba(5, 150, 105, 0.3)",
      salesLevel: "Low (~16 units)",
      profile: "Premium products, high price, low volume",
      profileTh: "สินค้าระดับพรีเมียม สเปกเรือธง ราคาสูง ยอดขายน้อยแต่กำไรดี"
    }
  ];

  const summary = clusterMeta.map(meta => {
    const items = clusteredProducts.filter(p => p.cluster === meta.id);
    const count = items.length;
    const minPrice = count > 0 ? Math.min(...items.map(p => p.numericPrice)) : 0;
    const maxPrice = count > 0 ? Math.max(...items.map(p => p.numericPrice)) : 0;
    const avgPrice = count > 0 ? items.reduce((a, b) => a + b.numericPrice, 0) / count : 0;
    const avgSales = count > 0 ? items.reduce((a, b) => a + b.monthlySales, 0) / count : 0;
    const totalStock = items.reduce((a, b) => a + b.numericStock, 0);

    return {
      ...meta,
      count,
      minPrice,
      maxPrice,
      avgPrice,
      avgSales: Math.round(avgSales),
      totalStock,
      items
    };
  });

  return { clusteredProducts, summary };
}

export default function SalesScreen() {
  const router = useRouter();
  const { isAdmin, token, products, fetchProducts } = useAppContext();

  // โหมดหลักของหน้า Dashboard: 'ai' (AI Analytics) หรือ 'orders' (คำสั่งซื้อ)
  const [activeTab, setActiveTab] = useState<'ai' | 'orders'>('ai');

  // สวิตช์สลับกราฟ/ตารางในวิดเจ็ตสไลด์ 10: 'chart' (Scatter Plot) หรือ 'table' (Data Table)
  const [slideWidgetView, setSlideWidgetView] = useState<'chart' | 'table'>('chart');
  const [activeTooltip, setActiveTooltip] = useState<any | null>(null);

  // ข้อมูลยอดขายสำหรับ Admin
  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // อัปเดตสถานะออเดอร์
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [viewingSlip, setViewingSlip] = useState<string | null>(null);

  // รัน K-Means Clustering (k=3)
  const { clusteredProducts, summary: clusterSummary } = useMemo(() => {
    return computeKMeans(products, 3);
  }, [products]);

  const fetchSales = async () => {
    if (!isAdmin || !token) return;
    setLoadingSales(true);
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
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (isAdmin) {
      fetchSales();
    }
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

  const totalRevenue = sales.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  const totalItemsSold = sales.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  // สเกลสำหรับพล็อตกราฟ Scatter Plot
  const maxChartPrice = 10000;
  const maxChartSales = 150;
  const yTicks = [140, 120, 100, 80, 60, 40, 20, 0];
  const xTicks = [0, 2000, 4000, 6000, 8000, 10000];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics & Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => { fetchProducts(); if (isAdmin) fetchSales(); }}>
          <Ionicons name="reload" size={20} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      {/* Segmented Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ai' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ai')}
        >
          <Ionicons
            name="hardware-chip-outline"
            size={18}
            color={activeTab === 'ai' ? '#0F172A' : '#94A3B8'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
            AI K-Means ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'orders' && styles.tabButtonActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="receipt-outline"
            size={18}
            color={activeTab === 'orders' ? '#0F172A' : '#94A3B8'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Orders & Sales
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: AI K-Means Analytics */}
      {activeTab === 'ai' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* ========================================================= */}
          {/* WIDGET ตามสไลด์หน้า 10 (Simulated K-Means Clustering Results) */}
          {/* ========================================================= */}
          <View style={styles.slideWidgetCard}>
            {/* Header with Title and Toggle Icons */}
            <View style={styles.slideWidgetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.slideWidgetTitle}>Simulated K-Means Clustering Results</Text>
                <Text style={styles.slideWidgetSubtitle}>Units sold per month by Product price (THB)</Text>
              </View>
              {/* Toggle Icons (Chart / Table) */}
              <View style={styles.viewToggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, slideWidgetView === 'chart' && styles.toggleBtnActive]}
                  onPress={() => setSlideWidgetView('chart')}
                >
                  <Ionicons
                    name="stats-chart"
                    size={16}
                    color={slideWidgetView === 'chart' ? '#2563EB' : '#94A3B8'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, slideWidgetView === 'table' && styles.toggleBtnActive]}
                  onPress={() => setSlideWidgetView('table')}
                >
                  <Ionicons
                    name="grid"
                    size={16}
                    color={slideWidgetView === 'table' ? '#2563EB' : '#94A3B8'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* VIEW 1: SCATTER CHART */}
            {slideWidgetView === 'chart' && (
              <View style={styles.chartContainer}>
                {/* Tooltip Overlay if point selected */}
                {activeTooltip && (
                  <View style={styles.tooltipBox}>
                    <Text style={styles.tooltipTitle}>{activeTooltip.name}</Text>
                    <Text style={styles.tooltipDesc}>
                      ราคา: {activeTooltip.numericPrice.toLocaleString()} ฿ | ยอดขาย: {activeTooltip.monthlySales} ชิ้น/เดือน
                    </Text>
                  </View>
                )}

                {/* Plot Area */}
                <View style={styles.plotAreaWrapper}>
                  {/* Y Axis Ticks */}
                  <View style={styles.yAxisCol}>
                    {yTicks.map((val) => (
                      <Text key={val} style={styles.axisLabel}>{val}</Text>
                    ))}
                  </View>

                  {/* Canvas Grid Area */}
                  <View style={styles.canvasArea}>
                    {/* Horizontal Grid lines */}
                    {yTicks.map((val) => (
                      <View key={val} style={styles.gridLineH} />
                    ))}

                    {/* Scatter Points */}
                    {clusteredProducts.map((p, idx) => {
                      const clusterMetaItem = clusterSummary.find(c => c.id === p.cluster);
                      const dotColor = clusterMetaItem?.color || '#2563EB';

                      // คำนวณตำแหน่งจุด % บนกราฟ
                      const leftPct = Math.min(94, Math.max(3, (p.numericPrice / maxChartPrice) * 100));
                      const bottomPct = Math.min(94, Math.max(3, (p.monthlySales / maxChartSales) * 100));

                      return (
                        <TouchableOpacity
                          key={p.id || idx}
                          onPress={() => setActiveTooltip(p)}
                          activeOpacity={0.7}
                          style={[
                            styles.scatterDot,
                            {
                              left: `${leftPct}%`,
                              bottom: `${bottomPct}%`,
                              backgroundColor: dotColor,
                            }
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>

                {/* X Axis Labels */}
                <View style={styles.xAxisRow}>
                  <View style={{ width: 26 }} />
                  <View style={styles.xAxisLabels}>
                    {xTicks.map((val) => (
                      <Text key={val} style={styles.axisLabel}>
                        {val === 0 ? '0' : val >= 1000 ? `${val / 1000}k` : val}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* VIEW 2: DATA TABLE */}
            {slideWidgetView === 'table' && (
              <View style={styles.tableContainer}>
                {/* Table Header Row */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thText, { width: 32 }]}>#</Text>
                  <Text style={[styles.thText, { flex: 1 }]}>Product price (THB)</Text>
                  <Text style={[styles.thText, { width: 140, textAlign: 'right' }]}>Units sold per month</Text>
                </View>

                {/* Groups */}
                {clusterSummary.map((group) => (
                  <View key={group.id} style={styles.clusterGroupContainer}>
                    {/* Cluster Subheader */}
                    <View style={styles.groupHeaderRow}>
                      <View style={[styles.groupDot, { backgroundColor: group.color }]} />
                      <Text style={[styles.groupHeaderText, { color: group.color }]}>
                        {group.name}
                      </Text>
                    </View>

                    {/* Product Rows in this Cluster */}
                    {group.items.map((item: any, rowIdx: number) => {
                      const overallIdx = clusteredProducts.findIndex(p => p.name === item.name) + 1;
                      return (
                        <View key={item.id || rowIdx} style={styles.tableDataRow}>
                          <Text style={[styles.tdText, { width: 32, color: '#64748B' }]}>
                            {overallIdx}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.tdPriceText}>
                              {item.numericPrice.toLocaleString()}
                            </Text>
                            <Text style={styles.tdProductName}>{item.name}</Text>
                          </View>
                          <Text style={[styles.tdText, { width: 140, textAlign: 'right', fontWeight: 'bold' }]}>
                            {item.monthlySales}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {/* Bottom Legend (ตามสไลด์หน้า 10) */}
            <View style={styles.legendRow}>
              {clusterSummary.map((c) => (
                <View key={c.id} style={styles.legendPill}>
                  <View style={[styles.legendDotCircle, { backgroundColor: c.color }]} />
                  <Text style={styles.legendPillText}>{c.shortName}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ========================================================= */}
          {/* ตารางคุณลักษณะของแต่ละกลุ่ม (Cluster characteristics table) */}
          {/* ========================================================= */}
          <View style={styles.characteristicsCard}>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.characteristicsTitle}>Cluster characteristics table</Text>
              <Text style={styles.characteristicsSubtitle}>for the slide alongside the chart</Text>
            </View>

            {/* Table Header */}
            <View style={styles.charTableHeader}>
              <Text style={[styles.charTh, { width: 50 }]}>Cluster</Text>
              <Text style={[styles.charTh, { width: 90 }]}>Price range</Text>
              <Text style={[styles.charTh, { width: 90 }]}>Avg. sales</Text>
              <Text style={[styles.charTh, { flex: 1 }]}>Product profile</Text>
            </View>

            {/* Table Rows */}
            {clusterSummary.map((c) => (
              <View key={c.id} style={styles.charTableRow}>
                {/* Cluster ID */}
                <View style={[styles.charCol, { width: 50 }]}>
                  <View style={[styles.clusterNumberBadge, { backgroundColor: c.bgColor, borderColor: c.borderColor }]}>
                    <Text style={[styles.clusterNumberText, { color: c.color }]}>{c.id}</Text>
                  </View>
                </View>

                {/* Price Range */}
                <View style={[styles.charCol, { width: 90 }]}>
                  <Text style={styles.charPriceText}>
                    {c.minPrice.toLocaleString()} - {c.maxPrice.toLocaleString()}
                  </Text>
                </View>

                {/* Avg Sales */}
                <View style={[styles.charCol, { width: 90 }]}>
                  <Text style={styles.charSalesText}>{c.salesLevel}</Text>
                </View>

                {/* Product Profile */}
                <View style={[styles.charCol, { flex: 1 }]}>
                  <Text style={styles.charProfileEn}>{c.profile}</Text>
                  <Text style={styles.charProfileTh}>{c.profileTh}</Text>
                </View>
              </View>
            ))}
          </View>


          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* TAB 2: Orders & Sales Management */}
      {activeTab === 'orders' && (
        <View style={styles.content}>
          {!isAdmin ? (
            <View style={styles.notAdminBox}>
              <Ionicons name="lock-closed" size={48} color="#F59E0B" style={{ marginBottom: 15 }} />
              <Text style={styles.notAdminTitle}>ระบบจัดการคำสั่งซื้อ (Admin Only)</Text>
              <Text style={styles.notAdminDesc}>
                กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (Admin) เพื่อดูยอดขายและอัปเดตสถานะจัดส่งพัสดุ
              </Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
                <Text style={styles.loginBtnText}>เข้าสู่ระบบ Admin</Text>
              </TouchableOpacity>
            </View>
          ) : loadingSales ? (
            <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 50 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sales Summary Box */}
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

              <Text style={styles.listTitle}>รายการสั่งซื้อ ({sales.length} ออเดอร์)</Text>
              {sales.length === 0 ? (
                <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>ยังไม่มีรายการขาย</Text>
              ) : (
                sales.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <View key={item.id} style={styles.saleCard}>
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
                })
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
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
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#1E293B',
    borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  refreshButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Segmented Tabs
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#1E293B', padding: 6,
    marginHorizontal: 16, marginTop: 12, marginBottom: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#334155'
  },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 8,
  },
  tabButtonActive: { backgroundColor: '#F59E0B' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: '#0F172A', fontWeight: '700' },

  content: { flex: 1, paddingHorizontal: 16 },

  // =========================================================
  // SLIDE 10 WIDGET STYLES (Light Card Theme matching Slide)
  // =========================================================
  slideWidgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  slideWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  slideWidgetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  slideWidgetSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  // Chart
  chartContainer: {
    paddingVertical: 8,
  },
  tooltipBox: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'center',
  },
  tooltipTitle: { color: '#F8FAFC', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  tooltipDesc: { color: '#94A3B8', fontSize: 10, textAlign: 'center', marginTop: 1 },

  plotAreaWrapper: {
    flexDirection: 'row',
    height: 180,
  },
  yAxisCol: {
    width: 26,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingVertical: 2,
  },
  axisLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '500',
  },
  canvasArea: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  gridLineH: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  scatterDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    transform: [{ translateX: -6 }, { translateY: 6 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  xAxisRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  xAxisLabels: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 4,
    paddingRight: 4,
  },

  // Table View
  tableContainer: {
    paddingVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 4,
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  clusterGroupContainer: {
    marginBottom: 8,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    paddingHorizontal: 6,
    marginVertical: 3,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdText: {
    fontSize: 12,
    color: '#1E293B',
  },
  tdPriceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tdProductName: {
    fontSize: 10,
    color: '#64748B',
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendPillText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },

  // =========================================================
  // CHARACTERISTICS TABLE STYLES (Slide 10 Table)
  // =========================================================
  characteristicsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  characteristicsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  characteristicsSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 1,
  },
  charTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  charTh: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  charTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  charCol: {
    justifyContent: 'center',
  },
  clusterNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  charPriceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  charSalesText: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  charProfileEn: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    lineHeight: 15,
  },
  charProfileTh: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 13,
  },


  // Orders Tab
  notAdminBox: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 24,
    alignItems: 'center', marginTop: 40, borderWidth: 1, borderColor: '#334155'
  },
  notAdminTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  notAdminDesc: { color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  loginBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  loginBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 },

  summaryBox: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 20, flexDirection: 'row',
    justifyContent: 'space-around', borderWidth: 1, borderColor: '#334155', marginBottom: 20, marginTop: 8
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 5 },
  summaryValue: { color: '#10B981', fontSize: 22, fontWeight: 'bold' },
  divider: { width: 1, backgroundColor: '#334155' },
  listTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  saleCard: {
    backgroundColor: '#1E293B', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#334155', marginBottom: 12
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  saleName: { color: '#F8FAFC', fontSize: 15, fontWeight: '600', flex: 1 },
  salePrice: { color: '#10B981', fontSize: 15, fontWeight: 'bold', marginLeft: 10 },
  buyerText: { color: '#3B82F6', fontSize: 13, marginBottom: 4 },
  saleDate: { color: '#94A3B8', fontSize: 11, marginBottom: 12 },
  statusBox: {
    backgroundColor: '#0F172A', padding: 10, borderRadius: 8, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  editBtn: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, alignSelf: 'flex-start' },
  editBtnText: { color: '#F8FAFC', fontSize: 12 },
  editBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginTop: 10 },
  statusButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  stBtn: {
    flex: 1, paddingVertical: 7, borderWidth: 1, borderColor: '#334155',
    alignItems: 'center', marginHorizontal: 2, borderRadius: 5
  },
  stBtnActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  stBtnText: { color: '#94A3B8' },
  stBtnTextActive: { color: '#0F172A', fontWeight: 'bold' },
  input: {
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
    color: '#F8FAFC', padding: 8, borderRadius: 5, fontSize: 13, marginTop: 5
  },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 10 },
  cancelBtn: { padding: 8, paddingHorizontal: 12 },
  saveBtn: { backgroundColor: '#10B981', padding: 8, paddingHorizontal: 16, borderRadius: 5 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  closeModalBtn: {
    position: 'absolute', top: 50, right: 20, padding: 10, backgroundColor: '#EF4444', borderRadius: 20, zIndex: 10
  },
  closeModalText: { color: '#FFF', fontWeight: 'bold' },
  slipModalImage: { width: '100%', height: '80%', borderRadius: 10 }
});
