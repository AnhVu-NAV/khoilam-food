import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();
        
        const action = req.query?.action;
        const id = req.query?.id;

        if (req.method === 'GET') {
            if (action === 'items') {
                if (!id || Array.isArray(id)) {
                    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
                }

                const itemsRes = await pool.query(
                    `
                        SELECT
                            oi.*,
                            p.name AS product_name,
                            p.image AS product_image
                        FROM order_items oi
                                 LEFT JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = $1
                        ORDER BY oi.id ASC
                    `,
                    [id]
                );

                return res.json(
                    itemsRes.rows.map((item) => ({
                        ...item,
                        quantity: Number(item.quantity ?? 1),
                        price: Number(item.price ?? 0),
                        weight: item.weight ?? '',
                    }))
                );
            }

            // Default GET all orders (could handle customer-orders, analytics etc here if implemented)
            // But preserving existing behavior
            const result = await pool.query(
                `SELECT * FROM orders ORDER BY created_at DESC, id DESC`
            );
            return res.json(result.rows);
        }

        if (req.method === 'PUT') {
            if (action === 'status') {
                if (!id || Array.isArray(id)) {
                    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
                }

                const { status, cancel_reason } = req.body || {};

                if (status === 'cancelled' && cancel_reason) {
                    await pool.query(`UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3`, [
                        status,
                        cancel_reason,
                        id,
                    ]);
                } else {
                    await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
                }

                return res.json({ success: true });
            }
            return res.status(405).json({ success: false, message: 'Method not allowed for specific order action' });
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
                                    combo_id,
                                    quantity,
                                    price,
                                    weight
                                )
                                VALUES ($1, $2, $3, $4, $5, $6)
                            `,
                            [
                                order.id,
                                item.product_id || null,
                                item.combo_id || null,
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