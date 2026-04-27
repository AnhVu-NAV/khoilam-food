import pool, { initDB } from '../server/db.js';

function parseWeightPrices(raw: unknown): Record<string, number> {
    if (!raw) return {};

    if (typeof raw === 'object' && raw !== null) {
        return Object.entries(raw as Record<string, unknown>).reduce(
            (acc: Record<string, number>, [key, value]) => {
                const num = Number(value);
                if (Number.isFinite(num)) acc[key] = num;
                return acc;
            },
            {}
        );
    }

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return Object.entries(parsed as Record<string, unknown>).reduce(
                    (acc: Record<string, number>, [key, value]) => {
                        const num = Number(value);
                        if (Number.isFinite(num)) acc[key] = num;
                        return acc;
                    },
                    {}
                );
            }
        } catch {
            return {};
        }
    }

    return {};
}

function normalizeProduct(product: any) {
    const weights =
        typeof product.weights === 'string'
            ? product.weights.split(',').map((w: string) => w.trim()).filter(Boolean)
            : Array.isArray(product.weights)
                ? product.weights
                : [];

    const weightPrices = parseWeightPrices(product.weight_prices);
    const firstWeight = weights[0];
    const displayPrice =
        (firstWeight && weightPrices[firstWeight]) || Number(product.price ?? 0);

    return {
        ...product,
        price: Number(displayPrice ?? 0),
        stock: Number(product.stock ?? 0),
        weights,
        weightPrices,
    };
}

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        const id = req.query?.id;

        // If ID is provided, handle single item operations
        if (id && !Array.isArray(id)) {
            if (req.method === 'GET') {
                const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);

                if ((result.rowCount ?? 0) === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
                }

                return res.json(normalizeProduct(result.rows[0]));
            }

            if (req.method === 'PUT') {
                const {
                    name,
                    description,
                    ingredients,
                    storage,
                    usage,
                    price,
                    category,
                    image,
                    weights,
                    stock,
                    weightPrices,
                } = req.body || {};

                const normalizedWeights = Array.isArray(weights)
                    ? weights.map((w: string) => w.trim()).filter(Boolean)
                    : [];

                const parsedWeightPrices = parseWeightPrices(weightPrices);
                const firstWeight = normalizedWeights[0];
                const basePrice =
                    (firstWeight && parsedWeightPrices[firstWeight]) || Number(price ?? 0);

                const result = await pool.query(
                    `
              UPDATE products
              SET name = $1,
                  description = $2,
                  ingredients = $3,
                  storage = $4,
                  usage = $5,
                  price = $6,
                  category = $7,
                  image = $8,
                  weights = $9,
                  stock = $10,
                  weight_prices = $11
              WHERE id = $12
              RETURNING *
            `,
                    [
                        name ?? '',
                        description ?? '',
                        ingredients ?? '',
                        storage ?? '',
                        usage ?? '',
                        Number(basePrice),
                        category ?? '',
                        image ?? '',
                        normalizedWeights.join(','),
                        Number(stock ?? 0),
                        JSON.stringify(parsedWeightPrices),
                        id,
                    ]
                );

                if ((result.rowCount ?? 0) === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
                }

                return res.json({
                    success: true,
                    product: normalizeProduct(result.rows[0]),
                });
            }

            if (req.method === 'DELETE') {
                const result = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);

                if ((result.rowCount ?? 0) === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
                }

                return res.json({ success: true });
            }

            return res.status(405).json({ success: false, message: 'Method not allowed for specific item' });
        }

        // If no ID is provided, handle collection operations
        if (req.method === 'GET') {
            const result = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
            return res.json(result.rows.map(normalizeProduct));
        }

        if (req.method === 'POST') {
            const {
                id,
                name,
                description,
                ingredients,
                storage,
                usage,
                price,
                category,
                image,
                weights,
                stock,
                weightPrices,
            } = req.body || {};

            const normalizedWeights = Array.isArray(weights)
                ? weights.map((w: string) => w.trim()).filter(Boolean)
                : [];

            const parsedWeightPrices = parseWeightPrices(weightPrices);
            const firstWeight = normalizedWeights[0];
            const basePrice =
                (firstWeight && parsedWeightPrices[firstWeight]) || Number(price ?? 0);

            const result = await pool.query(
                `
          INSERT INTO products (
            id,
            name,
            description,
            ingredients,
            storage,
            usage,
            price,
            category,
            image,
            weights,
            stock,
            weight_prices
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          RETURNING *
        `,
                [
                    id,
                    name ?? '',
                    description ?? '',
                    ingredients ?? '',
                    storage ?? '',
                    usage ?? '',
                    Number(basePrice),
                    category ?? '',
                    image ?? '',
                    normalizedWeights.join(','),
                    Number(stock ?? 100),
                    JSON.stringify(parsedWeightPrices),
                ]
            );

            return res.status(201).json(normalizeProduct(result.rows[0]));
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error: any) {
        console.error('Products error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}