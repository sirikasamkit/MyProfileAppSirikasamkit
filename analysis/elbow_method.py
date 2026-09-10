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

# 1. เลือกลิงก์ API (ค่าเริ่มต้นคือเซิร์ฟเวอร์ 119.59.102.161:3047)
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

# 2. แปลงข้อมูลเป็น Pandas DataFrame
df = pd.DataFrame(products_data)
df['price'] = pd.to_numeric(df['price'])

# 3. เตรียม Feature และทำ Feature Scaling ด้วย StandardScaler
features = df[['price']]
scaler = StandardScaler()
scaled = scaler.fit_transform(features)

# 4. คำนวณ Inertia ด้วย Elbow Method (k ตั้งแต่ 1 ถึง 8)
max_k = min(9, len(df))
k_range = range(1, max_k)
inertias = []

for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(scaled)
    inertias.append(km.inertia_)

print("--- Inertia Values for each k ---")
for k, inertia in zip(k_range, inertias):
    print(f"k = {k}: Inertia = {inertia:.4f}")
print("---------------------------------\n")

# 5. พล็อตกราฟ Elbow Method
plt.figure(figsize=(8, 5))
plt.plot(list(k_range), inertias, marker='o', color='#2563EB', linewidth=2, markersize=8)
plt.title('Selecting the Number of Clusters k (Elbow Method)', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Number of clusters (k)', fontsize=12)
plt.ylabel('Inertia (Sum of squared distances)', fontsize=12)
plt.xticks(list(k_range))
plt.grid(True, linestyle='--', alpha=0.6)

# ทำเครื่องหมายจุดศอก (Elbow point k=3)
if 3 in k_range:
    plt.axvline(x=3, color='#EF4444', linestyle=':', label='Optimal k = 3 (Elbow Point)')
    plt.legend(fontsize=11)

plt.tight_layout()

# บันทึกเป็นรูปภาพสำหรับนำไปใส่รายงาน / พรีเซนต์
output_path = os.path.join(os.path.dirname(__file__), 'elbow_curve.png')
plt.savefig(output_path, dpi=300)
print(f"[Saved] Elbow curve image saved to: {output_path}")

try:
    plt.show()
except Exception:
    pass
