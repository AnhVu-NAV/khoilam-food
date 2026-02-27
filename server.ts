import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './server/db';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import multer from 'multer';
import stream from 'stream';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
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
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT id, email, password, name, role FROM users WHERE email = ?').get(email) as any;
    
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
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
      const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }
  });

  // Product Routes
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products.map((p: any) => ({ ...p, weights: p.weights ? p.weights.split(',').map((w: string) => w.trim()) : [] })));
  });

  app.post('/api/products', (req, res) => {
    const { id, name, description, price, category, image, weights, stock } = req.body;
    try {
      db.prepare('INSERT INTO products (id, name, description, price, category, image, weights, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, name, description, price, category, image, weights.join(','), stock || 100
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Lỗi thêm sản phẩm' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, description, price, category, image, weights, stock } = req.body;
    try {
      db.prepare('UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, weights = ?, stock = ? WHERE id = ?').run(
        name, description, price, category, image, weights.join(','), stock || 0, req.params.id
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Lỗi cập nhật sản phẩm' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Coupon Routes
  app.get('/api/coupons', (req, res) => {
    const coupons = db.prepare('SELECT * FROM coupons').all();
    res.json(coupons);
  });

  app.post('/api/coupons', (req, res) => {
    const { code, discount_percent } = req.body;
    try {
      db.prepare('INSERT INTO coupons (code, discount_percent) VALUES (?, ?)').run(code, discount_percent);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Mã đã tồn tại' });
    }
  });

  app.put('/api/coupons/:code/status', (req, res) => {
    const { is_active } = req.body;
    db.prepare('UPDATE coupons SET is_active = ? WHERE code = ?').run(is_active ? 1 : 0, req.params.code);
    res.json({ success: true });
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code } = req.body;
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code) as any;
    if (coupon) {
      res.json({ success: true, discount_percent: coupon.discount_percent });
    } else {
      res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }
  });

  // Order Routes
  app.post('/api/orders', (req, res) => {
    const { user_id, email, items, total, shipping_address, phone } = req.body;
    
    const insertOrder = db.transaction(() => {
      const result = db.prepare('INSERT INTO orders (user_id, email, total, shipping_address, phone) VALUES (?, ?, ?, ?, ?)').run(
        user_id || null, email || null, total, shipping_address, phone
      );
      const orderId = result.lastInsertRowid;

      const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
      }
      return orderId;
    });

    try {
      const orderId = insertOrder();
      res.json({ success: true, orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng' });
    }
  });

  app.get('/api/orders', (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  app.get('/api/orders/:id/items', (req, res) => {
    const items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);
    res.json(items);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  // Analytics Routes
  app.get('/api/analytics', (req, res) => {
    const totalRevenue = db.prepare("SELECT SUM(total) as sum FROM orders WHERE status != 'cancelled'").get() as any;
    const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
    const topProducts = db.prepare(`
      SELECT p.name, SUM(oi.quantity) as sold
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id 
      WHERE o.status != 'cancelled'
      GROUP BY p.id 
      ORDER BY sold DESC 
      LIMIT 5
    `).all();
    res.json({ 
      totalRevenue: totalRevenue.sum || 0, 
      orderCount: orderCount.count || 0, 
      topProducts 
    });
  });

  // Customers Routes
  app.get('/api/customers', (req, res) => {
    const customers = db.prepare(`
      SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent
      FROM users u 
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'user' 
      GROUP BY u.id
      ORDER BY total_spent DESC
    `).all();
    res.json(customers);
  });

  app.get('/api/customers/:id/orders', (req, res) => {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.params.id);
    res.json(orders);
  });

  // Batches Routes
  app.get('/api/batches', (req, res) => {
    const batches = db.prepare(`
      SELECT b.*, p.name as product_name 
      FROM batches b 
      LEFT JOIN products p ON b.product_id = p.id
      ORDER BY b.production_date DESC
    `).all();
    res.json(batches);
  });

  app.post('/api/batches', (req, res) => {
    const { id, product_id, production_date, temperature_log, certificate_url, production_log } = req.body;
    try {
      db.prepare("INSERT INTO batches (id, product_id, production_date, temperature_log, certificate_url, production_log) VALUES (?, ?, ?, ?, ?, ?)").run(
        id, product_id, production_date, JSON.stringify(temperature_log), certificate_url, JSON.stringify(production_log || [])
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Lỗi tạo lô' });
    }
  });

  app.get('/api/batches/:id', (req, res) => {
    const batch = db.prepare(`
      SELECT b.*, p.name as product_name 
      FROM batches b 
      LEFT JOIN products p ON b.product_id = p.id 
      WHERE b.id = ?
    `).get(req.params.id) as any;
    
    if (batch) {
      batch.temperature_log = JSON.parse(batch.temperature_log);
      batch.production_log = batch.production_log ? JSON.parse(batch.production_log) : [];
      res.json({ success: true, batch });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy lô' });
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
