import pool, { initDB } from '../../server/db.js';
import { toInt } from '../../server/utils/common.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        if (req.method === 'GET') {
            const couponsRes = await pool.query(`SELECT * FROM coupons ORDER BY code ASC`);
            return res.json(couponsRes.rows);
        }

        if (req.method === 'POST') {
            const { code, discount_percent } = req.body;

            await pool.query(
                `INSERT INTO coupons (code, discount_percent) VALUES ($1, $2)`,
                [code, toInt(discount_percent)]
            );

            return res.json({ success: true });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('Coupons API error:', error);
        return res.status(400).json({ success: false, message: 'Mã đã tồn tại hoặc lỗi server' });
    }
}