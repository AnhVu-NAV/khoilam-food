import pool, { initDB } from '../server/db.js';

export default async function handler(_req: any, res: any) {
    try {
        await initDB();

        const dbRes = await pool.query(`SELECT current_database() AS db`);
        const countsRes = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM products) AS products_count,
        (SELECT COUNT(*)::int FROM users) AS users_count,
        (SELECT COUNT(*)::int FROM coupons) AS coupons_count,
        (SELECT COUNT(*)::int FROM batches) AS batches_count,
        (SELECT COUNT(*)::int FROM orders) AS orders_count
    `);

        return res.status(200).json({
            success: true,
            db: dbRes.rows[0]?.db,
            ...countsRes.rows[0],
        });
    } catch (error: any) {
        console.error('Health error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}