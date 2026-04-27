import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        if (req.method === 'GET') {
            const combosResult = await pool.query(`SELECT * FROM combos ORDER BY price ASC`);
            const itemsResult = await pool.query(`SELECT * FROM combo_items`);
            
            const combos = combosResult.rows.map((combo) => {
                const items = itemsResult.rows.filter(i => i.combo_id === combo.id);
                return { ...combo, items };
            });

            return res.json(combos);
        }

        if (req.method === 'POST') {
            const { id, name, description, price, badge, image, items } = req.body || {};
            await pool.query('BEGIN');
            try {
                const result = await pool.query(
                    `
                        INSERT INTO combos (id, name, description, price, badge, image)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `,
                    [id, name, description, price, badge, image]
                );

                if (Array.isArray(items)) {
                    for (const item of items) {
                        await pool.query(
                            `INSERT INTO combo_items (combo_id, product_id, quantity, label) VALUES ($1, $2, $3, $4)`,
                            [id, item.product_id || null, item.quantity, item.label]
                        );
                    }
                }
                await pool.query('COMMIT');
                return res.status(201).json({ success: true, combo: result.rows[0] });
            } catch (err) {
                await pool.query('ROLLBACK');
                throw err;
            }
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Combos error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}
