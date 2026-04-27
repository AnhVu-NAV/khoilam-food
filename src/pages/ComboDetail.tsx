import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';

export default function ComboDetail() {
    const { id } = useParams<{ id: string }>();
    const [combo, setCombo] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [comboRes, productsRes] = await Promise.all([
                    fetch(`/api/combos?id=${id}`),
                    fetch('/api/products')
                ]);
                const comboData = await comboRes.json();
                const productsData = await productsRes.json();
                
                if (!comboData.success && comboData.message) {
                    setCombo(null);
                } else {
                    setCombo(comboData);
                }
                setProducts(Array.isArray(productsData) ? productsData : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="bg-kem min-h-screen py-16 flex items-center justify-center">
                <div className="text-khoi-lam text-xl">Đang tải...</div>
            </div>
        );
    }

    if (!combo) {
        return (
            <div className="bg-kem min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl font-bold text-khoi-lam mb-4">Không tìm thấy combo</h1>
                    <Link to="/combo" className="text-vang-logo hover:underline">Quay lại danh sách combo</Link>
                </div>
            </div>
        );
    }

    // Calculate total original price
    let totalOriginalPrice = 0;
    const enrichedItems = combo.items.map((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        let itemPrice = 0;
        
        if (product) {
            // Try weight-specific price first
            if (item.weight && product.weight_prices) {
                const wp = typeof product.weight_prices === 'string' 
                    ? JSON.parse(product.weight_prices) 
                    : product.weight_prices;
                if (wp[item.weight]) {
                    itemPrice = Number(wp[item.weight]);
                }
            }
            // Also try weightPrices (camelCase from frontend)
            if (!itemPrice && item.weight && product.weightPrices) {
                const wp = typeof product.weightPrices === 'string'
                    ? JSON.parse(product.weightPrices)
                    : product.weightPrices;
                if (wp[item.weight]) {
                    itemPrice = Number(wp[item.weight]);
                }
            }
            // Fallback to base price
            if (!itemPrice) {
                itemPrice = Number(product.price || 0);
            }
        }
        
        const totalItemPrice = itemPrice * (item.quantity || 1);
        totalOriginalPrice += totalItemPrice;
        
        return {
            ...item,
            product,
            itemPrice,
            totalItemPrice
        };
    });

    const comboPrice = Number(combo.price);
    const savedAmount = totalOriginalPrice > comboPrice ? totalOriginalPrice - comboPrice : 0;

    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/combos" className="inline-flex items-center text-khoi-lam/70 hover:text-khoi-lam mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Quay lại Combos
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div>
                        <div className="bg-white rounded-3xl p-4 shadow-sm border border-khoi-lam/5 sticky top-24">
                            {combo.image ? (
                                <img src={combo.image} alt={combo.name} className="w-full h-auto rounded-2xl object-cover aspect-[4/3]" />
                            ) : (
                                <div className="w-full aspect-[4/3] bg-khoi-lam/5 rounded-2xl flex items-center justify-center">
                                    <Package className="w-20 h-20 text-khoi-lam/20" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="mb-6 flex flex-wrap gap-3">
                            {combo.badge && (
                                <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-vang-logo/15 text-khoi-lam">
                                    <Tag className="w-4 h-4" />
                                    {combo.badge}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-xanh-rung/10 text-xanh-rung">
                                <ShieldCheck className="w-4 h-4" />
                                Combo Tiết Kiệm
                            </span>
                        </div>

                        <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-4">
                            {combo.name}
                        </h1>

                        <p className="text-khoi-lam/70 text-lg leading-relaxed mb-8 pb-8 border-b border-khoi-lam/10">
                            {combo.description}
                        </p>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-khoi-lam mb-4">Các sản phẩm trong Combo:</h3>
                            <div className="space-y-4">
                                {enrichedItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-khoi-lam/5 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            {item.product?.image ? (
                                                <img src={item.product.image} alt={item.label || item.product?.name} className="w-16 h-16 rounded-xl object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 bg-kem rounded-xl flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-khoi-lam/30" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-khoi-lam text-lg">
                                                    {item.label || item.product?.name || 'Sản phẩm'}
                                                </p>
                                                <p className="text-sm text-khoi-lam/60">
                                                    Số lượng: {item.quantity} {item.weight ? `- Phân loại: ${item.weight}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {item.totalItemPrice > 0 ? (
                                                <span className="font-medium text-khoi-lam">{item.totalItemPrice.toLocaleString('vi-VN')}đ</span>
                                            ) : (
                                                <span className="font-medium text-xanh-rung">{item.product_id ? 'Đang cập nhật giá' : 'Tặng kèm'}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-khoi-lam/5 p-6 rounded-2xl border border-khoi-lam/10 mb-8">
                            <div className="flex justify-between items-center mb-3 text-khoi-lam/70">
                                <span>Tổng giá mua lẻ:</span>
                                <span className="line-through">{totalOriginalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold text-khoi-lam">Giá Combo:</span>
                                <span className="text-3xl font-bold text-do-gach">{comboPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {savedAmount > 0 && (
                                <div className="bg-xanh-rung/10 text-xanh-rung p-3 rounded-xl text-center font-medium">
                                    Tiết kiệm được {savedAmount.toLocaleString('vi-VN')}đ
                                </div>
                            )}
                        </div>

                        <button className="w-full bg-vang-logo text-khoi-lam py-4 rounded-xl font-bold text-lg hover:bg-vang-logo/90 transition-colors shadow-sm">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
