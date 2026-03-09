import pool, { initDB } from '../../server/db.js';
import { normalizeProduct } from '../../server/utils/normalizeProduct.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        if (req.method === 'GET') {
            const result = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
            return res.status(200).json(result.rows.map(normalizeProduct));
        }

        if (req.method === 'POST') {
            const {
                id,
                name,
                description,
                price,
                category,
                image,
                weights,
                stock,
            } = req.body || {};

            if (!id || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu id hoặc tên sản phẩm',
                });
            }

            const result = await pool.query(
                `
        INSERT INTO products (id, name, description, price, category, image, weights, stock)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
                [
                    id,
                    name,
                    description ?? '',
                    Number(price ?? 0),
                    category ?? '',
                    image ?? '',
                    Array.isArray(weights) ? weights.join(',') : '',
                    Number(stock ?? 100),
                ]
            );

            return res.status(201).json(normalizeProduct(result.rows[0]));
        }

        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
        });
    } catch (error: any) {
        console.error('Products API error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}