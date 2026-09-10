import os
import sys
import requests
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ป้องกันปัญหา Unicode บน Windows Console (cp874)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ==========================================
# 1. เชื่อมต่อ API เพื่อดึงข้อมูลสินค้า
# ==========================================
API_URL = os.getenv("API_URL", "http://119.59.102.161:3047/api/products")

print(f"Connecting to API: {API_URL}")
try:
    res = requests.get(API_URL, timeout=10)
    res.raise_for_status()
    products_data = res.json()
    print(f"[OK] Successfully fetched {len(products_data)} products.\n")
except Exception as e:
    print(f"[Error] Failed to fetch products from API: {e}")
    sys.exit(1)

# ==========================================
# 2. แปลงข้อมูลและเตรียม Features
# ==========================================
df = pd.DataFrame(products_data)
df['price'] = pd.to_numeric(df['price'])
if 'stock' in df.columns:
    df['stock'] = pd.to_numeric(df['stock'])
if 'wattage' in df.columns:
    df['wattage'] = pd.to_numeric(df['wattage'])

# เลือก Feature 'price' ตามสไลด์การสอน
features = df[['price']]

# ทำ Data Scaling ด้วย StandardScaler
scaler = StandardScaler()
scaled = scaler.fit_transform(features)

# ==========================================
# 3. รัน K-Means Clustering (k = 3)
# ==========================================
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
raw_clusters = kmeans.fit_predict(scaled)

# จัดเรียง Cluster ID ให้เรียงตามราคาจากต่ำไปสูง (0 = Budget, 1 = Mid-range, 2 = Premium)
df['raw_cluster'] = raw_clusters
cluster_mean_prices = df.groupby('raw_cluster')['price'].mean().sort_values()
cluster_mapping = {old_id: new_id for new_id, old_id in enumerate(cluster_mean_prices.index)}
df['cluster'] = df['raw_cluster'].map(cluster_mapping)

# กำหนดชื่อกลุ่ม (Cluster Profile Label)
cluster_labels = {
    0: "Cluster 0 (Budget)",
    1: "Cluster 1 (Mid-Range)",
    2: "Cluster 2 (Premium)"
}
df['cluster_name'] = df['cluster'].map(cluster_labels)

# เรียงลำดับตามราคาเพื่อความเรียบร้อย
df = df.sort_values(by='price').reset_index(drop=True)

# ==========================================
# 4. แสดงผลลัพธ์การจัดกลุ่ม (Cluster Table)
# ==========================================
print("=" * 80)
print("           Product Clustering Results using K-Means (k=3)")
print("=" * 80)
print(f"{'#':<3} | {'Product Name':<32} | {'Price (THB)':<11} | {'Watt':<6} | {'Cluster Group':<20}")
print("-" * 80)
for idx, row in df.iterrows():
    watt_str = f"{row['wattage']}W" if pd.notna(row.get('wattage')) else "-"
    print(f"{idx+1:<3} | {row['name']:<32} | {row['price']:>11,.2f} | {watt_str:<6} | {row['cluster_name']:<20}")
print("=" * 80)

# ==========================================
# 5. สรุปคุณลักษณะของแต่ละกลุ่ม (Cluster Summary Table)
# ==========================================
print("\n" + "=" * 80)
print("            Cluster Characteristics & Business Insights")
print("=" * 80)
cluster_summary = []
for c_id in sorted(df['cluster'].unique()):
    c_df = df[df['cluster'] == c_id]
    min_p = c_df['price'].min()
    max_p = c_df['price'].max()
    avg_p = c_df['price'].mean()
    total_stock = c_df['stock'].sum() if 'stock' in c_df.columns else 0
    count = len(c_df)
    
    if c_id == 0:
        profile = "Budget segment: Entry-level, affordable, high turnover"
    elif c_id == 1:
        profile = "Mid-range segment: Balanced value, standard quality, steady sales"
    else:
        profile = "Premium segment: High performance, flagship specs, high margin"
        
    cluster_summary.append({
        'Cluster': cluster_labels[c_id],
        'Price Range': f"{min_p:,.0f} - {max_p:,.0f} THB",
        'Avg Price': f"{avg_p:,.2f} THB",
        'Product Count': f"{count} items",
        'Total Stock': f"{total_stock} units",
        'Profile': profile
    })

for item in cluster_summary:
    print(f"[*] {item['Cluster']}:")
    print(f"    - Price Range : {item['Price Range']} (Average: {item['Avg Price']})")
    print(f"    - Quantity    : {item['Product Count']} | Total Stock in Inventory: {item['Total Stock']}")
    print(f"    - Insight     : {item['Profile']}\n")
print("=" * 80)

# ==========================================
# 6. พล็อตกราฟ Scatter Plot แสดงผลการจัดกลุ่ม
# ==========================================
plt.figure(figsize=(10, 6))

colors = {0: '#10B981', 1: '#F59E0B', 2: '#EF4444'} # Green, Amber, Red
markers = {0: 'o', 1: 's', 2: '^'}

for c_id in [0, 1, 2]:
    subset = df[df['cluster'] == c_id]
    y_vals = subset['stock'] if 'stock' in df.columns else range(len(subset))
    plt.scatter(
        subset['price'],
        y_vals,
        color=colors[c_id],
        label=cluster_labels[c_id],
        s=130,
        alpha=0.85,
        edgecolor='black',
        marker=markers[c_id]
    )
    
    # ใส่ชื่อสินค้ากำกับไว้ข้างๆ จุด
    for _, row in subset.iterrows():
        y_coord = row['stock'] if 'stock' in df.columns else 0
        name_parts = row['name'].split()
        short_name = ' '.join(name_parts[:2]) if len(name_parts) >= 2 else row['name']
        plt.annotate(
            short_name,
            (row['price'], y_coord),
            textcoords="offset points",
            xytext=(0, 10),
            ha='center',
            fontsize=8,
            fontweight='bold',
            color='#334155'
        )

plt.title('K-Means Product Clustering Results (Price vs Stock)', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Product Price (THB)', fontsize=12)
plt.ylabel('Units in Stock', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(title='Clusters', fontsize=10, title_fontsize=11)
plt.tight_layout()

# บันทึกรูปผลลัพธ์
chart_path = os.path.join(os.path.dirname(__file__), 'cluster_results.png')
plt.savefig(chart_path, dpi=300)
print(f"[Saved] Cluster results chart saved to: {chart_path}\n")

try:
    plt.show()
except Exception:
    pass
