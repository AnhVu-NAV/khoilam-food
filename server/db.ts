import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { products } from '../src/data/products.js';

type QueryResultRow = Record<string, unknown>;

declare global {
    var __khoiLamPool: Pool | undefined;
    var __khoiLamInitPromise: Promise<void> | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Thiếu DATABASE_URL');

const pool =
    globalThis.__khoiLamPool ||
    new Pool({
        connectionString,
        max: 5,
    });

if (!globalThis.__khoiLamPool) {
    globalThis.__khoiLamPool = pool;
}

const ensureUserColumns = async () => {
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`);
};

const ensureProductColumns = async () => {
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS storage TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS usage TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100`);
};

const ensureOrderColumns = async () => {
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT`);
};

const seedUsers = async () => {
  const users = [
    {
      email: 'admin@khoilam.vn',
      password: 'admin123',
      name: 'Admin Khói Lam',
      role: 'admin',
    },
    {
      email: 'quanlyxuong@khoilam.vn',
      password: 'quanly123',
      name: 'Quản Lý Xưởng',
      role: 'factory_manager',
    },
    {
      email: 'banhang@khoilam.vn',
      password: 'banhang123',
      name: 'Nhân Viên Bán Hàng',
      role: 'seller',
    },
    {
      email: 'khachhang@khoilam.vn',
      password: 'khachhang123',
      name: 'Khách Hàng',
      role: 'user',
    },
  ];

  for (const user of users) {
    await pool.query(
      `
        INSERT INTO users (email, password, name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `,
      [user.email, bcrypt.hashSync(user.password, 10), user.name, user.role]
    );
  }
};

const seedProducts = async () => {
  const productCountRes = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM products`
  );

  if (productCountRes.rows[0]?.count > 0) {
    return;
  }

  for (const product of products) {
    await pool.query(
      `
        INSERT INTO products (
          id,
          name,
          description,
          ingredients,
          storage,
          usage,
          price,
          category,
          image,
          weights,
          stock
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `,
      [
        product.id,
        product.name,
        product.description,
        product.ingredients,
        product.storage,
        product.usage,
        product.price,
        product.category,
        product.image,
        product.weights.join(','),
        product.stock ?? 100,
      ]
    );
  }
};

const seedCoupons = async () => {
  await pool.query(
    `
      INSERT INTO coupons (code, discount_percent, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT (code) DO NOTHING
    `,
    ['KHOILAM10', 10, true]
  );
};

const seedBatches = async () => {
  const batchExists = await pool.query(`SELECT 1 FROM batches WHERE id = $1`, [
    'KL-TRB-2026-01',
  ]);

  if (batchExists.rowCount && batchExists.rowCount > 0) {
    return;
  }

  const mockTempLog = JSON.stringify([
    { time: '0h', temp: 25, humidity: 60 },
    { time: '12h', temp: 65, humidity: 45 },
    { time: '24h', temp: 70, humidity: 40 },
    { time: '36h', temp: 68, humidity: 38 },
    { time: '48h', temp: 72, humidity: 35 },
    { time: '60h', temp: 70, humidity: 30 },
  ]);

  const mockProdLog = JSON.stringify([
    {
      date: '12/01/2026',
      title: 'Nhập nguyên liệu',
      description: 'Thịt trâu tươi từ bản Mường, đạt chuẩn thú y.',
    },
    {
      date: '13/01/2026',
      title: 'Tẩm ướp gia vị',
      description: 'Ướp mắc khén, hạt dổi, ớt rừng trong 12 tiếng.',
    },
    {
      date: '14/01/2026',
      title: 'Hun khói',
      description: 'Bắt đầu hun khói bằng củi nhãn liên tục 48 tiếng.',
    },
    {
      date: '16/01/2026',
      title: 'Đóng gói & Kiểm định',
      description: 'Hút chân không, dán tem truy xuất và lấy mẫu kiểm định.',
    },
  ]);

  await pool.query(
    `
      INSERT INTO batches (
        id,
        product_id,
        production_date,
        temperature_log,
        certificate_url,
        production_log
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `,
    [
      'KL-TRB-2026-01',
      'trau-gac-bep',
      '2026-01-15',
      mockTempLog,
      'ATVSTP Số 123/2026',
      mockProdLog,
    ]
  );
};

export const initDB = async () => {
  if (globalThis.__khoiLamInitPromise) {
    return globalThis.__khoiLamInitPromise;
  }

  globalThis.__khoiLamInitPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(50),
        address TEXT
      );
    `);

    await ensureUserColumns();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        ingredients TEXT DEFAULT '',
        storage TEXT DEFAULT '',
        usage TEXT DEFAULT '',
        price INTEGER,
        category VARCHAR(255),
        image TEXT,
        weights TEXT,
        stock INTEGER DEFAULT 100
      );
    `);

    await ensureProductColumns();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) REFERENCES products(id) ON DELETE RESTRICT,
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
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        email VARCHAR(255),
        total INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        shipping_address TEXT,
        phone VARCHAR(50),
        cancel_reason TEXT
      );
    `);

    await ensureOrderColumns();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGSERIAL PRIMARY KEY,
        order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(255) REFERENCES products(id) ON DELETE RESTRICT,
        quantity INTEGER,
        price INTEGER
      );
    `);

    await seedUsers();
    await seedProducts();
    await seedCoupons();
    await seedBatches();
  })().catch((error) => {
    globalThis.__khoiLamInitPromise = undefined;
    throw error;
  });

  return globalThis.__khoiLamInitPromise;
};

export type DBRow = QueryResultRow;
export default pool;
