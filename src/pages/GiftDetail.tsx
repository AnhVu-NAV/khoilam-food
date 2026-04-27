import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift as GiftIcon, ShieldCheck, Tag, ArrowLeft, Package, Sparkles } from 'lucide-react';

export default function GiftDetail() {
    const { id } = useParams<{ id: string }>();
    const [gift, setGift] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [giftRes, productsRes] = await Promise.all([
                    fetch(`/api/gifts?id=${id}`),
                    fetch('/api/products')
                ]);
                const giftData = await giftRes.json();
                const productsData = await productsRes.json();

                if (giftData.success && giftData.gift) {
                    setGift(giftData.gift);
                } else {
                    setGift(null);
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
                <div className="text-khoi-lam text-xl animate-pulse">Đang tải...</div>
            </div>
        );
    }

    if (!gift) {
        return (
            <div className="bg-kem min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl font-bold text-khoi-lam mb-4">Không tìm thấy quà tặng</h1>
                    <Link to="/qua-tang" className="text-vang-logo hover:underline">Quay lại danh sách quà tặng</Link>
                </div>
            </div>
        );
    }

    // Calculate total original price
    let totalOriginalPrice = 0;
    const enrichedItems = (gift.items || []).map((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        let itemPrice = 0;

        if (product) {
            // Try to find price by weight first
            if (item.weight && product.weight_prices) {
                const wpObj = typeof product.weight_prices === 'string'
                    ? JSON.parse(product.weight_prices)
                    : product.weight_prices;
                if (wpObj[item.weight]) {
                    itemPrice = Number(wpObj[item.weight]);
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

    const giftPrice = Number(gift.price);
    const savedAmount = totalOriginalPrice > giftPrice ? totalOriginalPrice - giftPrice : 0;

    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/qua-tang" className="inline-flex items-center text-khoi-lam/70 hover:text-khoi-lam mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Quay lại Quà tặng
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div>
                        <div className="bg-white rounded-3xl p-4 shadow-sm border border-khoi-lam/5 sticky top-24">
                            {gift.image ? (
                                <img src={gift.image} alt={gift.name} className="w-full h-auto rounded-2xl object-cover aspect-[4/3]" />
                            ) : (
                                <div className="w-full aspect-[4/3] bg-gradient-to-br from-vang-logo/10 to-khoi-lam/5 rounded-2xl flex items-center justify-center">
                                    <GiftIcon className="w-20 h-20 text-vang-logo/30" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div>
                        <div className="mb-6 flex flex-wrap gap-3">
                            {gift.badge && (
                                <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-vang-logo/15 text-khoi-lam">
                                    <Tag className="w-4 h-4" />
                                    {gift.badge}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-khoi-lam/5 text-khoi-lam/70">
                                <Sparkles className="w-4 h-4" />
                                Premium
                            </span>
                        </div>

                        <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-4">
                            {gift.name}
                        </h1>

                        <p className="text-khoi-lam/70 text-lg leading-relaxed mb-8 pb-8 border-b border-khoi-lam/10">
                            {gift.description}
                        </p>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-khoi-lam mb-4">Sản phẩm trong hộp quà:</h3>
                            <div className="space-y-4">
                                {enrichedItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-khoi-lam/5 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            {item.product?.image ? (
                                                <img src={item.product.image} alt={item.label} className="w-16 h-16 rounded-xl object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 bg-kem rounded-xl flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-khoi-lam/30" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-khoi-lam text-lg">
                                                    {item.label}
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
                                                <span className="font-medium text-xanh-rung">Quà tặng</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price comparison */}
                        <div className="bg-khoi-lam/5 p-6 rounded-2xl border border-khoi-lam/10 mb-8">
                            {totalOriginalPrice > 0 && (
                                <div className="flex justify-between items-center mb-3 text-khoi-lam/70">
                                    <span>Tổng giá mua lẻ:</span>
                                    <span className="line-through">{totalOriginalPrice.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold text-khoi-lam">Giá hộp quà:</span>
                                <span className="text-3xl font-bold text-do-gach">{giftPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {savedAmount > 0 && (
                                <div className="bg-xanh-rung/10 text-xanh-rung p-3 rounded-xl text-center font-medium">
                                    Tiết kiệm được {savedAmount.toLocaleString('vi-VN')}đ
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to="/san-pham"
                                className="flex-1 inline-flex items-center justify-center rounded-xl border border-khoi-lam/10 py-4 px-4 text-sm font-medium text-khoi-lam hover:bg-khoi-lam/5 transition-colors"
                            >
                                Xem sản phẩm
                            </Link>
                            <button className="flex-1 bg-vang-logo text-khoi-lam py-4 rounded-xl font-bold text-lg hover:bg-vang-logo/90 transition-colors shadow-sm">
                                Chọn hộp quà
                            </button>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-khoi-lam/55 text-sm justify-center">
                            <ShieldCheck className="w-4 h-4" />
                            Đóng gói cẩn thận · Hộp cứng sang trọng
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
