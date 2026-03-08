import express from 'express';
import { createServer as createViteServer } from 'vite';
import pool, { initDB } from './server/db';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import multer from 'multer';
import stream from 'stream';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  await initDB();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Upload Route
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
          message: 'Vui lòng cấu hình GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, và GOOGLE_REFRESH_TOKEN trong biến môi trường.' 
        });
      }

      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      const fileMetadata: any = {
        name: req.file.originalname,
      };
      
      if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
        fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
      }

      const media = {
        mimeType: req.file.mimetype,
        body: bufferStream,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      const fileId = response.data.id;
      if (!fileId) throw new Error('No file ID returned');

      // Make the file public
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      res.json({ success: true, url: imageUrl });
    } catch (error: any) {
      console.error('Drive upload error:', error);
      res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
  });

  // --- API ROUTES ---

  // Auth Routes
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const userRes = await pool.query('SELECT id, email, password, name, role FROM users WHERE email = $1', [email]);
      const user = userRes.rows[0];
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
      }

      const isValid = user.password.startsWith('$2') 
        ? bcrypt.compareSync(password, user.password) 
        : password === user.password;

      if (isValid) {
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
      } else {
        res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await pool.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, role', [email, hashedPassword, name]);
      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }
  });

  // Product Routes
  app.get('/api/products', async (req, res) => {
    try {
      const productsRes = await pool.query('SELECT * FROM products');
      res.json(productsRes.rows.map((p: any) => ({ ...p, weights: p.weights ? p.weights.split(',').map((w: string) => w.trim()) : [] })));
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.post('/api/products', async (req, res) => {
    const { id, name, description, price, category, image, weights, stock } = req.body;
    try {
      await pool.query('INSERT INTO products (id, name, description, price, category, image, weights, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
        [id, name, description, price, category, image, weights.join(','), stock || 100]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Lỗi thêm sản phẩm' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    const { name, description, price, category, image, weights, stock } = req.body;
    try {
      await pool.query('UPDATE products SET name = $1, description = $2, price = $3, category = $4, image = $5, weights = $6, stock = $7 WHERE id = $8', 
        [name, description, price, category, image, weights.join(','), stock || 0, req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Lỗi cập nhật sản phẩm' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  // Coupon Routes
  app.get('/api/coupons', async (req, res) => {
    try {
      const couponsRes = await pool.query('SELECT * FROM coupons');
      res.json(couponsRes.rows);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.post('/api/coupons', async (req, res) => {
    const { code, discount_percent } = req.body;
    try {
      await pool.query('INSERT INTO coupons (code, discount_percent) VALUES ($1, $2)', [code, discount_percent]);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Mã đã tồn tại' });
    }
  });

  app.put('/api/coupons/:code/status', async (req, res) => {
    const { is_active } = req.body;
    try {
      await pool.query('UPDATE coupons SET is_active = $1 WHERE code = $2', [is_active ? 1 : 0, req.params.code]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.post('/api/coupons/validate', async (req, res) => {
    const { code } = req.body;
    try {
      const couponRes = await pool.query('SELECT * FROM coupons WHERE code = $1 AND is_active = 1', [code]);
      const coupon = couponRes.rows[0];
      if (coupon) {
        res.json({ success: true, discount_percent: coupon.discount_percent });
      } else {
        res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  // Order Routes
  app.post('/api/orders', async (req, res) => {
    const { user_id, email, items, total, shipping_address, phone } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'INSERT INTO orders (user_id, email, total, shipping_address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user_id || null, email || null, total, shipping_address, phone]
      );
      const orderId = result.rows[0].id;

      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true, orderId });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng' });
    } finally {
      client.release();
    }
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const ordersRes = await pool.query(`
        SELECT o.*, u.name as user_name, u.email as user_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
      res.json(ordersRes.rows);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.get('/api/orders/:id/items', async (req, res) => {
    try {
      const itemsRes = await pool.query(`
        SELECT oi.*, p.name as product_name, p.image as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [req.params.id]);
      res.json(itemsRes.rows);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  // Analytics Routes
  app.get('/api/analytics', async (req, res) => {
    try {
      const totalRevenueRes = await pool.query("SELECT SUM(total) as sum FROM orders WHERE status != 'cancelled'");
      const orderCountRes = await pool.query("SELECT COUNT(*) as count FROM orders");
      const topProductsRes = await pool.query(`
        SELECT p.name, SUM(oi.quantity) as sold
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id 
        WHERE o.status != 'cancelled'
        GROUP BY p.id 
        ORDER BY sold DESC 
        LIMIT 5
      `);
      res.json({ 
        totalRevenue: totalRevenueRes.rows[0].sum || 0, 
        orderCount: orderCountRes.rows[0].count || 0, 
        topProducts: topProductsRes.rows 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  // Customers Routes
  app.get('/api/customers', async (req, res) => {
    try {
      const customersRes = await pool.query(`
        SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent
        FROM users u 
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.role = 'user' 
        GROUP BY u.id
        ORDER BY total_spent DESC
      `);
      res.json(customersRes.rows);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.get('/api/customers/:id/orders', async (req, res) => {
    try {
      const ordersRes = await pool.query(`
        SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC
      `, [req.params.id]);
      res.json(ordersRes.rows);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  // Batches Routes
  app.get('/api/batches', async (req, res) => {
    try {
      const batchesRes = await pool.query(`
        SELECT b.*, p.name as product_name 
        FROM batches b 
        LEFT JOIN products p ON b.product_id = p.id
        ORDER BY b.production_date DESC
      `);
      res.json(batchesRes.rows);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  app.post('/api/batches', async (req, res) => {
    const { id, product_id, production_date, temperature_log, certificate_url, production_log } = req.body;
    try {
      await pool.query("INSERT INTO batches (id, product_id, production_date, temperature_log, certificate_url, production_log) VALUES ($1, $2, $3, $4, $5, $6)", 
        [id, product_id, production_date, JSON.stringify(temperature_log), certificate_url, JSON.stringify(production_log || [])]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Lỗi tạo lô' });
    }
  });

  app.get('/api/batches/:id', async (req, res) => {
    try {
      const batchRes = await pool.query(`
        SELECT b.*, p.name as product_name 
        FROM batches b 
        LEFT JOIN products p ON b.product_id = p.id 
        WHERE b.id = $1
      `, [req.params.id]);
      
      const batch = batchRes.rows[0];
      if (batch) {
        batch.temperature_log = JSON.parse(batch.temperature_log);
        batch.production_log = batch.production_log ? JSON.parse(batch.production_log) : [];
        res.json({ success: true, batch });
      } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy lô' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
