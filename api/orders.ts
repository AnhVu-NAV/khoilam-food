import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        if (req.method === 'GET') {
            const result = await pool.query(
                `SELECT * FROM orders ORDER BY created_at DESC, id DESC`
            );
            return res.json(result.rows);
        }

        if (req.method === 'POST') {
            const client = await pool.connect();

            try {
                const {
                    user_id,
                    email,
                    total,
                    shipping_address,
                    phone,
                    items,
                    payment_method,
                } = req.body || {};

                await client.query('BEGIN');

                const normalizedPaymentMethod =
                    payment_method === 'bank_transfer' ? 'bank_transfer' : 'cod';

                const orderRes = await client.query(
                    `
                        INSERT INTO orders (
                            user_id,
                            email,
                            total,
                            shipping_address,
                            phone,
                            status,
                            payment_method
                        )
                        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
                            RETURNING *
                    `,
                    [
                        user_id ?? null,
                        email ?? null,
                        Number(total ?? 0),
                        shipping_address ?? '',
                        phone ?? '',
                        normalizedPaymentMethod,
                    ]
                );

                const order = orderRes.rows[0];

                if (Array.isArray(items)) {
                    for (const item of items) {
                        await client.query(
                            `
                                INSERT INTO order_items (
                                    order_id,
                                    product_id,
                                    quantity,
                                    price,
                                    weight
                                )
                                VALUES ($1, $2, $3, $4, $5)
                            `,
                            [
                                order.id,
                                item.product_id,
                                Number(item.quantity ?? 1),
                                Number(item.price ?? 0),
                                item.weight ?? '',
                            ]
                        );
                    }
                }

                await client.query('COMMIT');

                return res.status(201).json({
                    success: true,
                    order,
                    orderId: order.id,
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
        });
    } catch (error: any) {
        console.error('Orders error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Lỗi server',
        });
    }
}