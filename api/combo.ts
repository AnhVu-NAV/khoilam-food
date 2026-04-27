import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

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

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Combo error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}
