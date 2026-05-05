import pool, { initDB } from '../server/db.js';

export default async function handler(req: any, res: any) {
    try {
        await initDB();

        const action = req.query?.action;
        const id = req.query?.id;

        if (req.method === 'GET') {
            if (action === 'analytics') {
                const summaryRes = await pool.query(
                    `
                        SELECT
                            COALESCE(SUM(CASE WHEN status IS DISTINCT FROM 'cancelled' THEN total ELSE 0 END), 0)::int AS total_revenue,
                            (COUNT(*) FILTER (WHERE status IS DISTINCT FROM 'cancelled'))::int AS order_count
                        FROM orders
                    `
                );

                const topProductsRes = await pool.query(
                    `
                        SELECT
                            COALESCE(p.name, c.name, g.name, oi.product_id, oi.combo_id, oi.gift_id, 'Sản phẩm') AS name,
                            COALESCE(SUM(oi.quantity), 0)::int AS sold
                        FROM order_items oi
                        INNER JOIN orders o ON o.id = oi.order_id
                        LEFT JOIN products p ON oi.product_id = p.id
                        LEFT JOIN combos c ON oi.combo_id = c.id
                        LEFT JOIN gifts g ON oi.gift_id = g.id
                        WHERE o.status IS DISTINCT FROM 'cancelled'
                        GROUP BY name
                        ORDER BY sold DESC
                        LIMIT 8
                    `
                );

                return res.json({
                    totalRevenue: Number(summaryRes.rows[0]?.total_revenue ?? 0),
                    orderCount: Number(summaryRes.rows[0]?.order_count ?? 0),
                    topProducts: topProductsRes.rows.map((row) => ({
                        name: row.name,
                        sold: Number(row.sold ?? 0),
                    })),
                });
            }

            if (action === 'customers') {
                const customersRes = await pool.query(
                    `
                        WITH registered_customers AS (
                            SELECT
                                u.id::text AS id,
                                COALESCE(NULLIF(u.name, ''), u.email) AS name,
                                u.email,
                                u.phone,
                                (COUNT(o.id) FILTER (WHERE o.status IS DISTINCT FROM 'cancelled'))::int AS order_count,
                                COALESCE(SUM(o.total) FILTER (WHERE o.status IS DISTINCT FROM 'cancelled'), 0)::int AS total_spent,
                                MAX(o.created_at) AS last_order_at
                            FROM users u
                            LEFT JOIN orders o ON o.user_id = u.id
                            WHERE u.role = 'user'
                            GROUP BY u.id, u.name, u.email, u.phone
                        ),
                        guest_customers AS (
                            SELECT
                                CONCAT('guest:', LOWER(o.email)) AS id,
                                COALESCE(NULLIF(MAX(o.email), ''), 'Khách vãng lai') AS name,
                                o.email,
                                MAX(o.phone) AS phone,
                                (COUNT(o.id) FILTER (WHERE o.status IS DISTINCT FROM 'cancelled'))::int AS order_count,
                                COALESCE(SUM(o.total) FILTER (WHERE o.status IS DISTINCT FROM 'cancelled'), 0)::int AS total_spent,
                                MAX(o.created_at) AS last_order_at
                            FROM orders o
                            WHERE o.user_id IS NULL
                              AND o.email IS NOT NULL
                              AND NOT EXISTS (
                                  SELECT 1
                                  FROM users u
                                  WHERE LOWER(u.email) = LOWER(o.email)
                              )
                            GROUP BY LOWER(o.email), o.email
                        )
                        SELECT *
                        FROM (
                            SELECT * FROM registered_customers
                            UNION ALL
                            SELECT * FROM guest_customers
                        ) customers
                        WHERE order_count > 0 OR email IS NOT NULL
                        ORDER BY total_spent DESC, last_order_at DESC NULLS LAST, name ASC
                    `
                );

                return res.json(
                    customersRes.rows.map((customer) => ({
                        ...customer,
                        order_count: Number(customer.order_count ?? 0),
                        total_spent: Number(customer.total_spent ?? 0),
                    }))
                );
            }

            if (action === 'customer-orders') {
                if (!id || Array.isArray(id)) {
                    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
                }

                const customerId = String(id);
                const ordersRes = customerId.startsWith('guest:')
                    ? await pool.query(
                          `
                              SELECT *
                              FROM orders
                              WHERE user_id IS NULL AND LOWER(email) = LOWER($1)
                              ORDER BY created_at DESC, id DESC
                          `,
                          [customerId.replace(/^guest:/, '')]
                      )
                    : await pool.query(
                          `
                              SELECT *
                              FROM orders
                              WHERE user_id = $1
                              ORDER BY created_at DESC, id DESC
                          `,
                          [customerId]
                      );

                return res.json(
                    ordersRes.rows.map((order) => ({
                        ...order,
                        total: Number(order.total ?? 0),
                    }))
                );
            }

            if (action === 'items') {
                if (!id || Array.isArray(id)) {
                    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
                }

                const itemsRes = await pool.query(
                    `
                        SELECT
                            oi.*,
                            COALESCE(p.name, c.name, g.name) AS product_name,
                            COALESCE(p.image, c.image, g.image) AS product_image,
                            c.name AS combo_name,
                            g.name AS gift_name
                        FROM order_items oi
                        LEFT JOIN products p ON oi.product_id = p.id
                        LEFT JOIN combos c ON oi.combo_id = c.id
                        LEFT JOIN gifts g ON oi.gift_id = g.id
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
                        item_type: item.gift_id ? 'gift' : item.combo_id ? 'combo' : 'product',
                    }))
                );
            }

            const result = await pool.query(
                `
                    SELECT
                        o.*,
                        u.name AS user_name,
                        u.email AS user_email
                    FROM orders o
                    LEFT JOIN users u ON o.user_id = u.id
                    ORDER BY o.created_at DESC, o.id DESC
                `
            );

            return res.json(
                result.rows.map((order) => ({
                    ...order,
                    total: Number(order.total ?? 0),
                }))
            );
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
                                    gift_id,
                                    quantity,
                                    price,
                                    weight
                                )
                                VALUES ($1, $2, $3, $4, $5, $6, $7)
                            `,
                            [
                                order.id,
                                item.product_id || null,
                                item.combo_id || null,
                                item.gift_id || null,
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
