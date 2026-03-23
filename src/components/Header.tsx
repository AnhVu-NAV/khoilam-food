import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, Search, User, LogOut, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/LOGOVANG.png';

export default function Header() {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
    const [isMobileProductMenuOpen, setIsMobileProductMenuOpen] = useState(false);

    const productCategories = [
        'Thịt gác bếp',
        'Lạp xưởng',
        'Cá gác bếp',
        'Gia vị',
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-kem/90 backdrop-blur-md border-b border-khoi-lam/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 -ml-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full lg:hidden"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>

                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="Khói Lam"
                                className="h-24 w-auto object-contain translate-y-[1px]"
                            />

                            <div className="flex flex-col justify-center leading-none">
                                <span className="text-[18px] sm:text-[20px] font-bold tracking-wide text-khoi-lam">
                                  KHÓI LAM
                                </span>

                                <div className="w-full h-[2px] bg-khoi-lam my-2"></div>

                                <span className="font-serif text-[15px] text-khoi-lam/80">
                                  Đặc Sản Tây Bắc
                                </span>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-sm font-medium hover:text-xanh-rung transition-colors"
                        >
                            Trang chủ
                        </Link>

                        <Link
                            to="/gioi-thieu"
                            className="text-sm font-medium hover:text-xanh-rung transition-colors"
                        >
                            Giới thiệu
                        </Link>

                        <div
                            className="relative"
                            onMouseEnter={() => setIsProductMenuOpen(true)}
                            onMouseLeave={() => setIsProductMenuOpen(false)}
                        >
                            <Link
                                to="/san-pham"
                                className="text-sm font-medium hover:text-xanh-rung transition-colors flex items-center gap-1"
                            >
                                Sản phẩm
                                <ChevronDown className="w-4 h-4" />
                            </Link>

                            {isProductMenuOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                                    <div className="w-72 rounded-2xl border border-khoi-lam/10 bg-kem shadow-xl p-3">
                                        <div className="grid gap-1">
                                            <Link
                                                to="/san-pham"
                                                className="px-4 py-3 rounded-xl text-sm font-semibold text-khoi-lam hover:bg-khoi-lam/5 transition-colors"
                                            >
                                                Tất cả sản phẩm
                                            </Link>

                                            {productCategories.map((category) => (
                                                <Link
                                                    key={category}
                                                    to={`/san-pham?category=${encodeURIComponent(category)}`}
                                                    className="px-4 py-3 rounded-xl text-sm text-khoi-lam hover:bg-khoi-lam/5 hover:text-xanh-rung transition-colors"
                                                >
                                                    {category}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            to="/cau-chuyen"
                            className="text-sm font-medium hover:text-xanh-rung transition-colors"
                        >
                            Câu chuyện
                        </Link>

                        <Link
                            to="/truy-xuat"
                            className="text-sm font-medium hover:text-xanh-rung transition-colors"
                        >
                            Truy xuất nguồn gốc
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full">
                            <Search className="w-5 h-5" />
                        </button>

                        <Link
                            to="/gio-hang"
                            className="p-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full relative"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {items.length > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-vang-logo text-khoi-lam text-[10px] font-bold flex items-center justify-center rounded-full">
                  {items.length}
                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <Link
                                    to={['admin', 'seller', 'factory_manager'].includes(user.role) ? '/admin' : '/tai-khoan'}
                                    className="flex items-center gap-2 text-sm font-medium hover:text-xanh-rung transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden sm:inline">{user.name}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/dang-nhap"
                                className="ml-2 text-sm font-medium hover:text-xanh-rung transition-colors flex items-center gap-2"
                            >
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline">Đăng nhập</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-kem border-b border-khoi-lam/10 shadow-lg">
                    <nav className="flex flex-col p-4">
                        <Link
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors"
                        >
                            Trang chủ
                        </Link>

                        <Link
                            to="/gioi-thieu"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors"
                        >
                            Giới thiệu
                        </Link>

                        <div className="rounded-xl">
                            <button
                                onClick={() => setIsMobileProductMenuOpen(!isMobileProductMenuOpen)}
                                className="w-full flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors text-left"
                            >
                                <span>Sản phẩm</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                        isMobileProductMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {isMobileProductMenuOpen && (
                                <div className="mt-1 ml-3 flex flex-col gap-1">
                                    <Link
                                        to="/san-pham"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsMobileProductMenuOpen(false);
                                        }}
                                        className="py-2 px-4 text-sm hover:bg-khoi-lam/5 rounded-xl transition-colors"
                                    >
                                        Tất cả sản phẩm
                                    </Link>

                                    {productCategories.map((category) => (
                                        <Link
                                            key={category}
                                            to={`/san-pham?category=${encodeURIComponent(category)}`}
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                setIsMobileProductMenuOpen(false);
                                            }}
                                            className="py-2 px-4 text-sm hover:bg-khoi-lam/5 rounded-xl transition-colors"
                                        >
                                            {category}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            to="/cau-chuyen"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors"
                        >
                            Câu chuyện
                        </Link>

                        <Link
                            to="/truy-xuat"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors"
                        >
                            Truy xuất nguồn gốc
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}