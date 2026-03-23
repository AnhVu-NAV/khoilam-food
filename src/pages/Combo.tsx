import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, Users } from 'lucide-react';

const combos = [
    {
        id: 'combo-gia-dinh-1',
        name: 'Combo Gác Bếp Sum Vầy',
        description:
            'Set phù hợp cho gia đình 3-5 người, kết hợp thịt gác bếp và gia vị chấm chuẩn vị Tây Bắc.',
        includes: [
            'Thịt Trâu Gác Bếp 500g',
            'Lạp Xưởng Gác Bếp 500g',
            'Gia Vị Chẩm Chéo 50g',
        ],
        originalPrice: 709000,
        salePrice: 649000,
        badge: 'Tiết kiệm 60.000đ',
    },
    {
        id: 'combo-gia-dinh-2',
        name: 'Combo Bếp Lửa Tây Bắc',
        description:
            'Combo đậm vị bản dành cho bữa ăn gia đình ấm cúng hoặc tiếp khách cuối tuần.',
        includes: [
            'Thịt Lợn Bản Gác Bếp 500g',
            'Cá Trắm Đen Gác Bếp 500g',
            'Tương Ớt Mường Khương 250ml',
        ],
        originalPrice: 594000,
        salePrice: 549000,
        badge: 'Ưa chuộng',
    },
    {
        id: 'combo-gia-dinh-3',
        name: 'Combo Thưởng Thức Trọn Vị',
        description:
            'Một set đầy đủ cho người thích trải nghiệm nhiều hương vị đặc sản Tây Bắc trong một lần mua.',
        includes: [
            'Thịt Trâu Gác Bếp 250g',
            'Lạp Xưởng Hun Mía 500g',
            'Gia Vị Chẩm Chéo 50g',
            'Tương Ớt Mường Khương 250ml',
        ],
        originalPrice: 734000,
        salePrice: 679000,
        badge: 'Bán chạy',
    },
];

export default function Combo() {
    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
          <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-4 block">
            Family Combo
          </span>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6">
                        Combo cho gia đình
                    </h1>
                    <p className="text-khoi-lam/70 max-w-2xl mx-auto text-lg leading-relaxed">
                        Những set sản phẩm được phối sẵn để giúp bạn thưởng thức đặc sản Tây Bắc
                        tiện hơn, tiết kiệm hơn và trọn vị hơn.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {combos.map((combo) => (
                        <div
                            key={combo.id}
                            className="bg-white rounded-3xl border border-khoi-lam/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-khoi-lam/5">
                                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-vang-logo/15 text-khoi-lam">
                    <Tag className="w-4 h-4" />
                      {combo.badge}
                  </span>

                                    <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-khoi-lam/5 text-khoi-lam/70">
                    <Users className="w-4 h-4" />
                    Family set
                  </span>
                                </div>

                                <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-3">
                                    {combo.name}
                                </h2>

                                <p className="text-khoi-lam/65 leading-relaxed text-sm">
                                    {combo.description}
                                </p>
                            </div>

                            <div className="p-8 flex-grow">
                                <h3 className="font-semibold text-khoi-lam mb-4">Bao gồm:</h3>
                                <ul className="space-y-3">
                                    {combo.includes.map((item) => (
                                        <li
                                            key={item}
                                            className="text-sm text-khoi-lam/70 flex items-start gap-3"
                                        >
                                            <span className="mt-1.5 w-2 h-2 rounded-full bg-vang-logo shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 pt-0">
                                <div className="border-t border-khoi-lam/10 pt-6">
                                    <div className="flex items-end justify-between gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-khoi-lam/50 mb-1">Giá combo</p>
                                            <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-2xl font-bold text-do-gach">
                          {combo.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                                                <span className="text-sm line-through text-khoi-lam/40">
                          {combo.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            to="/san-pham"
                                            className="flex-1 inline-flex items-center justify-center rounded-xl border border-khoi-lam/10 py-3 px-4 text-sm font-medium text-khoi-lam hover:bg-khoi-lam/5 transition-colors"
                                        >
                                            Xem sản phẩm
                                        </Link>

                                        <button
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-vang-logo py-3 px-4 text-sm font-bold text-khoi-lam hover:bg-vang-logo/90 transition-colors"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            Đặt combo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-white rounded-3xl border border-khoi-lam/5 p-8 md:p-10 text-center">
                    <h3 className="font-serif text-3xl font-bold text-khoi-lam mb-4">
                        Muốn tự phối combo riêng?
                    </h3>
                    <p className="text-khoi-lam/65 max-w-2xl mx-auto leading-relaxed mb-6">
                        Bạn có thể chọn từng sản phẩm theo nhu cầu và tạo set thưởng thức phù hợp
                        cho gia đình, biếu tặng hoặc mang đi xa.
                    </p>
                    <Link
                        to="/san-pham"
                        className="inline-flex items-center justify-center rounded-xl bg-khoi-lam text-white px-6 py-3 font-medium hover:bg-xanh-rung transition-colors"
                    >
                        Tự chọn sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}