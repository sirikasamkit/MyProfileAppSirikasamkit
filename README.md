# ⚡ PSU Store & AI K-Means Clustering App
> **Internet Programming Project — Kasetsart University Sriracha Campus**  
> *React Native (Apply AI/ML K-means for Grouping Stock Data)*

---

## 📌 สรุปภาพรวมโปรเจกต์
แอปพลิเคชันจัดการร้านค้า Power Supply (PSU) และวิเคราะห์การจัดกลุ่มสินค้าด้วย Machine Learning (K-Means Clustering) เชื่อมต่อฐานข้อมูล MySQL และ REST API แสดงผลทั้งในระดับ Data Science และบนหน้า Dashboard ของแอปพลิเคชัน React Native

📖 **ดูคู่มือการใช้งานและบทพูดนำเสนอฉบับเต็มได้ที่:** [MANUAL.md](./MANUAL.md)

---

## 🚀 คำสั่งเริ่มต้นใช้งานด่วน (Quick Start)

### 1. รันแอปพลิเคชัน React Native (Expo)
```bash
# ติดตั้ง dependencies
npm install

# รันแอป
npx expo start
```
* กด **`w`** เพื่อเปิดดูแอปบนเบราว์เซอร์
* กดเข้าเมนู **📊 Dashboard** เพื่อดูผลลัพธ์ AI K-Means แบบ Interactive

### 2. รันสคริปต์ AI / Machine Learning (Python)
```bash
# ติดตั้ง Library ที่จำเป็น
pip install -r analysis/requirements.txt

# 1. พล็อตกราฟหาค่า k (Elbow Method)
python analysis/elbow_method.py

# 2. จัดกลุ่มสินค้าและสรุปผล K-Means (k=3)
python analysis/clustering.py
```

---

## 📂 โครงสร้างโปรเจกต์
* `src/app/` — หน้าจอแอปพลิเคชัน (หน้าหลัก, Dashboard, ตะกร้าสินค้า)
* `backend/` — REST API (Node.js/Express) เชื่อมต่อฐานข้อมูล MySQL
* `analysis/` — สคริปต์ AI/ML K-Means Clustering และรูปภาพกราฟผลลัพธ์
* `MANUAL.md` — คู่มือการใช้งานและสคริปต์นำเสนออย่างละเอียด
