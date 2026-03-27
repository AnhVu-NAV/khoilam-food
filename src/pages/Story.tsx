import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Story() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1, 0]);

  const y2 = useTransform(scrollYProgress, [0.2, 0.5, 0.8], ["100%", "0%", "-50%"]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0]);

  const y3 = useTransform(scrollYProgress, [0.6, 0.8, 1], ["100%", "0%", "0%"]);
  const opacity3 = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 1, 1]);

  return (
    <div ref={containerRef} className="h-[300vh] bg-khoi-lam relative">
      
      {/* Section 1: Khói bếp */}
      <motion.div 
        style={{ y: y1, opacity: opacity1 }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
      >
        <img 
          src="https://picsum.photos/seed/bepcui/1920/1080" 
          alt="Bếp lửa" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-khoi-lam/80 via-transparent to-khoi-lam"></div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="text-vang-logo uppercase tracking-[0.3em] text-sm font-semibold mb-6 block">Khởi nguồn</span>
          <h1 className="font-serif text-5xl md:text-7xl text-kem font-light mb-8 leading-tight">
            Từ ngọn lửa <br/><span className="italic font-medium">không bao giờ tắt</span>
          </h1>
          <p className="text-kem/80 text-lg md:text-xl font-light leading-relaxed">
            Trên những nếp nhà sàn của người Thái, bếp lửa là trái tim. Khói bếp không chỉ sưởi ấm, mà còn là gia vị bí mật ướp vào từng thớ thịt, tạo nên hương vị đặc trưng của núi rừng.
          </p>
        </div>
      </motion.div>

      {/* Section 2: Nguyên liệu */}
      <motion.div 
        style={{ y: y2, opacity: opacity2 }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
      >
        <img 
          src="https://picsum.photos/seed/mackhen/1920/1080" 
          alt="Gia vị Tây Bắc" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-khoi-lam/60"></div>
        
        <div className="relative z-10 px-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xanh-rung uppercase tracking-[0.3em] text-sm font-semibold mb-6 block">Tinh hoa</span>
            <h2 className="font-serif text-4xl md:text-6xl text-kem font-light mb-8 leading-tight">
              Mắc khén & <br/><span className="italic font-medium">Hạt dổi</span>
            </h2>
            <p className="text-kem/80 text-lg font-light leading-relaxed mb-6">
              Không có mắc khén, thịt gác bếp chỉ là thịt khô. Hương vị cay nồng, tê nhẹ nơi đầu lưỡi của mắc khén, kết hợp cùng mùi thơm nồng nàn của hạt dổi rừng tạo nên bản giao hưởng gia vị độc nhất.
            </p>
            <p className="text-kem/60 text-base font-light leading-relaxed">
              Chúng tôi lặn lội vào tận những bản làng xa xôi nhất để thu mua gia vị từ người đồng bào, đảm bảo hương vị nguyên bản nhất.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="aspect-[3/4] rounded-full overflow-hidden border border-kem/10 p-2">
              <img src="https://lh3.googleusercontent.com/d/10XOdHf0kT1pw1wLd6Z8JW88rii-z2glk" alt="Hạt dổi" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Sứ mệnh */}
      <motion.div 
        style={{ y: y3, opacity: opacity3 }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-kem"
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#4B2E2B 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="text-xanh-rung uppercase tracking-[0.3em] text-sm font-semibold mb-6 block">Sứ mệnh</span>
          <h2 className="font-serif text-5xl md:text-7xl text-khoi-lam font-bold mb-8 leading-tight">
            Mang vị bản <br/><span className="italic font-light">xuống phố</span>
          </h2>
          <p className="text-khoi-lam/80 text-lg md:text-xl font-light leading-relaxed mb-12">
            Khói Lam không chỉ bán đặc sản. Chúng tôi bán một trải nghiệm văn hoá. Bằng việc ứng dụng công nghệ truy xuất nguồn gốc, chúng tôi minh bạch hoá quy trình thủ công, để bạn an tâm thưởng thức trọn vẹn tinh hoa núi rừng.
          </p>
          <div className="w-24 h-px bg-xanh-rung mx-auto"></div>
        </div>
      </motion.div>

    </div>
  );
}
