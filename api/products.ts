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

        if (req.method === 'GET') {
            const result = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
            return res.json(result.rows.map(normalizeProduct));
        }

        if (req.method === 'POST') {
            const { id, name, description, price, category, image, weights, stock } = req.body || {};

            const result = await pool.query(
                `INSERT INTO products (id, name, description, price, category, image, weights, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
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

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Products error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Lỗi server' });
    }
}