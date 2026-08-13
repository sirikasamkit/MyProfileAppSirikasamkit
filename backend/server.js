require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างตัวแอปขึ้นมา (เปรียบเหมือนสร้างบ้านให้ API ของเรา)
const app = express();
const port = process.env.PORT || 3047; // กำหนดช่องทางเข้าบ้าน (Port)

app.use(cors()); // เปิดประตูให้หน้าเว็บของเรายิงข้อมูลเข้ามาได้
app.use(express.json({ limit: '5mb' })); // รับข้อมูลที่เป็น JSON (แต่ห้ามใหญ่เกิน 5MB นะ)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // เปิดโฟลเดอร์ให้คนเข้ามาดูรูปภาพได้

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ตั้งค่าพี่ Multer เค้ามีหน้าที่เป็นยามรับรูปภาพแล้วเอาไปเก็บ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // สั่งให้เอาไปเก็บในโฟลเดอร์ uploads
  },
  filename: function (req, file, cb) {
    // เปลี่ยนชื่อไฟล์เป็นเวลาปัจจุบัน จะได้ไม่มีปัญหาชื่อรูปซ้ำกัน
    let ext = path.extname(file.originalname);
    if (!ext) {
      // ถ้าต้นทางไม่ได้ส่งนามสกุลไฟล์มาด้วย ให้พยายามเดาจาก mimetype
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/jpeg') ext = '.jpg';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else ext = '.jpg'; // ค่าเริ่มต้น
    }
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// MySQL Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00"
});

