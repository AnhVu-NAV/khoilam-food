import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedWeight, setSelectedWeight] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const foundProduct = data.find((p: any) => p.id === id);
                    setProduct(foundProduct);

                    if (foundProduct?.weights?.length > 0) {
                        setSelectedWeight(foundProduct.weights[0]);
                    }
                } else {
                    setProduct(null);
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching product:', err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="bg-kem min-h-screen py-16 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-khoi-lam/20 border-t-khoi-lam rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-kem min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-khoi-lam mb-4">Sản phẩm không tồn tại</h2>
                    <button
                        onClick={() => navigate('/san-pham')}
                        className="text-vang-logo hover:underline"
                    >
                        Quay lại danh sách sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    const selectedPrice =
        product?.weightPrices?.[selectedWeight] ??
        product?.price ??
        0;

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedWeight, selectedPrice);
        alert('Đã thêm vào giỏ hàng!');
    };

    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-khoi-lam/70 hover:text-khoi-lam mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-khoi-lam/5 shadow-sm">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    <div className="flex flex-col">
            <span className="text-xanh-rung uppercase tracking-widest text-sm font-semibold mb-4 block">
              {product.category}
            </span>

                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-khoi-lam mb-6">
                            {product.name}
                        </h1>

                        <p className="text-2xl font-bold text-do-gach mb-8">
                            {selectedPrice.toLocaleString('vi-VN')}đ
                        </p>

                        <p className="text-khoi-lam/80 text-lg leading-relaxed mb-8">
                            {product.description}
                        </p>

                        <div className="mb-8">
                            <h3 className="font-semibold text-khoi-lam mb-4">Chọn trọng lượng:</h3>
                            <div className="flex flex-wrap gap-4">
                                {Array.isArray(product.weights) &&
                                    product.weights.map((weight: string) => {
                                        const weightPrice =
                                            product?.weightPrices?.[weight] ??
                                            product?.price ??
                                            0;

                                        return (
                                            <button
                                                key={weight}
                                                onClick={() => setSelectedWeight(weight)}
                                                className={`px-6 py-3 rounded-xl border-2 transition-all font-medium ${
                                                    selectedWeight === weight
                                                        ? 'border-vang-logo bg-vang-logo/10 text-khoi-lam'
                                                        : 'border-khoi-lam/10 text-khoi-lam/60 hover:border-khoi-lam/30'
                                                }`}
                                            >
                                                {weight} - {weightPrice.toLocaleString('vi-VN')}đ
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                            <div className="flex items-center gap-4 bg-white border border-khoi-lam/10 rounded-xl p-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-kem text-khoi-lam transition-colors"
                                >
                                    -
                                </button>

                                <span className="w-8 text-center font-semibold text-khoi-lam">
                  {quantity}
                </span>

                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-kem text-khoi-lam transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-grow bg-vang-logo text-khoi-lam font-bold py-4 rounded-xl hover:bg-vang-logo/90 transition-colors flex items-center justify-center gap-3"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}