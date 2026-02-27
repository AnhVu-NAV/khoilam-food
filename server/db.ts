import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new Database(path.join(dbDir, 'khoilam.db'));

db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user'
  );
  
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    price INTEGER,
    category TEXT,
    image TEXT,
    weights TEXT,
    stock INTEGER DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    production_date TEXT,
    temperature_log TEXT,
    certificate_url TEXT,
    production_log TEXT
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    discount_percent INTEGER,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email TEXT,
    total INTEGER,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id TEXT,
    quantity INTEGER,
    price INTEGER,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed Admin User
const adminExists = db.prepare("SELECT * FROM users WHERE email = 'admin@khoilam.vn'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
    'admin@khoilam.vn', hashedPassword, 'Admin Khói Lam', 'admin'
  );
} else {
  // Fix legacy plain text password if exists
  const admin = adminExists as any;
  if (!admin.password.startsWith('$2')) {
    const hashedPassword = bcrypt.hashSync(admin.password, 10);
    db.prepare("UPDATE users SET password = ? WHERE email = 'admin@khoilam.vn'").run(hashedPassword);
  }
}

// Seed Regular User
const userExists = db.prepare("SELECT * FROM users WHERE email = 'khachhang@khoilam.vn'").get();
if (!userExists) {
  const hashedPassword = bcrypt.hashSync('khachhang123', 10);
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
    'khachhang@khoilam.vn', hashedPassword, 'Khách Hàng', 'user'
  );
} else {
  const user = userExists as any;
  if (!user.password.startsWith('$2')) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.prepare("UPDATE users SET password = ? WHERE email = 'khachhang@khoilam.vn'").run(hashedPassword);
  }
}

// Add email column to existing orders table if it doesn't exist
try {
  db.exec("ALTER TABLE orders ADD COLUMN email TEXT;");
} catch (e) {
  // Column already exists
}

// Add stock column to existing products table if it doesn't exist
try {
  db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 100;");
} catch (e) {
  // Column already exists
}

// Add production_log column to existing batches table if it doesn't exist
try {
  db.exec("ALTER TABLE batches ADD COLUMN production_log TEXT;");
} catch (e) {
  // Column already exists
}

// Seed Initial Products
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as {count: number};
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (id, name, description, price, category, image, weights) VALUES (?, ?, ?, ?, ?, ?, ?)");
  
  const initialProducts = [
    {
      id: 'trau-gac-bep',
      name: 'Thịt Trâu Gác Bếp',
      description: 'Trâu bản thả đồi, tẩm ướp Mắc khén, Hạt dổi, ớt rừng. Hun khói củi nhãn liên tục nhiều giờ để đượm mùi khói nhưng vẫn giữ độ ngọt mềm bên trong.',
      category: 'Thịt gác bếp',
      weights: '250g,500g,1kg',
      image: 'https://picsum.photos/seed/trau/800/800',
      price: 250000
    },
    {
      id: 'lon-ban-gac-bep',
      name: 'Thịt Lợn Bản Gác Bếp',
      description: 'Lợn đen vùng cao (phần thăn/mông), ướp gia vị thảo mộc núi rừng theo công thức cổ truyền. Sấy chậm trên gác bếp để thớ thịt săn lại, màu nâu óng tự nhiên.',
      category: 'Thịt gác bếp',
      weights: '250g,500g,1kg',
      image: 'https://picsum.photos/seed/lon/800/800',
      price: 200000
    },
    {
      id: 'lap-xuong-gac-bep',
      name: 'Lạp Xưởng Gác Bếp',
      description: 'Thịt nạc vai và mỡ phần hạt lựu, tẩm rượu men lá và gia vị. Nhồi ruột non thủ công, phơi nắng nhẹ rồi hun khói bã mía cho vỏ giòn, màu đỏ hồng.',
      category: 'Lạp xưởng',
      weights: '500g,1kg',
      image: 'https://picsum.photos/seed/lapxuong/800/800',
      price: 150000
    },
    {
      id: 'gia-vi-cham-cheo',
      name: 'Gia Vị Chẩm Chéo',
      description: 'Gia vị chấm đặc trưng của người Thái vùng Tây Bắc, kết hợp từ mắc khén, hạt dổi, ớt, tỏi, gừng và các loại rau thơm.',
      category: 'Gia vị',
      weights: '50g,100g',
      image: 'https://picsum.photos/seed/chamcheo/800/800',
      price: 35000
    },
    {
      id: 'tuong-ot-muong-khuong',
      name: 'Tương Ớt Mường Khương',
      description: 'Đặc sản tương ớt cay nồng từ Mường Khương, Lào Cai. Được làm từ ớt thóc bản địa, tỏi, hạt dổi, hạt thì là, thảo quả.',
      category: 'Gia vị',
      weights: '250ml,500ml',
      image: 'https://picsum.photos/seed/tuongot/800/800',
      price: 45000
    }
  ];

  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p.id, p.name, p.description, p.price, p.category, p.image, p.weights);
    }
  });
  insertMany(initialProducts);
}

// Seed initial coupon
const couponExists = db.prepare("SELECT * FROM coupons WHERE code = 'KHOILAM10'").get();
if (!couponExists) {
  db.prepare("INSERT INTO coupons (code, discount_percent, is_active) VALUES (?, ?, ?)").run('KHOILAM10', 10, 1);
}

// Ensure Tương ớt Mường Khương exists
const tuongOtExists = db.prepare("SELECT * FROM products WHERE id = 'tuong-ot-muong-khuong'").get();
if (!tuongOtExists) {
  db.prepare("INSERT INTO products (id, name, description, price, category, image, weights, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    'tuong-ot-muong-khuong',
    'Tương Ớt Mường Khương',
    'Đặc sản tương ớt cay nồng từ Mường Khương, Lào Cai. Được làm từ ớt thóc bản địa, tỏi, hạt dổi, hạt thì là, thảo quả.',
    45000,
    'Gia vị',
    'https://picsum.photos/seed/tuongot/800/800',
    '250ml,500ml',
    100
  );
}

// Seed initial batch
const batchExists = db.prepare("SELECT * FROM batches WHERE id = 'KL-TRB-2026-01'").get();
if (!batchExists) {
  const mockTempLog = JSON.stringify([
    { time: '0h', temp: 25, humidity: 60 },
    { time: '12h', temp: 65, humidity: 45 },
    { time: '24h', temp: 70, humidity: 40 },
    { time: '36h', temp: 68, humidity: 38 },
    { time: '48h', temp: 72, humidity: 35 },
    { time: '60h', temp: 70, humidity: 30 }
  ]);
  const mockProdLog = JSON.stringify([
    { date: '12/01/2026', title: 'Nhập nguyên liệu', description: 'Thịt trâu tươi từ bản Mường, đạt chuẩn thú y.' },
    { date: '13/01/2026', title: 'Tẩm ướp gia vị', description: 'Ướp mắc khén, hạt dổi, ớt rừng trong 12 tiếng.' },
    { date: '14/01/2026', title: 'Hun khói', description: 'Bắt đầu hun khói bằng củi nhãn liên tục 48 tiếng.' },
    { date: '16/01/2026', title: 'Đóng gói & Kiểm định', description: 'Hút chân không, dán tem truy xuất và lấy mẫu kiểm định.' }
  ]);
  db.prepare("INSERT INTO batches (id, product_id, production_date, temperature_log, certificate_url, production_log) VALUES (?, ?, ?, ?, ?, ?)").run(
    'KL-TRB-2026-01', 'trau-gac-bep', '2026-01-15', mockTempLog, 'ATVSTP Số 123/2026', mockProdLog
  );
}

export default db;
