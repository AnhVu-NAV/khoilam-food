import pool, { initDB } from '../../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();

        const customersRes = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.address,
        COUNT(o.id)::int AS order_count,
        COALESCE(SUM(o.total), 0)::int AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email, u.phone, u.address
      ORDER BY total_spent DESC, order_count DESC
    `);

        return res.json(customersRes.rows);
    } catch (error) {
        console.error('Get customers error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}