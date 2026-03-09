import pool, { initDB } from '../../../server/db.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await initDB();
        const { id } = req.query;
        const { status, cancel_reason } = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        if (status === 'cancelled' && cancel_reason) {
            await pool.query(
                `UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3`,
                [status, cancel_reason, id]
            );
        } else {
            await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}