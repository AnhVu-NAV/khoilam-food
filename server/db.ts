import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

let db: any;

const pool = {
  query: async (sql: string, params: any[] = []) => {
    if (!db) {
      db = await open({
        filename: 'database.sqlite',
        driver: sqlite3.Database
      });
    }
    
    const sqliteParams: Record<string, any> = {};
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        sqliteParams[`$${index + 1}`] = param;
      });
    }

    const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.toUpperCase().includes('RETURNING');
    
    try {
      if (isSelect) {
        const rows = await db.all(sql, sqliteParams);
        return { rows, rowCount: rows.length };
      } else {
        const result = await db.run(sql, sqliteParams);
        return { rows: [], rowCount: result.changes };
      }
    } catch (error) {
      console.error('Query error:', sql, params, error);
      throw error;
    }
  },
  connect: async () => {
    return {
      query: pool.query,
      release: () => {}
    };
  }
};

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user'
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        price INTEGER,
        category VARCHAR(255),
        image TEXT,
        weights TEXT,
        stock INTEGER DEFAULT 100
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255),
        production_date VARCHAR(255),
        temperature_log TEXT,
        certificate_url TEXT,
        production_log TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        discount_percent INTEGER,
        is_active INTEGER DEFAULT 1
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email VARCHAR(255),
        total INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        shipping_address TEXT,
        phone VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id),
        product_id VARCHAR(255) REFERENCES products(id),
        quantity INTEGER,
        price INTEGER
      );
    `);

    // Seed Admin User
    const adminRes = await pool.query("SELECT * FROM users WHERE email = 'admin@khoilam.vn'");
    if (adminRes.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
        ['admin@khoilam.vn', hashedPassword, 'Admin Khói Lam', 'admin']
      );
    } else {
      const admin = adminRes.rows[0];
      if (!admin.password.startsWith('$2')) {
        const hashedPassword = bcrypt.hashSync(admin.password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE email = 'admin@khoilam.vn'", [hashedPassword]);
      }
    }

    // Seed Factory Manager
    const fmRes = await pool.query("SELECT * FROM users WHERE email = 'quanlyxuong@khoilam.vn'");
    if (fmRes.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('quanly123', 10);
      await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
        ['quanlyxuong@khoilam.vn', hashedPassword, 'Quản Lý Xưởng', 'factory_manager']
      );
    }

    // Seed Seller
    const sellerRes = await pool.query("SELECT * FROM users WHERE email = 'banhang@khoilam.vn'");
    if (sellerRes.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('banhang123', 10);
      await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
        ['banhang@khoilam.vn', hashedPassword, 'Nhân Viên Bán Hàng', 'seller']
      );
    }

    // Seed Regular User
    const userRes = await pool.query("SELECT * FROM users WHERE email = 'khachhang@khoilam.vn'");
    if (userRes.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('khachhang123', 10);
      await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
        ['khachhang@khoilam.vn', hashedPassword, 'Khách Hàng', 'user']
      );
    } else {
      const user = userRes.rows[0];
      if (!user.password.startsWith('$2')) {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE email = 'khachhang@khoilam.vn'", [hashedPassword]);
      }
    }

    // Seed Initial Products
    const productCountRes = await pool.query("SELECT COUNT(*) as count FROM products");
    if (parseInt(productCountRes.rows[0].count) === 0) {
      const insertProductQuery = "INSERT INTO products (id, name, description, price, category, image, weights, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
      
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

      for (const p of initialProducts) {
        await pool.query(insertProductQuery, [p.id, p.name, p.description, p.price, p.category, p.image, p.weights, 100]);
      }
    }

    // Seed Initial Coupon
    const couponRes = await pool.query("SELECT * FROM coupons WHERE code = 'KHOILAM10'");
    if (couponRes.rows.length === 0) {
      await pool.query("INSERT INTO coupons (code, discount_percent, is_active) VALUES ($1, $2, $3)", ['KHOILAM10', 10, 1]);
    }

    // Seed initial batch
    const batchRes = await pool.query("SELECT * FROM batches WHERE id = 'KL-TRB-2026-01'");
    if (batchRes.rows.length === 0) {
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
      await pool.query(
        "INSERT INTO batches (id, product_id, production_date, temperature_log, certificate_url, production_log) VALUES ($1, $2, $3, $4, $5, $6)",
        ['KL-TRB-2026-01', 'trau-gac-bep', '2026-01-15', mockTempLog, 'ATVSTP Số 123/2026', mockProdLog]
      );
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

export default pool;
