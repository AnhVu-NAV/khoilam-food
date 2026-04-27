import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        // Single item operations
        if (id && !Array.isArray(id)) {
            if (req.method === 'GET') {
                const giftRes = await pool.query(`SELECT * FROM gifts WHERE id = $1`, [id]);
                if ((giftRes.rowCount ?? 0) === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy quà tặng' });
                
                const itemsRes = await pool.query(`SELECT * FROM gift_items WHERE gift_id = $1`, [id]);
                const gift = { ...giftRes.rows[0], items: itemsRes.rows };
                return res.json({ success: true, gift });
            }

            if (req.method === 'PUT') {
                const { name, description, price, badge, image, items } = req.body || {};
                await pool.query('BEGIN');
                try {
                    const giftRes = await pool.query(
                        `
                            UPDATE gifts
                            SET name = $1, description = $2, price = $3, badge = $4, image = $5
                            WHERE id = $6
                            RETURNING *
                        `,
                        [name, description, price, badge, image, id]
                    );
                    
                    if ((giftRes.rowCount ?? 0) === 0) {
                        await pool.query('ROLLBACK');
                        return res.status(404).json({ success: false, message: 'Không tìm thấy quà tặng' });
                    }

                    await pool.query(`DELETE FROM gift_items WHERE gift_id = $1`, [id]);
                    if (Array.isArray(items)) {
                        for (const item of items) {
                            await pool.query(
                                `INSERT INTO gift_items (gift_id, product_id, weight, quantity, label) VALUES ($1, $2, $3, $4, $5)`,
                                [id, item.product_id || null, item.weight || null, item.quantity, item.label]
                            );
                        }
                    }
                    await pool.query('COMMIT');
                    return res.json({ success: true, gift: giftRes.rows[0] });
                } catch (err) {
                    await pool.query('ROLLBACK');
                    throw err;
                }
            }

            if (req.method === 'DELETE') {
                const result = await pool.query(`DELETE FROM gifts WHERE id = $1 RETURNING id`, [id]);
                if ((result.rowCount ?? 0) === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy quà tặng' });
                }
                return res.json({ success: true });
            }

            return res.status(405).json({ success: false, message: 'Method not allowed for specific item' });
        }

        // Collection operations
        if (req.method === 'GET') {
            const giftsResult = await pool.query(`SELECT * FROM gifts ORDER BY price ASC`);
            const itemsResult = await pool.query(`SELECT * FROM gift_items`);
            
            const gifts = giftsResult.rows.map((gift) => {
                const items = itemsResult.rows.filter(i => i.gift_id === gift.id);
                return { ...gift, items };
            });

            return res.json(gifts);
        }

        if (req.method === 'POST') {
            const { id, name, description, price, badge, image, items } = req.body || {};
            await pool.query('BEGIN');
            try {
                const result = await pool.query(
                    `
                        INSERT INTO gifts (id, name, description, price, badge, image)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `,
                    [id, name, description, price, badge, image]
                );

                if (Array.isArray(items)) {
                    for (const item of items) {
                        await pool.query(
                            `INSERT INTO gift_items (gift_id, product_id, weight, quantity, label) VALUES ($1, $2, $3, $4, $5)`,
                            [id, item.product_id || null, item.weight || null, item.quantity, item.label]
                        );
                    }
                }
                await pool.query('COMMIT');
                return res.status(201).json({ success: true, gift: result.rows[0] });
            } catch (err) {
                await pool.query('ROLLBACK');
                throw err;
            }
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Gifts error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}
