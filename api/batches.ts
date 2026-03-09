import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        if (req.method === 'GET') {
            const batchesRes = await pool.query(
                `SELECT b.*, p.name AS product_name
         FROM batches b
         LEFT JOIN products p ON b.product_id = p.id
         ORDER BY b.production_date DESC`
            );

            return res.json(
                batchesRes.rows.map((batch) => ({
                    ...batch,
                    temperature_log: batch.temperature_log ? JSON.parse(batch.temperature_log) : [],
                    production_log: batch.production_log ? JSON.parse(batch.production_log) : [],
                }))
            );
        }

        if (req.method === 'POST') {
            const { id, product_id, production_date, temperature_log, certificate_url, production_log } =
            req.body || {};

            await pool.query(
                `INSERT INTO batches (
          id, product_id, production_date, temperature_log, certificate_url, production_log
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    id,
                    product_id,
                    production_date,
                    JSON.stringify(temperature_log ?? []),
                    certificate_url,
                    JSON.stringify(production_log ?? []),
                ]
            );

            return res.json({ success: true });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Batches error:', error);
        return res.status(400).json({ success: false, message: 'Lỗi xử lý lô' });
    }
}