import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, Search, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {logo} from '../assets/logo.png';

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
              <Link
                  to="/"
                  className="font-serif text-2xl font-bold tracking-tight text-khoi-lam flex items-center gap-3"
              >
                  <img
                      src={logo}
                      alt="Khói Lam"
                      className="h-10 w-auto"
                  />
                  Khói Lam
              </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-xanh-rung transition-colors">Trang chủ</Link>
            <Link to="/gioi-thieu" className="text-sm font-medium hover:text-xanh-rung transition-colors">Giới thiệu</Link>
            <Link to="/san-pham" className="text-sm font-medium hover:text-xanh-rung transition-colors">Sản phẩm</Link>
            <Link to="/cau-chuyen" className="text-sm font-medium hover:text-xanh-rung transition-colors">Câu chuyện</Link>
            <Link to="/truy-xuat" className="text-sm font-medium hover:text-xanh-rung transition-colors">Truy xuất nguồn gốc</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/gio-hang" className="p-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full relative">
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-vang-logo text-khoi-lam text-[10px] font-bold flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <Link to={['admin', 'seller', 'factory_manager'].includes(user.role) ? '/admin' : '/tai-khoan'} className="flex items-center gap-2 text-sm font-medium hover:text-xanh-rung transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-khoi-lam hover:bg-khoi-lam/5 rounded-full" title="Đăng xuất">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/dang-nhap" className="ml-2 text-sm font-medium hover:text-xanh-rung transition-colors flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-kem border-b border-khoi-lam/10 shadow-lg">
          <nav className="flex flex-col p-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors">Trang chủ</Link>
            <Link to="/gioi-thieu" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors">Giới thiệu</Link>
            <Link to="/san-pham" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors">Sản phẩm</Link>
            <Link to="/cau-chuyen" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors">Câu chuyện</Link>
            <Link to="/truy-xuat" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-sm font-medium hover:bg-khoi-lam/5 rounded-xl transition-colors">Truy xuất nguồn gốc</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
