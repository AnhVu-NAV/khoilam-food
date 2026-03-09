import pool, { initDB } from '../server/db.js';

function normalizeProduct(product: any) {
    return {
        ...product,
        price: Number(product.price ?? 0),
        stock: Number(product.stock ?? 0),
        weights:
            typeof product.weights === 'string'
                ? product.weights.split(',').map((w: string) => w.trim()).filter(Boolean)
                : Array.isArray(product.weights)
                    ? product.weights
                    : [],
    };
}

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        if (req.method === 'GET') {
            const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
            if ((result.rowCount ?? 0) === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            return res.json(normalizeProduct(result.rows[0]));
        }

        if (req.method === 'PUT') {
            const { name, description, price, category, image, weights, stock } = req.body || {};

            const result = await pool.query(
                `UPDATE products
         SET name = $1, description = $2, price = $3, category = $4, image = $5, weights = $6, stock = $7
         WHERE id = $8
         RETURNING *`,
                [
                    name ?? '',
                    description ?? '',
                    Number(price ?? 0),
                    category ?? '',
                    image ?? '',
                    Array.isArray(weights) ? weights.join(',') : '',
                    Number(stock ?? 0),
                    id,
                ]
            );

            if ((result.rowCount ?? 0) === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            return res.json({ success: true, product: normalizeProduct(result.rows[0]) });
        }

        if (req.method === 'DELETE') {
            const result = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);
            if ((result.rowCount ?? 0) === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            return res.json({ success: true });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Product error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Lỗi server' });
    }
}