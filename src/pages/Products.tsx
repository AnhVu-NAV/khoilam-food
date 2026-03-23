import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ITEMS_PER_PAGE = 9;

export default function Products() {
    const location = useLocation();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [activeWeight, setActiveWeight] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const categories = ['Tất cả', 'Thịt gác bếp', 'Lạp xưởng', 'Cá gác bếp', 'Gia vị'];
    const weights = ['250g', '500g', '1kg'];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryFromUrl = params.get('category');

        if (categoryFromUrl) {
            setActiveCategory(categoryFromUrl);
        } else {
            setActiveCategory('Tất cả');
        }
    }, [location.search]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                const res = await fetch('/api/products', {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                console.log('PRODUCTS /api/products =>', data);

                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error('Expected array of products, got:', data);
                    setProducts([]);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, sortBy, activeWeight]);

    let filteredProducts = products;

    if (activeCategory !== 'Tất cả') {
        filteredProducts = filteredProducts.filter((p) => p.category === activeCategory);
    }

    if (searchQuery) {
        filteredProducts = filteredProducts.filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (activeWeight) {
        filteredProducts = filteredProducts.filter((p) => p.weights.includes(activeWeight));
    }

    filteredProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
    });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6"
                    >
                        Sản phẩm
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-khoi-lam/70 max-w-2xl mx-auto text-lg"
                    >
                        Khám phá hương vị nguyên bản của núi rừng Tây Bắc qua từng thớ thịt được hun khói thủ công.
                    </motion.p>
                </div>

                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-khoi-lam/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vang-logo/50 shadow-sm text-khoi-lam placeholder:text-khoi-lam/40 transition-shadow"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-khoi-lam/40 w-5 h-5" />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
                            <div className="flex items-center gap-2 mb-6 text-khoi-lam font-semibold uppercase tracking-wider text-sm border-b border-khoi-lam/10 pb-4">
                                <Filter className="w-4 h-4" />
                                <span>Danh mục</span>
                            </div>

                            <ul className="space-y-1.5">
                                {categories.map((category) => (
                                    <li key={category}>
                                        <button
                                            onClick={() => setActiveCategory(category)}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                                activeCategory === category
                                                    ? 'bg-khoi-lam text-kem font-medium shadow-md'
                                                    : 'text-khoi-lam/70 hover:bg-khoi-lam/5 hover:text-khoi-lam'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 pt-6 border-t border-khoi-lam/10">
                                <div className="flex items-center gap-2 mb-4 text-khoi-lam font-semibold uppercase tracking-wider text-sm">
                                    <span>Trọng lượng</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {weights.map((weight) => (
                                        <button
                                            key={weight}
                                            onClick={() => setActiveWeight(activeWeight === weight ? null : weight)}
                                            className={`px-4 py-2 border rounded-xl text-sm transition-all duration-200 ${
                                                activeWeight === weight
                                                    ? 'border-khoi-lam bg-khoi-lam text-kem shadow-md'
                                                    : 'border-khoi-lam/20 text-khoi-lam/70 hover:border-khoi-lam/50 hover:text-khoi-lam'
                                            }`}
                                        >
                                            {weight}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-khoi-lam/5">
              <span className="text-khoi-lam/60 text-sm font-medium px-2">
                Hiển thị <strong className="text-khoi-lam">{paginatedProducts.length}</strong> / {filteredProducts.length} sản phẩm
              </span>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <ArrowUpDown className="w-4 h-4 text-khoi-lam/50" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent border-none rounded-lg px-2 py-2 text-sm text-khoi-lam font-medium focus:outline-none cursor-pointer hover:bg-khoi-lam/5 transition-colors w-full sm:w-auto"
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="price-asc">Giá: Thấp đến cao</option>
                                    <option value="price-desc">Giá: Cao đến thấp</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="w-10 h-10 border-4 border-khoi-lam/20 border-t-khoi-lam rounded-full animate-spin"></div>
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            <>
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {paginatedProducts.map((product) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                                key={product.id}
                                            >
                                                <Link
                                                    to={`/san-pham/${product.id}`}
                                                    className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-khoi-lam/5 h-full"
                                                >
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
                                <span className="bg-white text-do-gach px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                                  Hết hàng
                                </span>
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
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>

                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-xl border border-khoi-lam/10 text-khoi-lam hover:bg-khoi-lam/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Trang trước"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                                                        currentPage === page
                                                            ? 'bg-khoi-lam text-kem shadow-md'
                                                            : 'text-khoi-lam hover:bg-khoi-lam/5'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-xl border border-khoi-lam/10 text-khoi-lam hover:bg-khoi-lam/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Trang tiếp theo"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-khoi-lam/5">
                                <p className="text-khoi-lam/60 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                                <button
                                    onClick={() => {
                                        setActiveCategory('Tất cả');
                                        setSearchQuery('');
                                        setActiveWeight(null);
                                    }}
                                    className="mt-4 text-vang-logo font-medium hover:underline"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}