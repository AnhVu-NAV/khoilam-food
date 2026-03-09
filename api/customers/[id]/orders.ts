import pool, { initDB } from '../../../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();
        const { id } = req.query;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        const ordersRes = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [id]
        );

        return res.json(ordersRes.rows);
    } catch (error) {
        console.error('Get customer orders error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}