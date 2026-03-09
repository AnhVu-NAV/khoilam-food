import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
        const res = await fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'validate',
                code: couponCode
            }),
        });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discount_percent);
      } else {
        setCouponError(data.message);
        setDiscount(0);
      }
    } catch (error) {
      setCouponError('Lỗi kiểm tra mã giảm giá');
    }
  };

  const finalTotal = total * (1 - discount / 100);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-kem px-4">
        <h2 className="font-serif text-3xl font-bold text-khoi-lam mb-4">Giỏ hàng trống</h2>
        <p className="text-khoi-lam/70 mb-8">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
        <Link to="/san-pham" className="bg-vang-logo text-khoi-lam px-8 py-3 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-kem min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-12">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.weight}`} className="bg-white p-6 rounded-3xl shadow-sm border border-khoi-lam/5 flex flex-col sm:flex-row gap-6 items-center">
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-serif text-xl font-semibold text-khoi-lam">{item.product.name}</h3>
                  <p className="text-sm text-khoi-lam/60 mb-2">Trọng lượng: {item.weight}</p>
                  <p className="font-medium text-khoi-lam">{item.product.price.toLocaleString('vi-VN')}đ</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-kem rounded-lg p-1 border border-khoi-lam/10">
                    <button onClick={() => updateQuantity(item.product.id, item.weight, item.quantity - 1)} className="p-1 hover:bg-white rounded text-khoi-lam">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.weight, item.quantity + 1)} className="p-1 hover:bg-white rounded text-khoi-lam">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id, item.weight)} className="p-2 text-do-gach hover:bg-do-gach/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-khoi-lam/5 sticky top-28">
              <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-6">Tổng đơn hàng</h3>
              
              <div className="space-y-4 mb-6 text-khoi-lam/80">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-medium">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xanh-rung">
                    <span>Giảm giá ({discount}%)</span>
                    <span className="font-medium">-{(total * discount / 100).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-khoi-lam/10 pt-4">
                  <span className="font-bold text-khoi-lam">Tổng cộng</span>
                  <span className="font-bold text-xl text-khoi-lam">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-khoi-lam mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã"
                    className="flex-grow px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                  />
                  <button onClick={handleApplyCoupon} className="bg-khoi-lam text-kem px-4 py-2 rounded-xl hover:bg-khoi-lam/90 transition-colors">
                    Áp dụng
                  </button>
                </div>
                {couponError && <p className="text-do-gach text-sm mt-2">{couponError}</p>}
                {discount > 0 && <p className="text-xanh-rung text-sm mt-2">Đã áp dụng mã giảm giá {discount}%</p>}
              </div>

              <button
                onClick={() => navigate('/thanh-toan')}
                className="w-full bg-vang-logo text-khoi-lam font-bold py-4 rounded-xl hover:bg-vang-logo/90 transition-colors flex items-center justify-center gap-2"
              >
                Tiến hành thanh toán
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