(async function initializeDB() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL:', process.env.DB_NAME);
    
    // Auto-create sales table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psu_id INT,
        name VARCHAR(255),
        price DECIMAL(10,2),
        quantity INT DEFAULT 1,
        total_price DECIMAL(10,2),
        username VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        tracking_number VARCHAR(100),
        payment_slip VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add columns to existing sales table if needed
    try {
      await conn.query("ALTER TABLE sales ADD COLUMN username VARCHAR(255), ADD COLUMN status VARCHAR(50) DEFAULT 'Pending', ADD COLUMN tracking_number VARCHAR(100)");
    } catch (e) {
      // Ignore
    }
    try {
      await conn.query("ALTER TABLE sales ADD COLUMN payment_slip VARCHAR(255)");
    } catch (e) {}
    console.log('Sales table ready');

    // Auto-create admins table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Admins are now managed directly in the database for security reasons
    console.log('Admins table ready');

    // Auto-create users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add columns if they don't exist (for existing table)
    try {
      await conn.query('ALTER TABLE users ADD COLUMN email VARCHAR(255), ADD COLUMN phone VARCHAR(20)');
    } catch (e) {}
    try {
      await conn.query('ALTER TABLE users ADD COLUMN address TEXT');
    } catch (e) {}
    console.log('Users table ready');

    // Auto-create comments table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psu_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Comments table ready');

    conn.release();
  } catch (err) {
    console.error('MySQL Failed:', err.message);
    process.exit(1);
  }
})();

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey', (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Admin Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (isMatch) {
      const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'mysecretkey', { expiresIn: '24h' });
      res.json({ token, role: 'admin', username, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    
    // Check if username already exists in users or admins
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const [existingAdmins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (existingUsers.length > 0 || existingAdmins.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, email, phone) VALUES (?, ?, ?, ?)', 
      [username, hashedPassword, email || '', phone || '']
    );
    
    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User Login
app.post('/api/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (isMatch) {
      const token = jwt.sign({ username, role: 'user' }, process.env.JWT_SECRET || 'mysecretkey', { expiresIn: '24h' });
      res.json({ token, role: 'user', username, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Image Upload Endpoint (Admin only)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL path
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// ดึงรายการสินค้าทั้งหมดไปโชว์หน้าเว็บ
app.get('/api/products', async (req, res) => {
  try {
    // สั่ง MySQL ว่า "ขอดูของทั้งหมดในโกดัง (ตาราง psus) หน่อย"
    const [rows] = await pool.query('SELECT * FROM psus');
    res.json(rows); // โยนข้อมูลที่ได้กลับไปให้หน้าเว็บ

  } catch (e) {
    console.error('Products Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add Product (Admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, brand, wattage, efficiency_rating, modular_type, price, stock, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO psus (name, brand, wattage, efficiency_rating, modular_type, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, brand || '', wattage || 0, efficiency_rating || '', modular_type || '', price || 0, stock || 0, image || null]
    );
    res.json({ message: 'Product added successfully', id: result.insertId });
  } catch (e) {
    console.error('Add Product Error:', e.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update Product (Admin only)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, wattage, efficiency_rating, modular_type, price, stock, image } = req.body;
    await pool.query(
      'UPDATE psus SET name=?, brand=?, wattage=?, efficiency_rating=?, modular_type=?, price=?, stock=?, image=? WHERE psu_id=?',
      [name, brand || '', wattage || 0, efficiency_rating || '', modular_type || '', price || 0, stock || 0, image || null, id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (e) {
    console.error('Update Product Error:', e.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// โหมดอ่านคอมเมนต์ของสินค้าแต่ละชิ้น
app.get('/api/products/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    // ไปดึงคอมเมนต์ที่เกี่ยวกับสินค้านี้มาโชว์ (เรียงจากใหม่สุดไปเก่าสุด)
    const [rows] = await pool.query('SELECT * FROM comments WHERE psu_id = ? ORDER BY created_at DESC', [id]);
    res.json(rows);
  } catch (e) {
    console.error('Fetch Comments Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// โหมดลบสินค้า (ต้องมีบัตรผ่านแอดมินถึงจะทำได้)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // ลบสินค้าชิ้นนี้ทิ้งจากตารางซะ!
    await pool.query('DELETE FROM psus WHERE psu_id=?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (e) {
    console.error('Delete Product Error:', e.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Post a Comment
app.post('/api/products/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, comment_text } = req.body;
    if (!username || !comment_text) return res.status(400).json({ error: 'Missing data' });
    
    await pool.query(
      'INSERT INTO comments (psu_id, username, comment_text) VALUES (?, ?, ?)',
      [id, username, comment_text]
    );
    res.json({ message: 'Comment added successfully' });
  } catch (e) {
    console.error('Post Comment Error:', e.message);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// ระบบตอนกดจ่ายเงิน
app.post('/api/checkout', async (req, res) => {
  try {
    const { items, username, payment_slip } = req.body; // รับของในตะกร้า, ชื่อคนซื้อ, และสลิป
    
    // ขั้นแรก: เช็คก่อนว่าสต๊อกพอขายไหม?
    for (const item of items) {
      const quantity = parseInt(item.quantity) || 1;
      const [stockCheck] = await pool.query('SELECT stock FROM psus WHERE psu_id = ?', [item.id]);
      if (stockCheck.length > 0 && stockCheck[0].stock < quantity) {
        // อ้าว ของหมด หรือไม่พอ ส่ง error กลับไปบอกหน้าเว็บเลย
        return res.status(400).json({ error: `สินค้า ${item.name} มีสต๊อกไม่พอ (เหลือ ${stockCheck[0].stock} ชิ้น)` });
      }
    }

    // ขั้นที่สอง: ถ้ารอดด่านแรกมาได้ ก็เริ่มหักของและบันทึกยอดขาย
    for (const item of items) {
      // แปลงราคาจากตัวอักษรเป็นตัวเลขเพียวๆ
      const rawPrice = item.price.toString().replace(/[^0-9.]/g, '');
      const itemPrice = parseFloat(rawPrice) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const totalPrice = itemPrice * quantity;
      
      // บันทึกออเดอร์ลงตารางบัญชี (sales)
      await pool.query(
        'INSERT INTO sales (psu_id, name, price, quantity, total_price, username, status, payment_slip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.name, itemPrice, quantity, totalPrice, username || null, 'รอตรวจสอบชำระเงิน', payment_slip || null]
      );

      // สำคัญมาก! ตัดสต๊อกสินค้าที่โดนซื้อออกไป
      await pool.query('UPDATE psus SET stock = stock - ? WHERE psu_id = ?', [quantity, item.id]);
    }
    res.json({ message: 'Checkout successful' });
  } catch (e) {
    console.error('Checkout Error:', e.message);
    res.status(500).json({ error: 'Failed to checkout' });
  }
});

// Get Sales (Admin only)
app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    console.error('Sales Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Reset Password (Forgot Password)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND email = ?', [username, email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Username หรือ Email ไม่ถูกต้อง' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, username]);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const [rows] = await pool.query('SELECT username, email, phone, address FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const { email, phone, address } = req.body;
    await pool.query(
      'UPDATE users SET email = ?, phone = ?, address = ? WHERE username = ?',
      [email, phone, address, username]
    );
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get User Orders
app.get('/api/user/orders', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const [rows] = await pool.query('SELECT * FROM sales WHERE username = ? ORDER BY created_at DESC', [username]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update Order Status and Tracking Number (Admin only)
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { status, tracking_number } = req.body;
    await pool.query(
      'UPDATE sales SET status = ?, tracking_number = ? WHERE id = ?',
      [status, tracking_number || null, id]
    );
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.get("/api", (req, res) => {
  res.send("API is running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});
