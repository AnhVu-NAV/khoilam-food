import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Combo() {
    const [combos, setCombos] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/combos')
            .then(res => res.json())
            .then(data => setCombos(Array.isArray(data) ? data : []));

        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []));
    }, []);

    const getOriginalPrice = (combo: any) => {
        if (!combo.items || !products.length) return combo.price;
        let originalTotal = 0;
        combo.items.forEach((item: any) => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                originalTotal += (product.price || 0) * (item.quantity || 1);
            }
        });
        return Math.max(originalTotal, combo.price);
    };

    const handleAddToCart = (combo: any) => {
        const dummyProduct = {
            id: combo.id,
            name: combo.name,
            image: combo.image || '/images/default-combo.jpg',
            price: combo.price
        };
        addToCart(dummyProduct, 1, 'combo', combo.price, true, combo.id);
        navigate('/gio-hang');
    };

    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-4 block">
                        Family Combo
                    </span>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6">
                        Combo gia đình
                    </h1>
                    <p className="text-khoi-lam/70 max-w-2xl mx-auto text-lg leading-relaxed">
                        Những set phối sẵn để bạn dễ chọn hơn, tiết kiệm hơn và thưởng thức trọn vị
                        đặc sản Tây Bắc.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {combos.map((combo) => {
                        const originalPrice = getOriginalPrice(combo);
                        const discount = originalPrice > combo.price ? originalPrice - combo.price : 0;

                        return (
                            <div
                                key={combo.id}
                                className="bg-white rounded-3xl border border-khoi-lam/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {combo.image && (
                                    <div className="w-full h-48 bg-kem/50">
                                        <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-8 border-b border-khoi-lam/5">
                                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-vang-logo/15 text-khoi-lam">
                                            <Tag className="w-4 h-4" />
                                            {combo.badge || 'Trọn vị'}
                                        </span>

                                        <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-khoi-lam/5 text-khoi-lam/70">
                                            <Users className="w-4 h-4" />
                                            Family set
                                        </span>
                                    </div>

                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-3">
                                        {combo.name}
                                    </h2>

                                    <p className="text-khoi-lam/65 leading-relaxed text-sm">
                                        {combo.description}
                                    </p>
                                </div>

                                <div className="p-8 flex-grow">
                                    <h3 className="font-semibold text-khoi-lam mb-4">Bao gồm:</h3>
                                    <ul className="space-y-3">
                                        {(combo.items || []).map((item: any, idx: number) => (
                                            <li
                                                key={idx}
                                                className="text-sm text-khoi-lam/70 flex items-start gap-3"
                                            >
                                                <span className="mt-1.5 w-2 h-2 rounded-full bg-vang-logo shrink-0"></span>
                                                <span>{item.label || item.product_id} x{item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 pt-0">
                                    <div className="border-t border-khoi-lam/10 pt-6">
                                        <div className="mb-6 flex justify-between items-end">
                                            <div>
                                                <p className="text-sm text-khoi-lam/50 mb-1">Giá combo</p>
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold text-do-gach">
                                                        {Number(combo.price).toLocaleString('vi-VN')}đ
                                                    </span>
                                                    {discount > 0 && (
                                                        <span className="text-sm text-khoi-lam/40 line-through">
                                                            {originalPrice.toLocaleString('vi-VN')}đ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {discount > 0 && (
                                                <div className="text-right">
                                                    <p className="text-xs text-khoi-lam/50 mb-1">Tiết kiệm</p>
                                                    <span className="text-sm font-bold text-xanh-rung bg-xanh-rung/10 px-2 py-1 rounded">
                                                        -{discount.toLocaleString('vi-VN')}đ
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAddToCart(combo)}
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-vang-logo py-3 px-4 text-sm font-bold text-khoi-lam hover:bg-vang-logo/90 transition-colors"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                Đặt combo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 bg-white rounded-3xl border border-khoi-lam/5 p-8 md:p-10 text-center">
                    <h3 className="font-serif text-3xl font-bold text-khoi-lam mb-4">
                        Muốn tự chọn theo khẩu vị?
                    </h3>
                    <p className="text-khoi-lam/65 max-w-2xl mx-auto leading-relaxed mb-6">
                        Bạn có thể vào danh mục sản phẩm để chọn riêng từng món theo nhu cầu của gia
                        đình hoặc làm quà biếu.
                    </p>
                    <Link
                        to="/san-pham"
                        className="inline-flex items-center justify-center rounded-xl bg-khoi-lam text-white px-6 py-3 font-medium hover:bg-xanh-rung transition-colors"
                    >
                        Xem toàn bộ sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}