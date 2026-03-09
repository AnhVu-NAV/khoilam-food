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

        const { code } = req.body || {};

        const result = await pool.query(
            `
      SELECT code, discount_percent, is_active
      FROM coupons
      WHERE code = $1
      `,
            [code]
        );

        const coupon = result.rows[0];

        if (!coupon || !coupon.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Mã giảm giá không hợp lệ',
            });
        }

        return res.status(200).json({
            success: true,
            coupon,
        });
    } catch (error: any) {
        console.error('Coupon apply error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}