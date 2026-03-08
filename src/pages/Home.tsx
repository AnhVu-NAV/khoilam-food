import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, Sparkles, Flame } from 'lucide-react';
import { products } from '../data/products';
import { motion } from 'framer-motion';

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-khoi-lam">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/khoibep/1920/1080?blur=2" 
            alt="Khói bếp Tây Bắc" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-khoi-lam via-transparent to-khoi-lam/50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-kem/80 uppercase tracking-[0.3em] text-sm font-semibold mb-6 block"
          >
            Đặc sản Tây Bắc
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl text-kem font-light tracking-tight mb-8 leading-none"
          >
            Gói trọn <br/><span className="italic font-medium text-vang-logo">vị bản</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-kem/90 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Trải nghiệm hương vị nguyên bản của núi rừng Tây Bắc, kết hợp cùng công nghệ truy xuất nguồn gốc minh bạch.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link 
              to="/san-pham" 
              className="inline-flex items-center gap-3 bg-vang-logo text-khoi-lam px-8 py-4 rounded-full hover:bg-vang-logo/90 transition-all duration-300 font-bold tracking-wide"
            >
              Khám phá vị khói
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-24 bg-kem">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto bg-xanh-rung/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-xanh-rung/20 transition-colors">
                <Flame className="w-8 h-8 text-xanh-rung" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-4 text-khoi-lam">Thủ công truyền thống</h3>
              <p className="text-khoi-lam/70 leading-relaxed">
                Hun khói củi nhãn liên tục nhiều giờ theo công thức bí truyền của người Thái, giữ trọn độ ngọt mềm bên trong.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto bg-vang-logo/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-vang-logo/30 transition-colors">
                <QrCode className="w-8 h-8 text-khoi-lam" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-4 text-khoi-lam">Truy xuất minh bạch</h3>
              <p className="text-khoi-lam/70 leading-relaxed">
                Mỗi mẻ thịt đều có mã QR riêng. Quét để xem nguồn gốc nguyên liệu, biểu đồ nhiệt độ hun và kết quả kiểm nghiệm.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto bg-khoi-lam/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-khoi-lam/20 transition-colors">
                <Sparkles className="w-8 h-8 text-khoi-lam" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-4 text-khoi-lam">Trải nghiệm cao cấp</h3>
              <p className="text-khoi-lam/70 leading-relaxed">
                Đóng gói sang trọng, hút chân không an toàn. Món quà biếu tinh tế mang đậm bản sắc văn hoá vùng cao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-xanh-rung uppercase tracking-widest text-sm font-semibold mb-2 block">Tinh hoa núi rừng</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-khoi-lam">Sản phẩm nổi bật</h2>
            </div>
            <Link to="/san-pham" className="hidden md:inline-flex items-center gap-2 text-khoi-lam hover:text-xanh-rung font-medium transition-colors border-b border-transparent hover:border-xanh-rung pb-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link to={`/san-pham/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-khoi-lam/5 h-full">
                <div className="aspect-[4/5] overflow-hidden bg-kem relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-khoi-lam shadow-sm">
                    {product.category}
                  </div>
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-white text-do-gach px-4 py-2 rounded-full font-bold text-sm shadow-lg">Hết hàng</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-xl font-semibold text-khoi-lam mb-2 group-hover:text-xanh-rung transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-khoi-lam/60 text-sm line-clamp-2 mb-6 flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-khoi-lam/10 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs text-khoi-lam/50 block mb-0.5">Giá từ</span>
                      <span className="font-semibold text-lg text-khoi-lam">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    {Array.isArray(product.weights) && product.weights.length > 0 && (
                      <div className="bg-khoi-lam/5 text-khoi-lam px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide">
                        {product.weights[0].trim()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/san-pham" className="inline-flex items-center gap-2 text-khoi-lam hover:text-xanh-rung font-medium transition-colors border-b border-khoi-lam pb-1">
              Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Traceability Demo Section */}
      <section className="py-24 bg-khoi-lam text-kem overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current"><path d="M0,0 L100,0 L100,100 L0,100 Z M50,50 C77.6142375,50 100,27.6142375 100,0 C100,27.6142375 77.6142375,50 50,50 C22.3857625,50 0,27.6142375 0,0 C0,27.6142375 22.3857625,50 50,50 Z" /></svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-4 block">Công nghệ minh bạch</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Biết rõ miếng thịt bạn ăn <br/><span className="italic font-light text-kem/80">đến từ đâu</span>
              </h2>
              <p className="text-kem/70 text-lg mb-8 leading-relaxed">
                Không chỉ là lời hứa. Khói Lam số hoá toàn bộ quy trình sản xuất. Nhập mã lô trên bao bì để xem hành trình từ bản làng đến bàn ăn của bạn.
              </p>
              
              <div className="mb-8">
                <Link to="/truy-xuat" className="inline-block bg-vang-logo text-khoi-lam px-8 py-4 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors text-center text-lg shadow-lg shadow-vang-logo/20">
                  Truy xuất ngay
                </Link>
              </div>
              
              <ul className="space-y-4">
                {['Nguồn gốc nguyên liệu rõ ràng', 'Biểu đồ nhiệt độ hun khói thực tế', 'Kết quả kiểm nghiệm VSATTP'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-kem/80">
                    <div className="w-6 h-6 rounded-full bg-xanh-rung/30 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 bg-kem rounded-full"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-kem/10 shadow-2xl relative z-10">
                <img 
                  src="https://picsum.photos/seed/app/800/1000" 
                  alt="Giao diện truy xuất" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-khoi-lam/90 via-khoi-lam/20 to-transparent flex flex-col justify-end p-8">
                  <div className="bg-kem/10 backdrop-blur-md border border-kem/20 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-kem/60 text-sm">Mã lô: KL-TRB-2026-01</span>
                      <span className="bg-xanh-rung/40 text-kem text-xs px-2 py-1 rounded">Đạt chuẩn</span>
                    </div>
                    <h4 className="font-serif text-xl font-semibold text-kem mb-2">Thịt Trâu Gác Bếp</h4>
                    <div className="h-1 w-full bg-kem/20 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-vang-logo w-3/4"></div>
                    </div>
                    <p className="text-kem/70 text-sm">Đã hun khói 48/60 giờ</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-vang-logo/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-xanh-rung/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
