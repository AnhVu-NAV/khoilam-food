import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Mail, X } from 'lucide-react';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [showFakeEmail, setShowFakeEmail] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  if (items.length === 0 && !showFakeEmail) {
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
        setOrderId(data.orderId || Math.floor(Math.random() * 10000) + 1000);
        setShowFakeEmail(true);
        clearCart();
      } else {
        alert('Có lỗi xảy ra khi đặt hàng.');
      }
    } catch (error) {
      alert('Lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEmail = () => {
    setShowFakeEmail(false);
    if (user) {
      navigate('/tai-khoan');
    } else {
      navigate('/');
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

      {/* Fake Email Modal */}
      {showFakeEmail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Email Header */}
            <div className="bg-khoi-lam p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-vang-logo" />
                <div>
                  <h3 className="font-bold">Hộp thư đến - Mô phỏng Email</h3>
                  <p className="text-xs text-white/70">Gửi tới: {email}</p>
                </div>
              </div>
              <button onClick={handleCloseEmail} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Email Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-bold text-khoi-lam mb-2">Khói Lam</h2>
                <p className="text-khoi-lam/60 uppercase tracking-widest text-sm">Đặc sản Tây Bắc</p>
              </div>

              <div className="bg-kem/30 rounded-2xl p-6 border border-khoi-lam/10 mb-8">
                <h3 className="font-bold text-xl text-khoi-lam mb-4">Xác nhận đơn hàng #{orderId}</h3>
                <p className="text-khoi-lam/80 mb-4">Chào {name},</p>
                <p className="text-khoi-lam/80 mb-4">Cảm ơn bạn đã đặt hàng tại Khói Lam. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.</p>
                
                <div className="bg-white p-4 rounded-xl border border-khoi-lam/5 mb-4">
                  <h4 className="font-bold text-khoi-lam mb-2">Thông tin giao hàng:</h4>
                  <ul className="text-sm text-khoi-lam/70 space-y-1">
                    <li><strong>Người nhận:</strong> {name}</li>
                    <li><strong>Số điện thoại:</strong> {phone}</li>
                    <li><strong>Địa chỉ:</strong> {address}</li>
                  </ul>
                </div>

                <div className="border-t border-khoi-lam/10 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-khoi-lam">Tổng thanh toán:</span>
                    <span className="font-bold text-xl text-do-gach">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-khoi-lam/60 mb-6">Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận thời gian giao hàng.</p>
                <button 
                  onClick={handleCloseEmail}
                  className="bg-vang-logo text-khoi-lam px-8 py-3 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors"
                >
                  Đóng & Trở về
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
