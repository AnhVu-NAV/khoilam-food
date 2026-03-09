import bcrypt from 'bcryptjs';
import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const action = req.query?.action;

        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: 'Method not allowed' });
        }

        if (action === 'login') {
            const { email, password } = req.body || {};

            const userRes = await pool.query(
                `SELECT id, email, password, name, role, phone, address
         FROM users
         WHERE email = $1`,
                [email]
            );

            const user = userRes.rows[0];
            if (!user) {
                return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
            }

            const isValid = String(user.password).startsWith('$2')
                ? bcrypt.compareSync(password, String(user.password))
                : password === user.password;

            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
            }

            const { password: _password, ...userWithoutPassword } = user;
            return res.json({ success: true, user: userWithoutPassword });
        }

        if (action === 'register') {
            const { email, password, name } = req.body || {};

            const existed = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
            if ((existed.rowCount ?? 0) > 0) {
                return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
            }

            const pastOrdersRes = await pool.query(
                `SELECT phone, shipping_address
         FROM orders
         WHERE email = $1 AND user_id IS NULL
         ORDER BY id DESC
         LIMIT 1`,
                [email]
            );

            const phone = pastOrdersRes.rows[0]?.phone ?? null;
            const address = pastOrdersRes.rows[0]?.shipping_address ?? null;

            const result = await pool.query(
                `INSERT INTO users (email, password, name, phone, address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, role, phone, address`,
                [email, bcrypt.hashSync(password, 10), name, phone, address]
            );

            const user = result.rows[0];

            await pool.query(
                `UPDATE orders SET user_id = $1 WHERE email = $2 AND user_id IS NULL`,
                [user.id, email]
            );

            return res.json({ success: true, user });
        }

        return res.status(400).json({ success: false, message: 'Action không hợp lệ' });
    } catch (error: any) {
        console.error('Auth error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Lỗi server' });
    }
}