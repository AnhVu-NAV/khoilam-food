import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate('/gio-hang');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          email: email,
          items: items.map(i => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: i.product.price
          })),
          total,
          shipping_address: address,
          phone
        }),
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        alert('Đặt hàng thành công!');
        if (user) {
          navigate('/tai-khoan');
        } else {
          navigate('/');
        }
      } else {
        alert('Có lỗi xảy ra khi đặt hàng.');
      }
    } catch (error) {
      alert('Lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-kem min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-12 text-center">Thanh toán</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-khoi-lam/5 p-8">
          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-khoi-lam mb-2">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!user}
                className={`w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all ${user ? 'bg-kem/50 text-khoi-lam/70' : ''}`}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-khoi-lam mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!user}
                className={`w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all ${user ? 'bg-kem/50 text-khoi-lam/70' : ''}`}
                placeholder="Nhập địa chỉ email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-khoi-lam mb-2">Số điện thoại</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all"
                placeholder="Nhập số điện thoại giao hàng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-khoi-lam mb-2">Địa chỉ giao hàng</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all"
                placeholder="Nhập địa chỉ chi tiết"
              ></textarea>
            </div>

            <div className="border-t border-khoi-lam/10 pt-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <span className="font-serif text-xl font-bold text-khoi-lam">Tổng thanh toán:</span>
                <span className="font-bold text-2xl text-do-gach">{total.toLocaleString('vi-VN')}đ</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-vang-logo text-khoi-lam font-bold py-4 rounded-xl hover:bg-vang-logo/90 transition-colors disabled:opacity-70"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
