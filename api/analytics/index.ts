import pool, { initDB } from '../../server/db.js';

export default async function handler(_req: any, res: any) {
    try {
        await initDB();

        const totalRevenueRes = await pool.query<{ sum: number }>(
            `SELECT COALESCE(SUM(total), 0)::int AS sum FROM orders WHERE status <> 'cancelled'`
        );

        const orderCountRes = await pool.query<{ count: number }>(
            `SELECT COUNT(*)::int AS count FROM orders`
        );

        const topProductsRes = await pool.query<{ name: string; sold: number }>(`
      SELECT p.name, COALESCE(SUM(oi.quantity), 0)::int AS sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status <> 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY sold DESC
      LIMIT 5
    `);

        return res.json({
            totalRevenue: totalRevenueRes.rows[0]?.sum ?? 0,
            orderCount: orderCountRes.rows[0]?.count ?? 0,
            topProducts: topProductsRes.rows,
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}