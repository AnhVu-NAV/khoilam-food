import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        if (req.method === 'GET') {
            const couponsRes = await pool.query(`SELECT * FROM coupons ORDER BY code ASC`);
            return res.json(couponsRes.rows);
        }

        if (req.method === 'POST') {
            const { code, discount_percent, action } = req.body || {};

            if (action === 'validate') {
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
                    discount_percent: Number(coupon.discount_percent ?? 0),
                });
            }

            await pool.query(`INSERT INTO coupons (code, discount_percent) VALUES ($1, $2)`, [
                code,
                Number(discount_percent ?? 0),
            ]);

            return res.json({ success: true });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Coupons error:', error);
        return res.status(400).json({ success: false, message: 'Mã đã tồn tại hoặc lỗi server' });
    }
}