# 📘 คู่มือการใช้งานและการนำเสนอโครงงาน (User & Presentation Manual)
**วิชา: Internet Programming — มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา**  
**หัวข้อ:** React Native (Apply AI/ML K-means for Grouping Stock Data)  
**ผู้พัฒนา:** std6730202483 (ฐานข้อมูล: `ip_std6730202483`)

---

## 📑 สารบัญ
1. [ภาพรวมสถาปัตยกรรมระบบ (Architecture Overview)](#1-ภาพรวมสถาปัตยกรรมระบบ-architecture-overview)
2. [โครงสร้างไฟล์ของโปรเจกต์ (Project Structure)](#2-โครงสร้างไฟล์ของโปรเจกต์-project-structure)
3. [การติดตั้งและเตรียมความพร้อม (Installation & Setup)](#3-การติดตั้งและเตรียมความพร้อม-installation--setup)
4. [วิธีเปิดใช้งานระบบทีละขั้นตอน (How to Run)](#4-วิธีเปิดใช้งานระบบทีละขั้นตอน-how-to-run)
5. [การใช้งานหน้า Dashboard & AI ในแอปพลิเคชัน](#5-การใช้งานหน้า-dashboard--ai-ในแอปพลิเคชัน)
6. [สคริปต์พูดนำเสนออาจารย์ (3-5 นาที ให้ได้คะแนนเต็ม)](#6-สคริปต์พูดนำเสนออาจารย์-presentation-script)
7. [การแก้ไขปัญหาเบื้องต้น (Troubleshooting)](#7-การแก้ไขปัญหาเบื้องต้น-troubleshooting)

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (Architecture Overview)

ระบบทำงานประสานกัน 4 ส่วนตามโฟลว์ในสไลด์การเรียน:

```text
[ MySQL Database ] (ตาราง psus - เก็บข้อมูลสินค้า 10 ชิ้น)
        │
        ▼ (SELECT * FROM psus)
[ Node.js / Express REST API ] (http://119.59.102.161:3047/api/products)
        │
        ├─────────────────────────────────────────┐
        ▼                                         ▼
[ Python AI/ML Analysis ]              [ React Native App (Expo) ]
  • elbow_method.py (หาค่า k)             • หน้า Home (เลือกซื้อสินค้า)
  • clustering.py (จัดกลุ่ม K-Means)      • หน้า Dashboard (Interactive Chart & Table)
        │                                         │
        ▼                                         ▼
[ ผลลัพธ์กราฟและตารางส่งอาจารย์ ]       [ หน้าจอ Interactive แสดงผลสด ]
```

---

## 2. โครงสร้างไฟล์ของโปรเจกต์ (Project Structure)

```text
MyProfileAppSirikasamkit/
├── backend/                       # โฟลเดอร์เซิร์ฟเวอร์ Backend (Node.js/Express)
│   ├── server.js                  # ไฟล์หลัก REST API (พอร์ต 3047)
│   ├── psus.sql                   # ข้อมูลจำลองสินค้า 10 ชิ้น
│   ├── package.json               # ไลบรารี Express, mysql2, cors, dotenv
│   └── .env                       # การตั้งค่าพอร์ตและ MySQL (ห้ามนำขึ้น Git)
│
├── analysis/                      # โฟลเดอร์ AI / Machine Learning (Python)
│   ├── elbow_method.py            # สคริปต์คำนวณและพล็อตกราฟ Elbow Method
│   ├── clustering.py              # สคริปต์รัน K-Means (k=3) และสรุป Insight
│   ├── requirements.txt           # รายการแพ็กเกจ (scikit-learn, pandas, matplotlib, requests)
│   ├── elbow_curve.png            # รูปภาพกราฟจุดศอกที่บันทึกแล้ว
│   └── cluster_results.png        # รูปภาพกราฟผลลัพธ์ Scatter Plot
│
├── src/                           # ซอร์สโค้ดแอปพลิเคชัน React Native (Expo)
│   ├── app/
│   │   ├── index.tsx              # หน้าแรกแสดงรายการสินค้าและเมนู
│   │   ├── sales.tsx              # หน้า Dashboard (แสดง AI K-Means & ยอดขาย)
│   │   ├── dashboard.tsx          # ทางลัดเข้าสู่หน้า Dashboard
│   │   ├── cart.tsx               # ตะกร้าสินค้า
│   │   └── checkout.tsx           # หน้าชำระเงิน
│   └── context/
│       └── AppContext.tsx         # ตัวจัดการ State กลางและการดึง API
└── MANUAL.md                      # คู่มือการใช้งานฉบับนี้
```

---

## 3. การติดตั้งและเตรียมความพร้อม (Installation & Setup)

### 3.1 การติดตั้งฝั่ง React Native / Node.js
เปิด Terminal ที่โฟลเดอร์หลักของโปรเจกต์ แล้วรัน:
```bash
npm install
```

### 3.2 การติดตั้งแพ็กเกจ Python สำหรับงาน AI/ML
```bash
pip install -r analysis/requirements.txt
```
*(ไลบรารีที่ติดตั้งประกอบด้วย: `scikit-learn`, `pandas`, `matplotlib`, `requests`)*

---

## 4. วิธีเปิดใช้งานระบบทีละขั้นตอน (How to Run)

### ขั้นตอนที่ 1: รันแอปพลิเคชัน React Native (Expo)
เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วพิมพ์:
```bash
npx expo start
```
* กด **`w`** เพื่อเปิดดูแอปบน **Web Browser**
* หรือสแกน QR Code ผ่านแอป **Expo Go** บนมือถือ

---

### ขั้นตอนที่ 2: รันสคริปต์วิเคราะห์ AI K-Means (Python)
เมื่อต้องการทดสอบหรือแสดงให้อาจารย์ดูการคำนวณสด:

1. **หาระดับกลุ่มที่เหมาะสม (Elbow Method):**
   ```bash
   python analysis/elbow_method.py
   ```
   * ระบบจะดึงข้อมูลสินค้าจาก API แล้วคำนวณค่า Inertia
   * หน้าต่างกราฟจะเด้งขึ้นมาแสดงจุดศอกที่ **$k = 3$** พร้อมบันทึกภาพ `analysis/elbow_curve.png`

2. **จัดกลุ่มสินค้าจริง (K-Means Clustering):**
   ```bash
   python analysis/clustering.py
   ```
   * ระบบจะแบ่งกลุ่มสินค้าทั้ง 10 ชิ้นออกเป็น 3 กลุ่ม (Budget, Mid-Range, Premium)
   * แสดงตารางสรุปผลใน Terminal และเปิดกราฟ Scatter Plot พร้อมบันทึกภาพ `analysis/cluster_results.png`

---

## 5. การใช้งานหน้า Dashboard & AI ในแอปพลิเคชัน

1. ในหน้าแรกของแอป ให้กดปุ่มไอคอน **📊 Dashboard** ที่แถบเมนูด้านล่าง (หรือกดปุ่มเมนู ☰ มุมซ้ายบน แล้วเลือก **`📊 แดชบอร์ด & AI Analytics`**)
2. ภายในหน้า Dashboard จะมีแท็บ **AI K-Means (10)**:
   * **การ์ด Simulated K-Means Clustering Results:**
     * กดปุ่ม **📊 (ไอคอนกราฟ):** เพื่อดูกราฟจุด Scatter Plot (แกน X: ราคา, แกน Y: ยอดขาย) โดยมีสีจุดแบ่งตามกลุ่มชัดเจน (🔵 น้ำเงิน, 🟠 ส้ม, 🟢 เขียว) สามารถใช้นิ้วแตะที่จุดเพื่อดูชื่อสินค้าและราคาได้
     * กดปุ่ม **📋 (ไอคอนตาราง):** เพื่อสลับเป็นตารางข้อมูลราคาสินค้าและยอดขายต่อเดือน แบ่งตามกลุ่ม
   * **ตาราง Cluster Characteristics Table:**
     * ตารางเปรียบเทียบ 3 กลุ่ม (Cluster 0, 1, 2) แสดงช่วงราคา, ปริมาณยอดขายเฉลี่ย และลักษณะโปรไฟล์สินค้าตรงตามสไลด์หน้า 10
3. แท็บ **Orders & Sales:**
   * ใช้สำหรับดูประวัติการสั่งซื้อและอัปเดตสถานะการจัดส่งสินค้า (สำหรับผู้ดูแลระบบ Admin)

---

## 6. สคริปต์พูดนำเสนออาจารย์ (Presentation Script)
*(ใช้เวลาประมาณ 3 นาที ชัดเจน ได้ใจความ และตรงประเด็น)*

> **1. กล่าวเปิดและเกริ่นภาพรวม (30 วินาที):**  
> *"สวัสดีครับอาจารย์ วันนี้ผมขอเสนอโครงงาน React Native ที่นำโมเดล Machine Learning แบบ Unsupervised Learning คือ K-Means Clustering มาประยุกต์ใช้ในการจัดกลุ่มสินค้า Power Supply (PSU) ในสต๊อก เพื่อเพิ่มประสิทธิภาพในการบริหารคลังสินค้าและการตั้งราคาครับ"*

> **2. การเตรียมข้อมูลและ REST API (45 วินาที):**  
> *"ระบบจัดเก็บข้อมูลไว้ในฐานข้อมูล MySQL ตาราง `psus` ทั้งหมด 10 รายการ โดยเซิร์ฟเวอร์ Node.js/Express จะเปิด REST API ที่ Endpoint `GET /api/products` เพื่อส่งข้อมูลเป็น JSON format ที่มีคุณสมบัติสำคัญคือ `name`, `price`, `wattage` และ `stock`"*

> **3. การหาค่า k ที่เหมาะสมด้วย Elbow Method (45 วินาที):**  
> *(เปิดภาพ `elbow_curve.png` หรือรัน `python analysis/elbow_method.py`)*  
> *"ก่อนจัดกลุ่ม เราทำ Data Preprocessing ด้วย `StandardScaler` และใช้ **Elbow Method** คำนวณค่า Inertia หรือ Sum of Squared Errors ตั้งแต่ $k=1$ ถึง $k=8$ พบว่าจุดที่กราฟหักศอกชัดเจนที่สุดคือ **$k = 3$** ซึ่งค่า Inertia ลดลงอย่างมีนัยสำคัญจาก 10.0 เหลือเพียง 0.58 จึงเลือก $k=3$ ในการจัดกลุ่มครับ"*

> **4. ผลลัพธ์การจัดกลุ่มและ Business Insights (1 นาที):**  
> *(เปิดหน้า Dashboard ในแอป หรือเปิดภาพ `cluster_results.png`)*  
> *"เมื่อรัน K-Means ($k=3$) ระบบแบ่งสินค้าออกเป็น 3 กลุ่มที่ชัดเจนครับ:*  
> * • **Cluster 0 (Budget):** สินค้าราคา 990 - 2,190 บาท เป็นกลุ่มราคาประหยัด ซื้อง่าย มีความถี่ในการขายสูง (High turnover) สต๊อกหมุนเวียนเร็ว  
> * • **Cluster 1 (Mid-range):** สินค้าราคา 2,790 - 4,590 บาท สเปก 80 Plus Gold เป็นสินค้ากลุ่มสร้างรายได้หลัก ยอดขายสม่ำเสมอ  
> * • **Cluster 2 (Premium):** สินค้าราคา 7,490 - 8,990 บาท สเปก Platinum/Titanium มีมาร์จิ้นกำไรต่อชิ้นสูง เน้นสต๊อกตามความต้องการของลูกค้าระดับสูง  
> *นอกจากนี้ ผมได้นำผลลัพธ์มาผสานเข้ากับหน้า Dashboard ของ React Native ให้สามารถสลับดูได้ทั้งแบบ Interactive Scatter Plot และตารางข้อมูลครับ"*

---

## 7. การแก้ไขปัญหาเบื้องต้น (Troubleshooting)

| ปัญหาที่อาจพบ | สาเหตุ | วิธีแก้ไข |
|:---|:---|:---|
| **รัน Python แล้วขึ้น `ModuleNotFoundError`** | ยังไม่ได้ลงไลบรารีใน Python ตัวที่กำลังรัน | รันคำสั่ง `pip install -r analysis/requirements.txt` |
| **ขึ้นเส้นหยักสีแดงใน VS Code** | VS Code ชี้ไปที่ Python ผิดเวอร์ชัน | กด `Ctrl + Shift + P` -> พิมพ์ `Python: Select Interpreter` -> เลือก `Python 3.14` |
| **ดึงข้อมูล API ไม่ได้ (Connection Error)** | เครื่องไม่ได้ต่อเน็ต หรือเซิร์ฟเวอร์ปิด | ตรวจสอบว่าอินเทอร์เน็ตใช้งานได้ และตรวจสอบ URL `http://119.59.102.161:3047/api/products` |
| **เปิดแอปหน้า Dashboard แล้วจอดำ/ไม่ขึ้นกราฟ** | State ยังโหลดข้อมูลไม่เสร็จ | กดปุ่มไอคอน **รีโหลด 🔄** ที่มุมขวาบนของหน้าจอ Dashboard เพื่อดึงข้อมูลใหม่ |
