import express from 'express';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import multer from 'multer';
import stream from 'stream';
import pool, { initDB } from './db';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const initPromise = initDB();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(async (_req, _res, next) => {
  try {
    await initPromise;
    next();
  } catch (error) {
    console.error('DB init middleware error:', error);
    next(error);
  }
});

const parseWeights = (weights: unknown): string[] => {
  if (Array.isArray(weights)) {
    return weights.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof weights === 'string') {
    return weights
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeProduct = (product: Record<string, any>) => ({
  ...product,
  weights: parseWeights(product.weights),
  stock: Number(product.stock ?? 0),
  price: Number(product.price ?? 0),
});

const toInt = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(500).json({
        success: false,
        message:
          'Vui lòng cấu hình GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET và GOOGLE_REFRESH_TOKEN.',
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const fileMetadata: {
      name: string;
      parents?: string[];
    } = {
      name: req.file.originalname,
    };

    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: 'id',
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error('No file ID returned');
    }

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return res.json({ success: true, url: imageUrl });
  } catch (error: any) {
    console.error('Drive upload error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Upload failed',
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query(
      `
        SELECT id, email, password, name, role, phone, address
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    const user = userRes.rows[0] as Record<string, any> | undefined;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const isValid = String(user.password).startsWith('$2')
      ? bcrypt.compareSync(password, String(user.password))
      : password === user.password;

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const { password: _password, ...userWithoutPassword } = user;
    return res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const pastOrdersRes = await pool.query(
      `
        SELECT phone, shipping_address
        FROM orders
        WHERE email = $1 AND user_id IS NULL
        ORDER BY id DESC
        LIMIT 1
      `,
      [email]
    );

    const phone = pastOrdersRes.rows[0]?.phone ?? null;
    const address = pastOrdersRes.rows[0]?.shipping_address ?? null;

    const result = await pool.query(
      `
        INSERT INTO users (email, password, name, phone, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name, role, phone, address
      `,
      [email, bcrypt.hashSync(password, 10), name, phone, address]
    );

    const user = result.rows[0] as Record<string, any>;

    await pool.query(
      `UPDATE orders SET user_id = $1 WHERE email = $2 AND user_id IS NULL`,
      [user.id, email]
    );

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Register error:', error);
    return res
      .status(400)
      .json({ success: false, message: 'Email đã tồn tại' });
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const productsRes = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
    return res.json(productsRes.rows.map((product) => normalizeProduct(product)));
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.post('/api/products', async (req, res) => {
  const {
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
    stock,
  } = req.body;

  try {
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
      `,
      [
        id,
        name,
        description,
        ingredients ?? '',
        storage ?? '',
        usage ?? '',
        toInt(price),
        category,
        image,
        parseWeights(weights).join(','),
        toInt(stock, 100),
      ]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Create product error:', error);
    return res
      .status(400)
      .json({ success: false, message: 'Lỗi thêm sản phẩm' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const {
    name,
    description,
    ingredients,
    storage,
    usage,
    price,
    category,
    image,
    weights,
    stock,
  } = req.body;

  try {
    await pool.query(
      `
        UPDATE products
        SET name = $1,
            description = $2,
            ingredients = $3,
            storage = $4,
            usage = $5,
            price = $6,
            category = $7,
            image = $8,
            weights = $9,
            stock = $10
        WHERE id = $11
      `,
      [
        name,
        description,
        ingredients ?? '',
        storage ?? '',
        usage ?? '',
        toInt(price),
        category,
        image,
        parseWeights(weights).join(','),
        toInt(stock),
        req.params.id,
      ]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return res
      .status(400)
      .json({ success: false, message: 'Lỗi cập nhật sản phẩm' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message:
        'Không thể xóa sản phẩm. Có thể sản phẩm đang nằm trong đơn hàng hoặc lô sản xuất.',
    });
  }
});

app.get('/api/coupons', async (_req, res) => {
  try {
    const couponsRes = await pool.query(`SELECT * FROM coupons ORDER BY code ASC`);
    return res.json(couponsRes.rows);
  } catch (error) {
    console.error('Get coupons error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.post('/api/coupons', async (req, res) => {
  const { code, discount_percent } = req.body;

  try {
    await pool.query(
      `INSERT INTO coupons (code, discount_percent) VALUES ($1, $2)`,
      [code, toInt(discount_percent)]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(400).json({ success: false, message: 'Mã đã tồn tại' });
  }
});

app.put('/api/coupons/:code/status', async (req, res) => {
  const { is_active } = req.body;

  try {
    await pool.query(`UPDATE coupons SET is_active = $1 WHERE code = $2`, [
      Boolean(is_active),
      req.params.code,
    ]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Update coupon status error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  const { code } = req.body;

  try {
    const couponRes = await pool.query(
      `SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE`,
      [code]
    );

    const coupon = couponRes.rows[0];
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn',
      });
    }

    return res.json({
      success: true,
      discount_percent: toInt(coupon.discount_percent),
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { user_id, email, items, total, shipping_address, phone } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query<{ id: number }>(
      `
        INSERT INTO orders (user_id, email, total, shipping_address, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [user_id || null, email || null, toInt(total), shipping_address, phone]
    );

    const orderId = result.rows[0].id;

    for (const item of items ?? []) {
      await client.query(
        `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.product_id, toInt(item.quantity, 1), toInt(item.price)]
      );
    }

    if (user_id) {
      await client.query(
        `UPDATE users SET phone = $1, address = $2 WHERE id = $3`,
        [phone, shipping_address, user_id]
      );
    }

    await client.query('COMMIT');
    return res.json({ success: true, orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Lỗi tạo đơn hàng' });
  } finally {
    client.release();
  }
});

app.get('/api/orders', async (_req, res) => {
  try {
    const ordersRes = await pool.query(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    return res.json(
      ordersRes.rows.map((order) => ({
        ...order,
        total: toInt(order.total),
      }))
    );
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/orders/:id/items', async (req, res) => {
  try {
    const itemsRes = await pool.query(
      `
        SELECT oi.*, p.name AS product_name, p.image AS product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `,
      [req.params.id]
    );

    return res.json(
      itemsRes.rows.map((item) => ({
        ...item,
        quantity: toInt(item.quantity, 1),
        price: toInt(item.price),
      }))
    );
  } catch (error) {
    console.error('Get order items error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { status, cancel_reason } = req.body;

  try {
    if (status === 'cancelled' && cancel_reason) {
      await pool.query(
        `UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3`,
        [status, cancel_reason, req.params.id]
      );
    } else {
      await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [
        status,
        req.params.id,
      ]);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/analytics', async (_req, res) => {
  try {
    const totalRevenueRes = await pool.query<{ sum: number }>(
      `SELECT COALESCE(SUM(total), 0)::int AS sum FROM orders WHERE status <> 'cancelled'`
    );

    const orderCountRes = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM orders`
    );

    const topProductsRes = await pool.query<{ name: string; sold: number }>(`
      SELECT p.name, COALESCE(SUM(oi.quantity), 0)::int AS sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status <> 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY sold DESC
      LIMIT 5
    `);

    return res.json({
      totalRevenue: totalRevenueRes.rows[0]?.sum ?? 0,
      orderCount: orderCountRes.rows[0]?.count ?? 0,
      topProducts: topProductsRes.rows,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/customers', async (_req, res) => {
  try {
    const customersRes = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.address,
        COUNT(o.id)::int AS order_count,
        COALESCE(SUM(o.total), 0)::int AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email, u.phone, u.address
      ORDER BY total_spent DESC, order_count DESC
    `);

    return res.json(customersRes.rows);
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const ordersRes = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );

    return res.json(ordersRes.rows);
  } catch (error) {
    console.error('Get customer orders error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/batches', async (_req, res) => {
  try {
    const batchesRes = await pool.query(`
      SELECT b.*, p.name AS product_name
      FROM batches b
      LEFT JOIN products p ON b.product_id = p.id
      ORDER BY b.production_date DESC
    `);

    return res.json(
      batchesRes.rows.map((batch) => ({
        ...batch,
        temperature_log: batch.temperature_log
          ? JSON.parse(batch.temperature_log)
          : [],
        production_log: batch.production_log ? JSON.parse(batch.production_log) : [],
      }))
    );
  } catch (error) {
    console.error('Get batches error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.post('/api/batches', async (req, res) => {
  const { id, product_id, production_date, temperature_log, certificate_url, production_log } =
    req.body;

  try {
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
      `,
      [
        id,
        product_id,
        production_date,
        JSON.stringify(temperature_log ?? []),
        certificate_url,
        JSON.stringify(production_log ?? []),
      ]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Create batch error:', error);
    return res.status(400).json({ success: false, message: 'Lỗi tạo lô' });
  }
});

app.put('/api/batches/:id', async (req, res) => {
  const { product_id, production_date, temperature_log, certificate_url, production_log } =
    req.body;

  try {
    await pool.query(
      `
        UPDATE batches
        SET product_id = $1,
            production_date = $2,
            temperature_log = $3,
            certificate_url = $4,
            production_log = $5
        WHERE id = $6
      `,
      [
        product_id,
        production_date,
        JSON.stringify(temperature_log ?? []),
        certificate_url,
        JSON.stringify(production_log ?? []),
        req.params.id,
      ]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Update batch error:', error);
    return res
      .status(400)
      .json({ success: false, message: 'Lỗi cập nhật lô' });
  }
});

app.delete('/api/batches/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM batches WHERE id = $1`, [req.params.id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete batch error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Không thể xóa lô sản xuất.' });
  }
});

app.get('/api/batches/:id', async (req, res) => {
  try {
    const batchRes = await pool.query(
      `
        SELECT b.*, p.name AS product_name
        FROM batches b
        LEFT JOIN products p ON b.product_id = p.id
        WHERE b.id = $1
      `,
      [req.params.id]
    );

    const batch = batchRes.rows[0];

    if (!batch) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy lô' });
    }

    batch.temperature_log = batch.temperature_log
      ? JSON.parse(batch.temperature_log)
      : [];
    batch.production_log = batch.production_log
      ? JSON.parse(batch.production_log)
      : [];

    return res.json({ success: true, batch });
  } catch (error) {
    console.error('Get batch detail error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled app error:', error);
  return res.status(500).json({
    success: false,
    message: error?.message || 'Lỗi server',
  });
});

export default app;
