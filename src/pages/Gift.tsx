import { Link } from 'react-router-dom';
import { Gift as GiftIcon, ShieldCheck, Sparkles } from 'lucide-react';

const giftSets = [
    {
        id: 'gift-box-1',
        name: 'Set quà tặng hộp cứng 01',
        description:
            'Set quà tặng chỉn chu, phù hợp biếu người thân, đối tác hoặc khách quý.',
        items: [
            '500gr thịt trâu gác bếp',
            '500gr heo bản gác bếp',
            'Combo 3 hũ chấm',
        ],
        price: 899000,
        note: 'Hộp cứng sang trọng',
    },
    {
        id: 'gift-box-2',
        name: 'Set quà tặng hộp cứng 02',
        description:
            'Set thiên về thịt trâu gác bếp, phù hợp với người thích hương vị đậm đà đặc trưng.',
        items: [
            '1000gr thịt trâu gác bếp',
            'Combo 3 hũ chấm',
        ],
        price: 1000000,
        note: 'Đậm vị truyền thống',
    },
    {
        id: 'gift-box-3',
        name: 'Set quà tặng hộp cứng 03',
        description:
            'Lựa chọn hợp lý cho người yêu thích thịt heo bản gác bếp và các vị chấm ăn kèm.',
        items: [
            '1000gr heo bản gác bếp',
            'Combo 3 hũ chấm',
        ],
        price: 759000,
        note: 'Dễ biếu tặng',
    },
];

export default function Gift() {
    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
          <span className="text-vang-logo uppercase tracking-widest text-sm font-semibold mb-4 block">
            Quà tặng biếu
          </span>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6">
                        Hộp quà đậm vị Tây Bắc
                    </h1>
                    <p className="text-khoi-lam/70 max-w-2xl mx-auto text-lg leading-relaxed">
                        Những set quà được phối sẵn để bạn dễ dàng chọn một món quà mang bản sắc,
                        chỉn chu và đậm chất núi rừng.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {giftSets.map((giftSet) => (
                        <div
                            key={giftSet.id}
                            className="bg-white rounded-3xl border border-khoi-lam/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-khoi-lam/5">
                                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-vang-logo/15 text-khoi-lam">
                    <GiftIcon className="w-4 h-4" />
                      {giftSet.note}
                  </span>

                                    <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-khoi-lam/5 text-khoi-lam/70">
                    <Sparkles className="w-4 h-4" />
                    Premium
                  </span>
                                </div>

                                <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-3">
                                    {giftSet.name}
                                </h2>

                                <p className="text-khoi-lam/65 leading-relaxed text-sm">
                                    {giftSet.description}
                                </p>
                            </div>

                            <div className="p-8 flex-grow">
                                <h3 className="font-semibold text-khoi-lam mb-4">Bao gồm:</h3>
                                <ul className="space-y-3">
                                    {giftSet.items.map((item) => (
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
                                    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                                        <div>
                                            <p className="text-sm text-khoi-lam/50 mb-1">Giá hộp quà</p>
                                            <span className="text-2xl font-bold text-do-gach">
                        {giftSet.price.toLocaleString('vi-VN')}đ
                      </span>
                                        </div>

                                        <div className="inline-flex items-center gap-2 text-khoi-lam/55 text-sm">
                                            <ShieldCheck className="w-4 h-4" />
                                            Đóng gói cẩn thận
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
                                            className="flex-1 inline-flex items-center justify-center rounded-xl bg-vang-logo py-3 px-4 text-sm font-bold text-khoi-lam hover:bg-vang-logo/90 transition-colors"
                                        >
                                            Chọn hộp quà
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-white rounded-3xl border border-khoi-lam/5 p-8 md:p-10 text-center">
                    <h3 className="font-serif text-3xl font-bold text-khoi-lam mb-4">
                        Muốn tự chọn quà theo ngân sách?
                    </h3>
                    <p className="text-khoi-lam/65 max-w-2xl mx-auto leading-relaxed mb-6">
                        Bạn có thể chọn từng sản phẩm riêng lẻ để tự phối một set quà tặng phù hợp
                        với nhu cầu biếu tặng cá nhân, gia đình hoặc đối tác.
                    </p>
                    <Link
                        to="/san-pham"
                        className="inline-flex items-center justify-center rounded-xl bg-khoi-lam text-white px-6 py-3 font-medium hover:bg-xanh-rung transition-colors"
                    >
                        Chọn sản phẩm để biếu tặng
                    </Link>
                </div>
            </div>
        </div>
    );
}