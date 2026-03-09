import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        if (req.method === 'GET') {
            const batchRes = await pool.query(
                `SELECT b.*, p.name AS product_name
         FROM batches b
         LEFT JOIN products p ON b.product_id = p.id
         WHERE b.id = $1`,
                [id]
            );

            const batch = batchRes.rows[0];
            if (!batch) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy lô' });
            }

            batch.temperature_log = batch.temperature_log ? JSON.parse(batch.temperature_log) : [];
            batch.production_log = batch.production_log ? JSON.parse(batch.production_log) : [];

            return res.json({ success: true, batch });
        }

        if (req.method === 'PUT') {
            const { product_id, production_date, temperature_log, certificate_url, production_log } =
            req.body || {};

            await pool.query(
                `UPDATE batches
         SET product_id = $1, production_date = $2, temperature_log = $3, certificate_url = $4, production_log = $5
         WHERE id = $6`,
                [
                    product_id,
                    production_date,
                    JSON.stringify(temperature_log ?? []),
                    certificate_url,
                    JSON.stringify(production_log ?? []),
                    id,
                ]
            );

            return res.json({ success: true });
        }

        if (req.method === 'DELETE') {
            await pool.query(`DELETE FROM batches WHERE id = $1`, [id]);
            return res.json({ success: true });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Batch error:', error);
        return res.status(400).json({ success: false, message: 'Lỗi xử lý lô' });
    }
}