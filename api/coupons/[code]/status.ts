import pool, { initDB } from '../../../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();
        const { is_active } = req.body;
        const { code } = req.query;

        if (!code || Array.isArray(code)) {
            return res.status(400).json({ success: false, message: 'Mã không hợp lệ' });
        }

        await pool.query(`UPDATE coupons SET is_active = $1 WHERE code = $2`, [
            Boolean(is_active),
            code,
        ]);

        return res.json({ success: true });
    } catch (error) {
        console.error('Update coupon status error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}