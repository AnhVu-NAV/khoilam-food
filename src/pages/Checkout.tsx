import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Mail, X } from 'lucide-react';

type PaymentMethod = 'cod' | 'bank_transfer';

const BANK_INFO = {
    bankName: 'TPBank',
    accountNumber: '0000 0117 719',
    accountHolder: 'Pham Binh Quang',
};

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const savedGuestInfo =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('guestInfo') || '{}')
            : {};

    const [address, setAddress] = useState(user?.address || savedGuestInfo.address || '');
    const [phone, setPhone] = useState(user?.phone || savedGuestInfo.phone || '');
    const [email, setEmail] = useState(user?.email || savedGuestInfo.email || '');
    const [name, setName] = useState(user?.name || savedGuestInfo.name || '');
    const [loading, setLoading] = useState(false);
    const [showFakeEmail, setShowFakeEmail] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

    if (items.length === 0 && !showFakeEmail) {
        navigate('/gio-hang');
        return null;
    }

    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    email,
                    name,
                    items: items.map((i) => ({
                        product_id: i.isCombo ? null : i.product.id,
                        combo_id: i.isCombo ? i.comboId : null,
                        quantity: i.quantity,
                        weight: i.weight,
                        price: i.price,
                    })),
                    total,
                    shipping_address: address,
                    phone,
                    payment_method: paymentMethod,
                }),
            });

            const data = await res.json();

            if (data.success) {
                if (user) {
                    login({ ...user, address, phone });
                } else {
                    localStorage.setItem(
                        'guestInfo',
                        JSON.stringify({ name, email, phone, address })
                    );
                }

                setOrderId(data.orderId || Math.floor(Math.random() * 10000) + 1000);
                setShowFakeEmail(true);
                clearCart();
            } else {
                alert(data.message || 'Có lỗi xảy ra khi đặt hàng.');
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-12 text-center">
                    Thanh toán
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-khoi-lam/5 p-8">
                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-2">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!!user}
                                        className={`w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all ${
                                            user ? 'bg-kem/50 text-khoi-lam/70' : ''
                                        }`}
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!!user}
                                        className={`w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all ${
                                            user ? 'bg-kem/50 text-khoi-lam/70' : ''
                                        }`}
                                        placeholder="Nhập địa chỉ email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-2">
                                        Số điện thoại
                                    </label>
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
                                    <label className="block text-sm font-medium text-khoi-lam mb-2">
                                        Địa chỉ giao hàng
                                    </label>
                                    <textarea
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all"
                                        placeholder="Nhập địa chỉ chi tiết"
                                    />
                                </div>

                                <div className="border-t border-khoi-lam/10 pt-6">
                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-5">
                                        Phương thức thanh toán
                                    </h2>

                                    <div className="space-y-4">
                                        <label className="block cursor-pointer">
                                            <div
                                                className={`rounded-2xl border p-5 transition-all ${
                                                    paymentMethod === 'cod'
                                                        ? 'border-vang-logo bg-vang-logo/5'
                                                        : 'border-khoi-lam/15 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="cod"
                                                        checked={paymentMethod === 'cod'}
                                                        onChange={() => setPaymentMethod('cod')}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-khoi-lam text-lg">
                                                            Ship & Trả tiền mặt khi nhận hàng
                                                        </p>

                                                        {paymentMethod === 'cod' && (
                                                            <div className="mt-4 text-khoi-lam/85 space-y-3 leading-8">
                                                                <p>
                                                                    <strong>THANH TOÁN KHI NHẬN HÀNG (C.O.D)</strong>, đơn giản,
                                                                    tiện lợi! Chưa bao gồm phí giao hàng
                                                                </p>
                                                                <div>
                                                                    <p className="font-semibold">+ Phí giao hàng:</p>
                                                                    <p>▶ HÀ NỘI: Giao hàng ngay trong nội thành, phí ship từ 30.000đ/đơn hàng (tùy khu vực)</p>
                                                                    <p>
                                                                        ▶ Ship TOÀN QUỐC: 50.000đ/đơn hàng, bất kể số lượng.
                                                                        (Riêng các sản phẩm Trâu, Bò, Gà, Cá Gác bếp từ
                                                                        50.000đ/kg)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        <label className="block cursor-pointer">
                                            <div
                                                className={`rounded-2xl border p-5 transition-all ${
                                                    paymentMethod === 'bank_transfer'
                                                        ? 'border-vang-logo bg-vang-logo/5'
                                                        : 'border-khoi-lam/15 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="bank_transfer"
                                                        checked={paymentMethod === 'bank_transfer'}
                                                        onChange={() => setPaymentMethod('bank_transfer')}
                                                        className="mt-1"
                                                    />

                                                    <div className="flex-1">
                                                        <p className="font-bold text-khoi-lam text-lg">
                                                            Chuyển khoản ngân hàng
                                                        </p>

                                                        {paymentMethod === 'bank_transfer' && (
                                                            <div className="mt-4 space-y-5">
                                                                <div className="text-khoi-lam/85 leading-8">
                                                                    <p>
                                                                        Khi thực hiện thanh toán qua ngân hàng, quý anh chị vui lòng
                                                                        ghi rõ <strong>MÃ SỐ ĐƠN HÀNG</strong> (vui lòng kèm email),
                                                                        hoặc số điện thoại liên lạc vào phần{' '}
                                                                        <strong>THÔNG TIN CHUYỂN KHOẢN</strong> để chúng tôi thuận
                                                                        tiện kiểm soát đơn hàng hơn. Xin chân thành cảm ơn!
                                                                    </p>

                                                                    <div className="mt-3">
                                                                        <p className="font-semibold">▶ TÀI KHOẢN</p>
                                                                        <p>- Ngân hàng {BANK_INFO.bankName}</p>
                                                                        <p>- Số tài khoản: {BANK_INFO.accountNumber}</p>
                                                                        <p>- Chủ tài khoản: {BANK_INFO.accountHolder}</p>
                                                                    </div>

                                                                    <div className="mt-4">
                                                                        <p className="font-semibold">+ PHÍ GIAO HÀNG</p>
                                                                        <p>▶ HÀ NỘI: Giao hàng ngay trong nội thành, phí ship từ 30.000đ/đơn hàng</p>
                                                                        <p>
                                                                            ▶ Ship TOÀN QUỐC: 50.000đ/đơn hàng, bất kể số lượng.
                                                                            (Riêng các sản phẩm Trâu, Bò, Gà, Cá Gác bếp từ
                                                                            50.000đ/kg)
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="rounded-2xl border border-khoi-lam/10 bg-white p-4 flex justify-center">
                                                                    <img
                                                                        src="/images/tpbank-qr.png"
                                                                        alt="QR TPBank"
                                                                        className="max-w-full w-[280px] rounded-xl object-contain"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t border-khoi-lam/10 pt-6 mt-8">
                                    <div className="flex justify-between items-center mb-6">
                    <span className="font-serif text-xl font-bold text-khoi-lam">
                      Tổng thanh toán:
                    </span>
                                        <span className="font-bold text-2xl text-do-gach">
                      {total.toLocaleString('vi-VN')}đ
                    </span>
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

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-khoi-lam/5 p-6 sticky top-28">
                            <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-5">Đơn hàng</h3>

                            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div
                                        key={`${item.product.id}-${item.weight}`}
                                        className="flex gap-3 pb-4 border-b border-khoi-lam/10"
                                    >
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                            referrerPolicy="no-referrer"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-khoi-lam line-clamp-2">
                                                {item.product.name}
                                            </p>
                                            <p className="text-sm text-khoi-lam/60">Phân loại: {item.weight}</p>
                                            <p className="text-sm text-khoi-lam/60">SL: {item.quantity}</p>
                                            <p className="text-sm font-medium text-khoi-lam">
                                                {item.price.toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 space-y-3 text-khoi-lam/80">
                                <div className="flex justify-between">
                                    <span>Số lượng sản phẩm</span>
                                    <span>{itemCount}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Phương thức</span>
                                    <span className="text-right">
                    {paymentMethod === 'cod'
                        ? 'COD'
                        : 'Chuyển khoản ngân hàng'}
                  </span>
                                </div>

                                <div className="border-t border-khoi-lam/10 pt-4 flex justify-between text-khoi-lam">
                                    <span className="font-bold">Tổng cộng</span>
                                    <span className="font-bold text-xl">{total.toLocaleString('vi-VN')}đ</span>
                                </div>

                                <p className="text-xs text-khoi-lam/60 pt-2">
                                    Phí giao hàng sẽ được xác nhận thêm theo khu vực.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showFakeEmail && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="bg-khoi-lam p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <Mail className="w-6 h-6 text-vang-logo" />
                                <div>
                                    <h3 className="font-bold">Hộp thư đến - Mô phỏng Email</h3>
                                    <p className="text-xs text-white/70">Gửi tới: {email}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleCloseEmail}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="text-center mb-8">
                                <h2 className="font-serif text-3xl font-bold text-khoi-lam mb-2">Khói Lam</h2>
                                <p className="text-khoi-lam/60 uppercase tracking-widest text-sm">
                                    Đặc sản Tây Bắc
                                </p>
                            </div>

                            <div className="bg-kem/30 rounded-2xl p-6 border border-khoi-lam/10 mb-8">
                                <h3 className="font-bold text-xl text-khoi-lam mb-4">
                                    Xác nhận đơn hàng #{orderId}
                                </h3>

                                <p className="text-khoi-lam/80 mb-4">Chào {name},</p>
                                <p className="text-khoi-lam/80 mb-4">
                                    Cảm ơn bạn đã đặt hàng tại Khói Lam. Đơn hàng của bạn đã được tiếp
                                    nhận và đang trong quá trình xử lý.
                                </p>

                                <div className="bg-white p-4 rounded-xl border border-khoi-lam/5 mb-4">
                                    <h4 className="font-bold text-khoi-lam mb-2">Thông tin giao hàng:</h4>
                                    <ul className="text-sm text-khoi-lam/70 space-y-1">
                                        <li>
                                            <strong>Người nhận:</strong> {name}
                                        </li>
                                        <li>
                                            <strong>Số điện thoại:</strong> {phone}
                                        </li>
                                        <li>
                                            <strong>Địa chỉ:</strong> {address}
                                        </li>
                                        <li>
                                            <strong>Phương thức thanh toán:</strong>{' '}
                                            {paymentMethod === 'cod'
                                                ? 'Thanh toán khi nhận hàng (COD)'
                                                : 'Chuyển khoản ngân hàng'}
                                        </li>
                                    </ul>
                                </div>

                                {paymentMethod === 'bank_transfer' && (
                                    <div className="bg-white p-4 rounded-xl border border-khoi-lam/5 mb-4">
                                        <h4 className="font-bold text-khoi-lam mb-2">Thông tin chuyển khoản:</h4>
                                        <ul className="text-sm text-khoi-lam/70 space-y-1">
                                            <li>
                                                <strong>Ngân hàng:</strong> {BANK_INFO.bankName}
                                            </li>
                                            <li>
                                                <strong>Số tài khoản:</strong> {BANK_INFO.accountNumber}
                                            </li>
                                            <li>
                                                <strong>Chủ tài khoản:</strong> {BANK_INFO.accountHolder}
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                <div className="border-t border-khoi-lam/10 pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-khoi-lam">Tổng thanh toán:</span>
                                        <span className="font-bold text-xl text-do-gach">
                      {total.toLocaleString('vi-VN')}đ
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-khoi-lam/60 mb-6">
                                    Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
                                </p>
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