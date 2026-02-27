import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        const foundProduct = data.find((p: any) => p.id === id);
        setProduct(foundProduct);
        if (foundProduct && foundProduct.weights && foundProduct.weights.length > 0) {
          setSelectedWeight(foundProduct.weights[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-kem min-h-screen py-16 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-khoi-lam/20 border-t-khoi-lam rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-kem min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-khoi-lam mb-4">Sản phẩm không tồn tại</h2>
          <button onClick={() => navigate('/san-pham')} className="text-vang-logo hover:underline">Quay lại danh sách sản phẩm</button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedWeight);
    alert('Đã thêm vào giỏ hàng!');
  };

  // Determine suggested products (Combo gợi ý)
  const suggestedProducts = allProducts.filter(p => {
    if (p.id === product.id) return false;
    // If viewing meat, suggest spices
    if (product.category !== 'Gia vị' && p.category === 'Gia vị') return true;
    // If viewing spices, suggest popular meats
    if (product.category === 'Gia vị' && p.category === 'Thịt gác bếp') return true;
    return false;
  }).slice(0, 3); // Limit to 3 suggestions

  return (
    <div className="bg-kem min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-khoi-lam/70 hover:text-khoi-lam mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-khoi-lam/5 shadow-sm">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>

          <div className="flex flex-col">
            <span className="text-xanh-rung uppercase tracking-widest text-sm font-semibold mb-4 block">{product.category}</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-khoi-lam mb-6">{product.name}</h1>
            <p className="text-2xl font-bold text-do-gach mb-8">{product.price.toLocaleString('vi-VN')}đ</p>

            <p className="text-khoi-lam/80 text-lg leading-relaxed mb-8">{product.description}</p>

            <div className="mb-8">
              <h3 className="font-semibold text-khoi-lam mb-4">Chọn trọng lượng:</h3>
              <div className="flex flex-wrap gap-4">
                {Array.isArray(product.weights) && product.weights.map((weight: string) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all font-medium ${
                      selectedWeight === weight
                        ? 'border-vang-logo bg-vang-logo/10 text-khoi-lam'
                        : 'border-khoi-lam/10 text-khoi-lam/60 hover:border-khoi-lam/30'
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-12">
              <div className="flex items-center gap-4 bg-white border border-khoi-lam/10 rounded-xl p-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-kem text-khoi-lam transition-colors">-</button>
                <span className="w-8 text-center font-semibold text-khoi-lam">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-kem text-khoi-lam transition-colors">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-grow bg-vang-logo text-khoi-lam font-bold py-4 rounded-xl hover:bg-vang-logo/90 transition-colors flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ
              </button>
            </div>

            <div className="space-y-6 border-t border-khoi-lam/10 pt-8">
              <div>
                <h4 className="font-semibold text-khoi-lam mb-2">Thành phần:</h4>
                <p className="text-khoi-lam/70 text-sm">{product.ingredients}</p>
              </div>
              <div>
                <h4 className="font-semibold text-khoi-lam mb-2">Bảo quản:</h4>
                <p className="text-khoi-lam/70 text-sm">{product.storage}</p>
              </div>
              <div>
                <h4 className="font-semibold text-khoi-lam mb-2">Hướng dẫn sử dụng:</h4>
                <p className="text-khoi-lam/70 text-sm">{product.usage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Combo gợi ý */}
        {suggestedProducts.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-2 block">Thưởng thức trọn vẹn</span>
              <h2 className="font-serif text-3xl font-bold text-khoi-lam">Combo gợi ý</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedProducts.map((suggested) => (
                <div key={suggested.id} className="bg-white rounded-3xl p-6 shadow-sm border border-khoi-lam/5 flex flex-col">
                  <Link to={`/san-pham/${suggested.id}`} className="block aspect-square rounded-2xl overflow-hidden mb-6">
                    <img src={suggested.image} alt={suggested.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </Link>
                  <div className="flex-grow">
                    <span className="text-xanh-rung text-xs font-semibold uppercase tracking-wider mb-2 block">{suggested.category}</span>
                    <Link to={`/san-pham/${suggested.id}`}>
                      <h3 className="font-serif text-xl font-bold text-khoi-lam mb-2 hover:text-vang-logo transition-colors">{suggested.name}</h3>
                    </Link>
                    <p className="text-khoi-lam/60 text-sm line-clamp-2 mb-4">{suggested.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-khoi-lam/10">
                    <span className="font-bold text-do-gach text-lg">{suggested.price.toLocaleString('vi-VN')}đ</span>
                    <button 
                      onClick={() => {
                        addToCart(suggested, 1, suggested.weights[0]);
                        alert(`Đã thêm ${suggested.name} vào giỏ hàng!`);
                      }}
                      className="bg-khoi-lam/5 text-khoi-lam p-3 rounded-xl hover:bg-vang-logo hover:text-khoi-lam transition-colors"
                      title="Thêm vào giỏ"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
