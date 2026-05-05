import pool, { initDB } from '../server/db.js';

const parseJsonArray = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'string') return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeBatch = (batch: any) => ({
    ...batch,
    temperature_log: parseJsonArray(batch.temperature_log),
    production_log: parseJsonArray(batch.production_log),
    certificate_images: parseJsonArray(batch.certificate_images),
    quality_checks: parseJsonArray(batch.quality_checks),
});

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        // Single item operations
        if (id && !Array.isArray(id)) {
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

                return res.json({ success: true, batch: normalizeBatch(batch) });
            }

            if (req.method === 'PUT') {
                const {
                    product_id,
                    production_date,
                    temperature_log,
                    certificate_url,
                    production_log,
                    certificate_images,
                    quality_checks,
                } =
                req.body || {};

                await pool.query(
                    `
                        UPDATE batches
                        SET
                            product_id = $1,
                            production_date = $2,
                            temperature_log = $3,
                            certificate_url = $4,
                            production_log = $5,
                            certificate_images = $6,
                            quality_checks = $7
                        WHERE id = $8
                    `,
                    [
                        product_id,
                        production_date,
                        JSON.stringify(temperature_log ?? []),
                        certificate_url,
                        JSON.stringify(production_log ?? []),
                        JSON.stringify(certificate_images ?? []),
                        JSON.stringify(quality_checks ?? []),
                        id,
                    ]
                );

                return res.json({ success: true });
            }

            if (req.method === 'DELETE') {
                await pool.query(`DELETE FROM batches WHERE id = $1`, [id]);
                return res.json({ success: true });
            }

            return res.status(405).json({ success: false, message: 'Method not allowed for specific item' });
        }

        // Collection operations
        if (req.method === 'GET') {
            const batchesRes = await pool.query(
                `SELECT b.*, p.name AS product_name
         FROM batches b
         LEFT JOIN products p ON b.product_id = p.id
         ORDER BY b.production_date DESC`
            );

            return res.json(
                batchesRes.rows.map(normalizeBatch)
            );
        }

        if (req.method === 'POST') {
            const {
                id,
                product_id,
                production_date,
                temperature_log,
                certificate_url,
                production_log,
                certificate_images,
                quality_checks,
            } =
            req.body || {};

            await pool.query(
                `INSERT INTO batches (
          id, product_id, production_date, temperature_log, certificate_url, production_log, certificate_images, quality_checks
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    id,
                    product_id,
                    production_date,
                    JSON.stringify(temperature_log ?? []),
                    certificate_url,
                    JSON.stringify(production_log ?? []),
                    JSON.stringify(certificate_images ?? []),
                    JSON.stringify(quality_checks ?? []),
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
