import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();
        const id = req.query?.id;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        const itemsRes = await pool.query(
            `SELECT oi.*, p.name AS product_name, p.image AS product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [id]
        );

        return res.json(
            itemsRes.rows.map((item) => ({
                ...item,
                quantity: Number(item.quantity ?? 1),
                price: Number(item.price ?? 0),
            }))
        );
    } catch (error: any) {
        console.error('Order items error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Lỗi server' });
    }
}