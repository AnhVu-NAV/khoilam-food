import pool, { initDB } from '../server/db.js';
import { parseWeightPrices, toInt } from '../server/utils/common.js';

const normalizeWeight = (weight: unknown) =>
    String(weight ?? '')
        .trim()
        .replace(/gr$/i, 'g');

const getLinePrice = (item: any) => {
    const prices = parseWeightPrices(item.product_weight_prices);
    const weight = normalizeWeight(item.weight);
    const priceByWeight = weight ? prices[weight] : undefined;

    if (Number.isFinite(priceByWeight)) {
        return Number(priceByWeight);
    }

    return toInt(item.product_price);
};

const enrichItems = (items: any[]) =>
    items.map((item) => {
        const quantity = Math.max(1, toInt(item.quantity, 1));
        const unitPrice = item.product_id ? getLinePrice(item) : 0;

        return {
            id: item.id,
            combo_id: item.combo_id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            weight: item.weight ?? '',
            quantity,
            label: item.label || item.product_name || '',
            unit_price: unitPrice,
            total_price: unitPrice * quantity,
        };
    });

const attachItems = (combos: any[], items: any[]) =>
    combos.map((combo) => {
        const comboItems = enrichItems(items.filter((item) => item.combo_id === combo.id));
        const retailPrice = comboItems.reduce((sum, item) => sum + item.total_price, 0);
        const price = toInt(combo.price);

        return {
            ...combo,
            price,
            items: comboItems,
            retail_price: retailPrice,
            savings: Math.max(0, retailPrice - price),
        };
    });

const getComboItems = async (comboId?: string) => {
    const params = comboId ? [comboId] : [];
    const where = comboId ? 'WHERE ci.combo_id = $1' : '';

    const result = await pool.query(
        `
            SELECT
                ci.*,
                p.name AS product_name,
                p.image AS product_image,
                p.price AS product_price,
                p.weight_prices AS product_weight_prices
            FROM combo_items ci
            LEFT JOIN products p ON p.id = ci.product_id
            ${where}
            ORDER BY ci.id ASC
        `,
        params
    );

    return result.rows;
};

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        if (id && !Array.isArray(id)) {
            if (req.method === 'GET') {
                const comboRes = await pool.query(`SELECT * FROM combos WHERE id = $1`, [id]);
                if ((comboRes.rowCount ?? 0) === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
                }

                const combos = attachItems(comboRes.rows, await getComboItems(id));
                return res.json(combos[0]);
            }

            if (req.method === 'PUT') {
                const { name, description, price, badge, image, items } = req.body || {};
                const client = await pool.connect();

                try {
                    await client.query('BEGIN');

                    const comboRes = await client.query(
                        `
                            UPDATE combos
                            SET name = $1, description = $2, price = $3, badge = $4, image = $5
                            WHERE id = $6
                            RETURNING *
                        `,
                        [name ?? '', description ?? '', toInt(price), badge ?? '', image ?? '', id]
                    );

                    if ((comboRes.rowCount ?? 0) === 0) {
                        await client.query('ROLLBACK');
                        return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
                    }

                    await client.query(`DELETE FROM combo_items WHERE combo_id = $1`, [id]);

                    if (Array.isArray(items)) {
                        for (const item of items) {
                            await client.query(
                                `
                                    INSERT INTO combo_items (combo_id, product_id, weight, quantity, label)
                                    VALUES ($1, $2, $3, $4, $5)
                                `,
                                [
                                    id,
                                    item.product_id || null,
                                    normalizeWeight(item.weight),
                                    Math.max(1, toInt(item.quantity, 1)),
                                    item.label ?? '',
                                ]
                            );
                        }
                    }

                    await client.query('COMMIT');
                    return res.json({ success: true, combo: comboRes.rows[0] });
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                } finally {
                    client.release();
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
        }

        if (req.method === 'GET') {
            const combosResult = await pool.query(`SELECT * FROM combos ORDER BY price ASC`);
            return res.json(attachItems(combosResult.rows, await getComboItems()));
        }

        if (req.method === 'POST') {
            const { id, name, description, price, badge, image, items } = req.body || {};

            if (!id || !name) {
                return res.status(400).json({ success: false, message: 'Thiếu mã hoặc tên combo' });
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                const result = await client.query(
                    `
                        INSERT INTO combos (id, name, description, price, badge, image)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `,
                    [id, name, description ?? '', toInt(price), badge ?? '', image ?? '']
                );

                if (Array.isArray(items)) {
                    for (const item of items) {
                        await client.query(
                            `
                                INSERT INTO combo_items (combo_id, product_id, weight, quantity, label)
                                VALUES ($1, $2, $3, $4, $5)
                            `,
                            [
                                id,
                                item.product_id || null,
                                normalizeWeight(item.weight),
                                Math.max(1, toInt(item.quantity, 1)),
                                item.label ?? '',
                            ]
                        );
                    }
                }

                await client.query('COMMIT');
                return res.status(201).json({ success: true, combo: result.rows[0] });
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
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
