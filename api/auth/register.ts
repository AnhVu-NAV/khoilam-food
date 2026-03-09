import bcrypt from 'bcryptjs';
import pool, { initDB } from '../../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
        });
    }

    try {
        await initDB();

        const { email, password, name } = req.body || {};

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin đăng ký',
            });
        }

        const existed = await pool.query(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );

        if (existed.rowCount && existed.rowCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại',
            });
        }

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

        const user = result.rows[0];

        await pool.query(
            `UPDATE orders SET user_id = $1 WHERE email = $2 AND user_id IS NULL`,
            [user.id, email]
        );

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}