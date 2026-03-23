import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, Users } from 'lucide-react';

const combos = [
    {
        id: 'combo-met-nho-tien-loi',
        name: 'Combo Mẹt nhỏ tiện lợi',
        description:
            'Set gọn nhẹ, tiện lợi để thưởng thức nhiều vị đặc sản trong một lần mua.',
        includes: [
            'Thịt trâu gác bếp (Instant) - 250gr',
            'Heo bản gác bếp (Instant) - 250gr',
            'Lạp xưởng hun mía - 250gr',
            'Tặng kèm 1 gói chẩm chéo ướt / 1 gói chẩm chéo khô',
        ],
        price: 459000,
        badge: 'Tiện lợi',
    },
    {
        id: 'combo-gac-bep-sieu-tiet-kiem',
        name: 'Combo Gác Bếp Siêu Tiết Kiệm',
        description:
            'Set dành cho khách thích vị gác bếp truyền thống với mức giá tiết kiệm hơn khi mua lẻ.',
        includes: [
            '500gr thịt trâu gác bếp',
            '500gr heo bản gác bếp',
            'Tặng kèm 1 gói chẩm chéo ướt / 1 gói chẩm chéo khô',
        ],
        price: 699000,
        badge: 'Tiết kiệm',
    },
    {
        id: 'combo-tam-lap-vi',
        name: 'Combo Tam Lạp vị',
        description:
            'Bộ sưu tập 3 loại lạp xưởng đặc trưng, phù hợp cho người thích khám phá nhiều hương vị.',
        includes: [
            'Lạp xưởng gác bếp - 500gr',
            'Lạp xưởng hun mía - 500gr',
            'Lạp xưởng trứng muối - 500gr',
        ],
        price: 529000,
        badge: 'Đậm vị',
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
                        Combo gia đình
                    </h1>
                    <p className="text-khoi-lam/70 max-w-2xl mx-auto text-lg leading-relaxed">
                        Những set phối sẵn để bạn dễ chọn hơn, tiết kiệm hơn và thưởng thức trọn vị
                        đặc sản Tây Bắc.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {combos.map((combo) => (
                        <div
                            key={combo.id}
                            className="bg-white rounded-3xl border border-khoi-lam/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-khoi-lam/5">
                                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
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
                                    <div className="mb-6">
                                        <p className="text-sm text-khoi-lam/50 mb-1">Giá combo</p>
                                        <span className="text-2xl font-bold text-do-gach">
                      {combo.price.toLocaleString('vi-VN')}đ
                    </span>
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
                        Muốn tự chọn theo khẩu vị?
                    </h3>
                    <p className="text-khoi-lam/65 max-w-2xl mx-auto leading-relaxed mb-6">
                        Bạn có thể vào danh mục sản phẩm để chọn riêng từng món theo nhu cầu của gia
                        đình hoặc làm quà biếu.
                    </p>
                    <Link
                        to="/san-pham"
                        className="inline-flex items-center justify-center rounded-xl bg-khoi-lam text-white px-6 py-3 font-medium hover:bg-xanh-rung transition-colors"
                    >
                        Xem toàn bộ sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}