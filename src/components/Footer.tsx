import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-khoi-lam text-kem pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-kem mb-4 block">
              Khói Lam
            </Link>
            <p className="text-kem/70 text-sm leading-relaxed mb-6">
              Gói trọn vị bản. Nền tảng trải nghiệm văn hoá Tây Bắc kết hợp công nghệ truy xuất nguồn gốc minh bạch.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-kem/70 hover:text-kem transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-kem/70 hover:text-kem transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-kem/70 hover:text-kem transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-kem">Sản phẩm</h3>
            <ul className="space-y-3">
              <li><Link to="/san-pham" className="text-kem/70 hover:text-kem text-sm transition-colors">Thịt trâu gác bếp</Link></li>
              <li><Link to="/san-pham" className="text-kem/70 hover:text-kem text-sm transition-colors">Thịt lợn bản gác bếp</Link></li>
              <li><Link to="/san-pham" className="text-kem/70 hover:text-kem text-sm transition-colors">Lạp xưởng gác bếp</Link></li>
              <li><Link to="/san-pham" className="text-kem/70 hover:text-kem text-sm transition-colors">Gia vị chẩm chéo</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-kem">Khám phá</h3>
            <ul className="space-y-3">
              <li><Link to="/cau-chuyen" className="text-kem/70 hover:text-kem text-sm transition-colors">Câu chuyện thương hiệu</Link></li>
              <li><Link to="/truy-xuat" className="text-kem/70 hover:text-kem text-sm transition-colors">Truy xuất nguồn gốc</Link></li>
              <li><Link to="/blog" className="text-kem/70 hover:text-kem text-sm transition-colors">Nhật ký bếp lửa</Link></li>
              <li><Link to="/lien-he" className="text-kem/70 hover:text-kem text-sm transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-kem">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-kem/70 text-sm">
                <MapPin className="w-5 h-5 shrink-0 text-kem/50" />
                <span>Bản Lác, Mai Châu, Hoà Bình</span>
              </li>
              <li className="flex items-center gap-3 text-kem/70 text-sm">
                <Phone className="w-5 h-5 shrink-0 text-kem/50" />
                <span>0987 654 321</span>
              </li>
              <li className="flex items-center gap-3 text-kem/70 text-sm">
                <Mail className="w-5 h-5 shrink-0 text-kem/50" />
                <span>chao@khoilam.vn</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-kem/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-kem/50 text-xs">
            &copy; {new Date().getFullYear()} Khói Lam. All rights reserved.
          </p>
          <div className="flex gap-4 text-kem/50 text-xs">
            <a href="#" className="hover:text-kem transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-kem transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
