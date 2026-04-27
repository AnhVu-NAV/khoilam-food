import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        // Single item operations
        if (id && !Array.isArray(id)) {
            if (req.method === 'GET') {
                const comboRes = await pool.query(`SELECT * FROM combos WHERE id = $1`, [id]);
                if ((comboRes.rowCount ?? 0) === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
                
                const itemsRes = await pool.query(`SELECT * FROM combo_items WHERE combo_id = $1`, [id]);
                const combo = { ...comboRes.rows[0], items: itemsRes.rows };
                return res.json(combo);
            }

            if (req.method === 'PUT') {
                const { name, description, price, badge, image, items } = req.body || {};
                await pool.query('BEGIN');
                try {
                    const comboRes = await pool.query(
                        `
                            UPDATE combos
                            SET name = $1, description = $2, price = $3, badge = $4, image = $5
                            WHERE id = $6
                            RETURNING *
                        `,
                        [name, description, price, badge, image, id]
                    );
                    
                    if ((comboRes.rowCount ?? 0) === 0) {
                        await pool.query('ROLLBACK');
                        return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
                    }

                    await pool.query(`DELETE FROM combo_items WHERE combo_id = $1`, [id]);
                    if (Array.isArray(items)) {
                        for (const item of items) {
                            await pool.query(
                                `INSERT INTO combo_items (combo_id, product_id, quantity, label) VALUES ($1, $2, $3, $4)`,
                                [id, item.product_id || null, item.quantity, item.label]
                            );
                        }
                    }
                    await pool.query('COMMIT');
                    return res.json({ success: true, combo: comboRes.rows[0] });
                } catch (err) {
                    await pool.query('ROLLBACK');
                    throw err;
                }
            }

            if (req.method === 'DELETE') {
                const result = await pool.query(`DELETE FROM combos WHERE id = $1 RETURNING id`, [id]);
                if ((result.rowCount ?? 0) === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
                }
                return res.json({ success: true });
            }

            return res.status(405).json({ success: false, message: 'Method not allowed for specific item' });
        }

        // Collection operations
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
