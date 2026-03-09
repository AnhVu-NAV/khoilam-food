import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || `Lỗi ${res.status}`);
                return;
            }

            if (data.success) {
                login(data.user);
                navigate('/');
            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-kem px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-khoi-lam/5">
                <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl font-bold text-khoi-lam mb-2">Đăng nhập</h2>
                    <p className="text-khoi-lam/70">Chào mừng bạn quay lại với Khói Lam</p>
                </div>

                {error && (
                    <div className="bg-do-gach/10 text-do-gach p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-khoi-lam mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all"
                            placeholder="Nhập email của bạn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-khoi-lam mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-khoi-lam/20 focus:outline-none focus:border-vang-logo focus:ring-2 focus:ring-vang-logo/20 transition-all"
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-vang-logo text-khoi-lam font-bold py-3 rounded-xl hover:bg-vang-logo/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-khoi-lam/70">
                    Chưa có tài khoản?{' '}
                    <Link to="/dang-ky" className="text-xanh-rung font-semibold hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}