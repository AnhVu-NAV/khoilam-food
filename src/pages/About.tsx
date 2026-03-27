import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Leaf, Flame } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-kem min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xanh-rung uppercase tracking-widest text-sm font-semibold mb-4 block"
          >
            Về Khói Lam
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6 leading-tight"
          >
            Mang vị bản <span className="italic font-light">xuống phố</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-khoi-lam/70 text-lg leading-relaxed"
          >
            Khói Lam không chỉ bán đặc sản. Chúng tôi bán một trải nghiệm văn hoá. Bằng việc ứng dụng công nghệ truy xuất nguồn gốc, chúng tôi minh bạch hoá quy trình thủ công, để bạn an tâm thưởng thức trọn vẹn tinh hoa núi rừng Tây Bắc.
          </motion.p>
        </div>
      </section>

        {/* Mission & Values */}
        <section className="bg-white py-24 border-y border-khoi-lam/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    <div className="max-w-2xl">
        <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-4 block">
          Giá trị cốt lõi
        </span>

                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-khoi-lam mb-6 leading-tight">
                            Sứ mệnh của chúng tôi
                        </h2>

                        <p className="text-khoi-lam/70 text-lg leading-relaxed mb-6">
                            Sinh ra từ tình yêu với vùng đất Tây Bắc, Khói Lam mang trong mình sứ mệnh
                            bảo tồn và lan toả những giá trị ẩm thực truyền thống của đồng bào dân tộc.
                            Chúng tôi tin rằng, mỗi món ăn không chỉ là thực phẩm, mà còn là câu chuyện
                            về văn hoá, về con người và về sự giao hoà với thiên nhiên.
                        </p>

                        <p className="text-khoi-lam/70 text-lg leading-relaxed">
                            Đồng thời, chúng tôi cam kết mang đến sự minh bạch tuyệt đối thông qua công
                            nghệ truy xuất nguồn gốc, giúp khách hàng hiện đại dễ dàng tiếp cận và an tâm
                            tận hưởng những sản phẩm thủ công chất lượng cao.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-kem/50 p-8 rounded-3xl border border-khoi-lam/5 text-center min-h-[220px] flex flex-col justify-center">
                            <div className="w-14 h-14 bg-vang-logo/20 rounded-full flex items-center justify-center mx-auto mb-5 text-khoi-lam">
                                <Heart className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-khoi-lam text-lg mb-3">Tận tâm</h3>
                            <p className="text-sm leading-relaxed text-khoi-lam/60">
                                Chăm chút từng thớ thịt, từng hạt gia vị.
                            </p>
                        </div>

                        <div className="bg-kem/50 p-8 rounded-3xl border border-khoi-lam/5 text-center min-h-[220px] flex flex-col justify-center">
                            <div className="w-14 h-14 bg-xanh-rung/20 rounded-full flex items-center justify-center mx-auto mb-5 text-xanh-rung">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-khoi-lam text-lg mb-3">Minh bạch</h3>
                            <p className="text-sm leading-relaxed text-khoi-lam/60">
                                Rõ ràng nguồn gốc, an tâm chất lượng.
                            </p>
                        </div>

                        <div className="bg-kem/50 p-8 rounded-3xl border border-khoi-lam/5 text-center min-h-[220px] flex flex-col justify-center">
                            <div className="w-14 h-14 bg-do-gach/20 rounded-full flex items-center justify-center mx-auto mb-5 text-do-gach">
                                <Flame className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-khoi-lam text-lg mb-3">Truyền thống</h3>
                            <p className="text-sm leading-relaxed text-khoi-lam/60">
                                Giữ gìn công thức cổ truyền nguyên bản.
                            </p>
                        </div>

                        <div className="bg-kem/50 p-8 rounded-3xl border border-khoi-lam/5 text-center min-h-[220px] flex flex-col justify-center">
                            <div className="w-14 h-14 bg-khoi-lam/10 rounded-full flex items-center justify-center mx-auto mb-5 text-khoi-lam">
                                <Leaf className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-khoi-lam text-lg mb-3">Tự nhiên</h3>
                            <p className="text-sm leading-relaxed text-khoi-lam/60">
                                Nguyên liệu sạch từ núi rừng Tây Bắc.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      {/* The Smoking Process */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-4 block">Nghệ thuật thủ công</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-khoi-lam">Quy trình gác bếp chuẩn vị</h2>
        </div>

        <div className="space-y-24">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-6xl text-vang-logo/30 font-bold">01</span>
                <h3 className="font-serif text-3xl font-bold text-khoi-lam">Tuyển chọn nguyên liệu</h3>
              </div>
              <p className="text-khoi-lam/70 text-lg leading-relaxed mb-4">
                Mọi tinh hoa bắt đầu từ nguyên liệu. Chúng tôi chỉ chọn những phần thịt ngon nhất từ trâu, lợn bản thả đồi khoẻ mạnh. Thịt phải tươi, thớ dọc rõ ràng để khi xé không bị nát.
              </p>
              <p className="text-khoi-lam/70 text-lg leading-relaxed">
                Gia vị là linh hồn của món ăn. Mắc khén, hạt dổi, ớt rừng được thu mua trực tiếp từ người đồng bào, phơi khô tự nhiên để giữ trọn vẹn hương thơm cay nồng đặc trưng.
              </p>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <img src="https://lh3.googleusercontent.com/d/1DqazOLUbrDqDRUaBA1V6E1gCDLb4T3fM" alt="Nguyên liệu tươi ngon" className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]" referrerPolicy="no-referrer" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <img src="https://lh3.googleusercontent.com/d/1lF-BKnqH-exfVdB1AQk2yTbwDQ-HQsFW" alt="Tẩm ướp gia vị" className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]" referrerPolicy="no-referrer" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-6xl text-xanh-rung/30 font-bold">02</span>
                <h3 className="font-serif text-3xl font-bold text-khoi-lam">Tẩm ướp thủ công</h3>
              </div>
              <p className="text-khoi-lam/70 text-lg leading-relaxed mb-4">
                Thịt được thái dọc thớ thành từng miếng vừa vặn, sau đó tẩm ướp cùng hỗn hợp gia vị giã tay theo tỷ lệ bí truyền. Không có mắc khén, thịt gác bếp chỉ là thịt khô.
              </p>
              <p className="text-khoi-lam/70 text-lg leading-relaxed">
                Quá trình ướp kéo dài từ 10 đến 12 tiếng để gia vị ngấm sâu vào từng thớ thịt, tạo nên bản giao hưởng hương vị độc nhất trước khi lên giàn hun.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-6xl text-do-gach/30 font-bold">03</span>
                <h3 className="font-serif text-3xl font-bold text-khoi-lam">Hun khói gác bếp</h3>
              </div>
              <p className="text-khoi-lam/70 text-lg leading-relaxed mb-4">
                Trên những nếp nhà sàn, bếp lửa là trái tim. Khói bếp không chỉ sưởi ấm mà còn là gia vị bí mật. Chúng tôi sử dụng củi nhãn khô, hun khói liên tục trong 60 giờ.
              </p>
              <p className="text-khoi-lam/70 text-lg leading-relaxed">
                Nhiệt độ được kiểm soát khắt khe, người thợ phải túc trực ngày đêm để lật trở miếng thịt mỗi 6 tiếng. Nhờ vậy, thịt khô đều từ ngoài vào trong, thớ thịt săn lại, màu nâu óng tự nhiên, đượm mùi khói nhưng vẫn giữ độ ngọt mềm bên trong.
              </p>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <img src="https://lh3.googleusercontent.com/d/1L8HofwEXeUuuTucZfRjAQr3nJA9uYhWS" alt="Hun khói gác bếp" className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
