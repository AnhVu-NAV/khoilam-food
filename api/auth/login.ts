import bcrypt from 'bcryptjs';
import pool, { initDB } from '../../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();

        const { email, password } = req.body || {};

        const userRes = await pool.query(
            `
        SELECT id, email, password, name, role, phone, address
        FROM users
        WHERE email = $1
      `,
            [email]
        );

        const user = userRes.rows[0];

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
        return res.status(200).json({ success: true, user: userWithoutPassword });
    } catch (error: any) {
        console.error('Login API error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}