import pool, { initDB } from '../../server/db.js';
import { toInt } from '../../server/utils/common.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();
        const { code } = req.body;

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
}