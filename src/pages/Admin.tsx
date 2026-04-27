import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Tag,
    ShoppingCart,
    QrCode,
    Printer,
    BarChart3,
    Users,
    FileText,
    Plus,
    Edit,
    Trash2,
    Download,
    X,
    Activity,
    Gift,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import IoTDashboard from '../components/admin/IoTDashboard';
import AdminCombos from '../components/admin/AdminCombos';
import AdminGifts from '../components/admin/AdminGifts';

type WeightPriceMap = Record<string, number>;

const parseWeightPricesInput = (input: string): WeightPriceMap => {
    return input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .reduce((acc: WeightPriceMap, item) => {
            const [weight, price] = item.split(':').map((v) => v.trim());
            const priceNum = Number(price);

            if (weight && Number.isFinite(priceNum)) {
                acc[weight] = priceNum;
            }

            return acc;
        }, {});
};

const formatWeightPricesInput = (weightPrices: WeightPriceMap = {}) => {
    return Object.entries(weightPrices)
        .map(([weight, price]) => `${weight}:${price}`)
        .join(', ');
};

const getDefaultPriceFromWeights = (weights: string[], weightPrices: WeightPriceMap, fallback = 0) => {
    const firstWeight = weights[0];
    if (firstWeight && Number.isFinite(weightPrices[firstWeight])) {
        return Number(weightPrices[firstWeight]);
    }
    return Number(fallback || 0);
};

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    const generateProductId = (name: string) => {
        const slug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        return `${slug}-${Date.now().toString(36)}`;
    };

    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);

    const [qrBatchId, setQrBatchId] = useState('');
    const [generatedQr, setGeneratedQr] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const qrRef = useRef<SVGSVGElement>(null);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productForm, setProductForm] = useState({
        id: '',
        name: '',
        description: '',
        ingredients: '',
        storage: '',
        usage: '',
        price: 0,
        category: '',
        image: '',
        weights: '',
        stock: 0,
        weightPricesText: '',
    });
    const [isUploading, setIsUploading] = useState(false);

    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [couponForm, setCouponForm] = useState({ code: '', discount_percent: 0 });

    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<any>(null);
    const [isBatchDetailModalOpen, setIsBatchDetailModalOpen] = useState(false);
    const [selectedBatchDetail, setSelectedBatchDetail] = useState<any>(null);
    const [batchForm, setBatchForm] = useState<{
        id: string;
        product_id: string;
        production_date: string;
        certificate_url: string;
        production_log: { date: string; title: string; description: string; image_url?: string }[];
    }>({ id: '', product_id: '', production_date: '', certificate_url: '', production_log: [] });

    const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);
    const [customerOrders, setCustomerOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !['admin', 'seller', 'factory_manager'].includes(user.role)) {
            navigate('/');
            return;
        }

        if (user.role === 'factory_manager') {
            setActiveTab('iot');
        }

        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => setProducts(Array.isArray(data) ? data : []));

        fetch('/api/orders')
            .then((res) => res.json())
            .then((data) => setOrders(Array.isArray(data) ? data : []));

        fetch('/api/coupons')
            .then((res) => res.json())
            .then((data) => setCoupons(Array.isArray(data) ? data : []));

        fetch('/api/orders?action=customers')
            .then((res) => res.json())
            .then((data) => setCustomers(Array.isArray(data) ? data : []));

        fetch('/api/batches')
            .then((res) => res.json())
            .then((data) => setBatches(Array.isArray(data) ? data : []));

        fetch('/api/orders?action=analytics')
            .then((res) => res.json())
            .then(setAnalytics);
    };

    if (!user || !['admin', 'seller', 'factory_manager'].includes(user.role)) return null;

    const updateOrderStatus = async (id: number, status: string) => {
        let cancel_reason = null;

        if (status === 'cancelled') {
            cancel_reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
            if (cancel_reason === null) return;
        }

        await fetch(`/api/orders?action=status&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, cancel_reason }),
        });

        setOrders(orders.map((o: any) => (o.id === id ? { ...o, status, cancel_reason } : o)));
    };

    const toggleOrderDetails = async (orderId: number) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            setOrderItems([]);
        } else {
            setExpandedOrder(orderId);
            const res = await fetch(`/api/orders?action=items&id=${orderId}`);
            const data = await res.json();
            setOrderItems(Array.isArray(data) ? data : []);
        }
    };

    const exportOrdersToCSV = () => {
        const headers = ['Mã ĐH', 'Khách hàng', 'Email', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'];
        const csvContent = [
            headers.join(','),
            ...orders.map((o: any) =>
                [
                    o.id,
                    `"${o.user_name || 'Khách vãng lai'}"`,
                    o.email || o.user_email || '',
                    o.total,
                    o.status,
                    o.created_at,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;',
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'don_hang.csv';
        link.click();
    };

    const openProductModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                id: product.id || '',
                name: product.name || '',
                description: product.description || '',
                ingredients: product.ingredients || '',
                storage: product.storage || '',
                usage: product.usage || '',
                price: Number(product.price || 0),
                category: product.category || '',
                image: product.image || '',
                weights: Array.isArray(product.weights) ? product.weights.join(', ') : product.weights || '',
                stock: Number(product.stock || 0),
                weightPricesText: formatWeightPricesInput(product.weightPrices || {}),
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                id: '',
                name: '',
                description: '',
                ingredients: '',
                storage: '',
                usage: '',
                price: 0,
                category: '',
                image: '',
                weights: '',
                stock: 0,
                weightPricesText: '',
            });
        }

        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const weights = productForm.weights
            .split(',')
            .map((w) => w.trim())
            .filter(Boolean);

        const weightPrices = parseWeightPricesInput(productForm.weightPricesText);
        const defaultPrice = getDefaultPriceFromWeights(weights, weightPrices, productForm.price);

        const payload = {
            id: editingProduct ? productForm.id.trim() : generateProductId(productForm.name),
            name: productForm.name.trim(),
            description: productForm.description.trim(),
            ingredients: productForm.ingredients.trim(),
            storage: productForm.storage.trim(),
            usage: productForm.usage.trim(),
            price: defaultPrice,
            category: productForm.category.trim(),
            image: productForm.image.trim(),
            weights,
            stock: Number(productForm.stock || 0),
            weightPrices,
        };

        const method = editingProduct ? 'PUT' : 'POST';
        const url = editingProduct
            ? `/api/products?id=${encodeURIComponent(payload.id)}`
            : '/api/products';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setIsProductModalOpen(false);
            fetchData();
        } else {
            const data = await res.json().catch(() => null);
            alert(data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await res.json();

                if (data.success) {
                    fetchData();
                } else {
                    alert(
                        data.message ||
                        'Không thể xóa sản phẩm. Có thể sản phẩm đang nằm trong đơn hàng hoặc lô sản xuất.'
                    );
                }
            } catch (error) {
                alert('Lỗi kết nối khi xóa sản phẩm');
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                setProductForm((prev) => ({ ...prev, image: data.url }));
            } else {
                alert('Lỗi tải ảnh lên: ' + data.message);
            }
        } catch (error) {
            alert('Lỗi kết nối khi tải ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveCoupon = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(couponForm),
        });

        if (res.ok) {
            setIsCouponModalOpen(false);
            setCouponForm({ code: '', discount_percent: 0 });
            fetchData();
        } else {
            alert('Mã giảm giá đã tồn tại hoặc có lỗi xảy ra');
        }
    };

    const toggleCouponStatus = async (code: string, currentStatus: number) => {
        await fetch(`/api/coupons?code=${encodeURIComponent(code)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: currentStatus === 1 ? 0 : 1 }),
        });
        fetchData();
    };

    const toggleCustomerOrders = async (customerId: number) => {
        if (expandedCustomer === customerId) {
            setExpandedCustomer(null);
            setCustomerOrders([]);
        } else {
            setExpandedCustomer(customerId);
            const res = await fetch(`/api/orders?action=customer-orders&id=${customerId}`);
            const data = await res.json();
            setCustomerOrders(Array.isArray(data) ? data : []);
        }
    };

    const openBatchModal = (batch?: any) => {
        if (batch) {
            setEditingBatch(batch);
            let parsedLog = batch.production_log;

            if (typeof parsedLog === 'string') {
                try {
                    parsedLog = JSON.parse(parsedLog);
                } catch {
                    parsedLog = [];
                }
            }

            setBatchForm({
                id: batch.id,
                product_id: batch.product_id,
                production_date: batch.production_date,
                certificate_url: batch.certificate_url || '',
                production_log: parsedLog || [],
            });
        } else {
            setEditingBatch(null);
            setBatchForm({
                id: '',
                product_id: '',
                production_date: '',
                certificate_url: '',
                production_log: [],
            });
        }

        setIsBatchModalOpen(true);
    };

    const handleSaveBatch = async (e: React.FormEvent) => {
        e.preventDefault();

        const mockTempLog = [
            { time: '0h', temp: 25, humidity: 60 },
            { time: '12h', temp: 65, humidity: 45 },
            { time: '24h', temp: 70, humidity: 40 },
            { time: '36h', temp: 68, humidity: 38 },
            { time: '48h', temp: 72, humidity: 35 },
            { time: '60h', temp: 70, humidity: 30 },
        ];

        const payload = {
            ...batchForm,
            temperature_log: mockTempLog,
        };

        const method = editingBatch ? 'PUT' : 'POST';
        const url = editingBatch
            ? `/api/batches?id=${encodeURIComponent(batchForm.id)}`
            : '/api/batches';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setIsBatchModalOpen(false);
            setBatchForm({
                id: '',
                product_id: '',
                production_date: '',
                certificate_url: '',
                production_log: [],
            });
            setEditingBatch(null);
            fetchData();
        } else {
            alert('Có lỗi xảy ra khi lưu lô');
        }
    };

    const handleDeleteBatch = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa lô sản xuất này?')) {
            try {
                const res = await fetch(`/api/batches?id=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await res.json();

                if (data.success) {
                    fetchData();
                } else {
                    alert(data.message || 'Không thể xóa lô sản xuất.');
                }
            } catch (error) {
                alert('Lỗi kết nối khi xóa lô sản xuất');
            }
        }
    };

    const addBatchLog = () => {
        setBatchForm({
            ...batchForm,
            production_log: [
                ...batchForm.production_log,
                { date: '', title: '', description: '', image_url: '' },
            ],
        });
    };

    const updateBatchLog = (index: number, field: string, value: string) => {
        const newLog = [...batchForm.production_log];
        newLog[index] = { ...newLog[index], [field]: value };
        setBatchForm({ ...batchForm, production_log: newLog });
    };

    const removeBatchLog = (index: number) => {
        const newLog = [...batchForm.production_log];
        newLog.splice(index, 1);
        setBatchForm({ ...batchForm, production_log: newLog });
    };

    return (
        <div className="bg-kem min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-12">Quản trị hệ thống</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-khoi-lam/5 space-y-2">
                            {['admin', 'seller'].includes(user.role) && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('dashboard')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'dashboard'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <BarChart3 className="w-5 h-5" /> Báo cáo
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'products'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <Package className="w-5 h-5" /> Sản phẩm
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('combos')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'combos'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <Package className="w-5 h-5" /> Combos
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('gifts')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'gifts'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <Gift className="w-5 h-5" /> Quà tặng
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'orders'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <ShoppingCart className="w-5 h-5" /> Đơn hàng
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('coupons')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'coupons'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <Tag className="w-5 h-5" /> Mã giảm giá
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('customers')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'customers'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <Users className="w-5 h-5" /> Khách hàng
                                    </button>
                                </>
                            )}

                            {['admin', 'seller', 'factory_manager'].includes(user.role) && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('iot')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'iot'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <Activity className="w-5 h-5" /> Bảng điều khiển IoT
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('batches')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'batches'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <FileText className="w-5 h-5" /> Lô sản xuất
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('qrcode')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            activeTab === 'qrcode'
                                                ? 'bg-vang-logo/20 text-khoi-lam font-bold'
                                                : 'text-khoi-lam/70 hover:bg-khoi-lam/5'
                                        }`}
                                    >
                                        <QrCode className="w-5 h-5" /> Tạo mã QR
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-grow bg-white rounded-3xl p-8 shadow-sm border border-khoi-lam/5">
                        {activeTab === 'iot' && <IoTDashboard user={user} />}
                        {activeTab === 'combos' && <AdminCombos />}
                        {activeTab === 'gifts' && <AdminGifts />}

                        {activeTab === 'dashboard' && (
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-6">
                                    Báo cáo & Thống kê
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10">
                                        <p className="text-khoi-lam/60 text-sm mb-2">Tổng doanh thu</p>
                                        <p className="text-3xl font-bold text-khoi-lam">
                                            {analytics?.totalRevenue?.toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>

                                    <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10">
                                        <p className="text-khoi-lam/60 text-sm mb-2">Tổng đơn hàng</p>
                                        <p className="text-3xl font-bold text-khoi-lam">{analytics?.orderCount}</p>
                                    </div>

                                    <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10">
                                        <p className="text-khoi-lam/60 text-sm mb-2">Khách hàng</p>
                                        <p className="text-3xl font-bold text-khoi-lam">{customers.length}</p>
                                    </div>
                                </div>

                                <h3 className="font-bold text-khoi-lam mb-4">Sản phẩm bán chạy</h3>
                                <div className="h-64 w-full bg-kem/10 p-4 rounded-2xl border border-khoi-lam/5">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics?.topProducts || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="sold" fill="#F4CE6A" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam">
                                        Quản lý sản phẩm
                                    </h2>

                                    <button
                                        onClick={() => openProductModal()}
                                        className="bg-vang-logo text-khoi-lam px-4 py-2 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm sản phẩm
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                                            <th className="pb-4 font-medium">Sản phẩm</th>
                                            <th className="pb-4 font-medium">Danh mục</th>
                                            <th className="pb-4 font-medium">Giá theo phân loại</th>
                                            <th className="pb-4 font-medium">Tồn kho</th>
                                            <th className="pb-4 font-medium">Thao tác</th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-khoi-lam/5">
                                        {products.map((p: any) => (
                                            <tr key={p.id}>
                                                <td className="py-4 flex items-center gap-4">
                                                    <img
                                                        src={p.image}
                                                        alt={p.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <span className="font-medium text-khoi-lam">{p.name}</span>
                                                </td>

                                                <td className="py-4 text-khoi-lam/70">{p.category}</td>

                                                <td className="py-4 text-khoi-lam font-medium">
                                                    {p.weightPrices && Object.keys(p.weightPrices).length > 0 ? (
                                                        <div className="space-y-1">
                                                            {Object.entries(p.weightPrices).map(([weight, price]: any) => (
                                                                <div key={weight} className="text-sm">
                                                                    {weight}: {Number(price).toLocaleString('vi-VN')}đ
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        `${Number(p.price || 0).toLocaleString('vi-VN')}đ`
                                                    )}
                                                </td>

                                                <td className="py-4 text-khoi-lam/70">{p.stock || 0}</td>

                                                <td className="py-4">
                                                    <button
                                                        onClick={() => openProductModal(p)}
                                                        className="text-xanh-rung hover:underline mr-4"
                                                    >
                                                        <Edit className="w-4 h-4 inline" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteProduct(p.id)}
                                                        className="text-do-gach hover:underline"
                                                    >
                                                        <Trash2 className="w-4 h-4 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam">Quản lý đơn hàng</h2>
                                    <button
                                        onClick={exportOrdersToCSV}
                                        className="bg-khoi-lam/5 text-khoi-lam px-4 py-2 rounded-xl font-bold hover:bg-khoi-lam/10 transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Xuất báo cáo
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                                            <th className="pb-4 font-medium">Mã ĐH</th>
                                            <th className="pb-4 font-medium">Khách hàng</th>
                                            <th className="pb-4 font-medium">Tổng tiền</th>
                                            <th className="pb-4 font-medium">Trạng thái</th>
                                            <th className="pb-4 font-medium">Thao tác</th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-khoi-lam/5">
                                        {orders.map((o: any) => (
                                            <React.Fragment key={o.id}>
                                                <tr>
                                                    <td className="py-4 text-khoi-lam font-medium">#{o.id}</td>

                                                    <td className="py-4">
                                                        <p className="font-medium text-khoi-lam">
                                                            {o.user_name || 'Khách vãng lai'}
                                                        </p>
                                                        <p className="text-xs text-khoi-lam/60">{o.email || o.user_email}</p>
                                                    </td>

                                                    <td className="py-4 text-khoi-lam font-medium">
                                                        {o.total.toLocaleString('vi-VN')}đ
                                                    </td>

                                                    <td className="py-4">
                                                        <select
                                                            value={o.status}
                                                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                                            className={`px-3 py-1 rounded-full text-xs font-medium border-none focus:ring-0 ${
                                                                o.status === 'pending'
                                                                    ? 'bg-vang-logo/20 text-khoi-lam'
                                                                    : o.status === 'shipping'
                                                                        ? 'bg-blue-500/20 text-blue-700'
                                                                        : o.status === 'delivered' || o.status === 'completed'
                                                                            ? 'bg-xanh-rung/20 text-xanh-rung'
                                                                            : 'bg-do-gach/20 text-do-gach'
                                                            }`}
                                                        >
                                                            <option value="pending">Đang xử lý</option>
                                                            <option value="shipping">Đang giao hàng</option>
                                                            <option value="delivered">Đã giao</option>
                                                            <option value="cancelled">Đã huỷ</option>
                                                        </select>
                                                    </td>

                                                    <td className="py-4">
                                                        <button
                                                            onClick={() => toggleOrderDetails(o.id)}
                                                            className="text-khoi-lam hover:underline font-medium"
                                                        >
                                                            {expandedOrder === o.id ? 'Đóng' : 'Chi tiết'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {expandedOrder === o.id && (
                                                    <tr>
                                                        <td colSpan={5} className="pb-6">
                                                            <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10">
                                                                <h4 className="font-bold text-khoi-lam mb-4">
                                                                    Sản phẩm trong đơn hàng
                                                                </h4>

                                                                <div className="space-y-4">
                                                                    {orderItems.map((item: any) => (
                                                                        <div
                                                                            key={item.id}
                                                                            className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-khoi-lam/5"
                                                                        >
                                                                            <img
                                                                                src={item.product_image}
                                                                                alt={item.product_name}
                                                                                className="w-14 h-14 rounded-lg object-cover"
                                                                                referrerPolicy="no-referrer"
                                                                            />

                                                                            <div className="flex-grow">
                                                                                <p className="font-bold text-khoi-lam">
                                                                                    {item.product_name}
                                                                                </p>
                                                                                <p className="text-sm text-khoi-lam/60">
                                                                                    {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                                                                                </p>
                                                                            </div>

                                                                            <div className="font-bold text-khoi-lam text-lg">
                                                                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="mt-6 pt-4 border-t border-khoi-lam/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-khoi-lam/60 mb-1">Số điện thoại</p>
                                                                        <p className="font-medium text-khoi-lam">{o.phone}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-sm text-khoi-lam/60 mb-1">
                                                                            Địa chỉ giao hàng
                                                                        </p>
                                                                        <p className="font-medium text-khoi-lam">
                                                                            {o.shipping_address}
                                                                        </p>
                                                                    </div>

                                                                    {o.status === 'cancelled' && o.cancel_reason && (
                                                                        <div className="col-span-1 md:col-span-2 mt-2 p-3 bg-do-gach/10 rounded-xl border border-do-gach/20">
                                                                            <p className="text-sm text-do-gach/80 mb-1 font-medium">
                                                                                Lý do hủy đơn
                                                                            </p>
                                                                            <p className="text-do-gach">{o.cancel_reason}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'coupons' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam">Mã giảm giá</h2>
                                    <button
                                        onClick={() => setIsCouponModalOpen(true)}
                                        className="bg-vang-logo text-khoi-lam px-4 py-2 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm mã
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                                            <th className="pb-4 font-medium">Mã giảm giá</th>
                                            <th className="pb-4 font-medium">Phần trăm giảm</th>
                                            <th className="pb-4 font-medium">Trạng thái</th>
                                            <th className="pb-4 font-medium">Thao tác</th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-khoi-lam/5">
                                        {coupons.map((c: any) => (
                                            <tr key={c.code}>
                                                <td className="py-4 font-bold text-khoi-lam">{c.code}</td>
                                                <td className="py-4 text-khoi-lam/70">{c.discount_percent}%</td>
                                                <td className="py-4">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    c.is_active
                                        ? 'bg-xanh-rung/20 text-xanh-rung'
                                        : 'bg-do-gach/20 text-do-gach'
                                }`}
                            >
                              {c.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                            </span>
                                                </td>
                                                <td className="py-4">
                                                    <button
                                                        onClick={() => toggleCouponStatus(c.code, c.is_active)}
                                                        className="text-khoi-lam hover:underline font-medium text-sm"
                                                    >
                                                        {c.is_active ? 'Khóa' : 'Kích hoạt'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'customers' && (
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-6">
                                    Quản lý khách hàng
                                </h2>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                                            <th className="pb-4 font-medium">Khách hàng</th>
                                            <th className="pb-4 font-medium">Email</th>
                                            <th className="pb-4 font-medium">Số đơn</th>
                                            <th className="pb-4 font-medium">Tổng chi tiêu</th>
                                            <th className="pb-4 font-medium">Phân nhóm</th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-khoi-lam/5">
                                        {customers.map((c: any) => (
                                            <React.Fragment key={c.id}>
                                                <tr>
                                                    <td className="py-4 font-medium text-khoi-lam">{c.name}</td>
                                                    <td className="py-4 text-khoi-lam/70">{c.email}</td>
                                                    <td className="py-4 text-khoi-lam/70">{c.order_count}</td>
                                                    <td className="py-4 text-khoi-lam font-medium">
                                                        {(c.total_spent || 0).toLocaleString('vi-VN')}đ
                                                    </td>
                                                    <td className="py-4">
                              <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      c.total_spent > 1000000
                                          ? 'bg-vang-logo/20 text-khoi-lam'
                                          : 'bg-khoi-lam/10 text-khoi-lam/70'
                                  }`}
                              >
                                {c.total_spent > 1000000 ? 'VIP' : 'Thường'}
                              </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <button
                                                            onClick={() => toggleCustomerOrders(c.id)}
                                                            className="text-khoi-lam hover:underline font-medium text-sm"
                                                        >
                                                            {expandedCustomer === c.id ? 'Đóng' : 'Lịch sử'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {expandedCustomer === c.id && (
                                                    <tr>
                                                        <td colSpan={6} className="pb-6">
                                                            <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10">
                                                                <h4 className="font-bold text-khoi-lam mb-4">
                                                                    Lịch sử mua hàng
                                                                </h4>

                                                                {customerOrders.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        {customerOrders.map((o: any) => (
                                                                            <div
                                                                                key={o.id}
                                                                                className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-khoi-lam/5"
                                                                            >
                                                                                <div>
                                            <span className="font-bold text-khoi-lam mr-4">
                                              #{o.id}
                                            </span>
                                                                                    <span className="text-sm text-khoi-lam/60">
                                              {new Date(o.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                                                                </div>

                                                                                <div className="flex items-center gap-4">
                                            <span className="font-medium text-khoi-lam">
                                              {o.total.toLocaleString('vi-VN')}đ
                                            </span>
                                                                                    <span
                                                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                                            o.status === 'pending'
                                                                                                ? 'bg-vang-logo/20 text-khoi-lam'
                                                                                                : o.status === 'shipping'
                                                                                                    ? 'bg-blue-500/20 text-blue-700'
                                                                                                    : o.status === 'delivered' ||
                                                                                                    o.status === 'completed'
                                                                                                        ? 'bg-xanh-rung/20 text-xanh-rung'
                                                                                                        : 'bg-do-gach/20 text-do-gach'
                                                                                        }`}
                                                                                    >
                                              {o.status === 'pending'
                                                  ? 'Đang xử lý'
                                                  : o.status === 'shipping'
                                                      ? 'Đang giao'
                                                      : o.status === 'delivered' ||
                                                      o.status === 'completed'
                                                          ? 'Đã giao'
                                                          : 'Đã huỷ'}
                                            </span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-khoi-lam/60">Chưa có đơn hàng nào.</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'batches' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam">
                                        Quản lý lô sản xuất (Batch)
                                    </h2>

                                    <button
                                        onClick={() => openBatchModal()}
                                        className="bg-vang-logo text-khoi-lam px-4 py-2 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Tạo lô mới
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                        <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                                            <th className="pb-4 font-medium">Mã lô</th>
                                            <th className="pb-4 font-medium">Sản phẩm</th>
                                            <th className="pb-4 font-medium">Ngày SX</th>
                                            <th className="pb-4 font-medium">Kiểm định</th>
                                            <th className="pb-4 font-medium text-right">Thao tác</th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-khoi-lam/5">
                                        {batches.map((b: any) => (
                                            <tr key={b.id}>
                                                <td className="py-4 font-bold text-khoi-lam">{b.id}</td>
                                                <td className="py-4 text-khoi-lam/70">{b.product_name}</td>
                                                <td className="py-4 text-khoi-lam/70">{b.production_date}</td>
                                                <td className="py-4 text-xanh-rung font-medium">{b.certificate_url}</td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            let parsedLog = b.production_log;

                                                            if (typeof parsedLog === 'string') {
                                                                try {
                                                                    parsedLog = JSON.parse(parsedLog);
                                                                } catch {
                                                                    parsedLog = [];
                                                                }
                                                            }

                                                            setSelectedBatchDetail({ ...b, production_log: parsedLog });
                                                            setIsBatchDetailModalOpen(true);
                                                        }}
                                                        className="text-vang-logo hover:underline font-medium mr-4"
                                                    >
                                                        Xem chi tiết
                                                    </button>

                                                    <button
                                                        onClick={() => openBatchModal(b)}
                                                        className="text-xanh-rung hover:underline mr-4"
                                                    >
                                                        <Edit className="w-4 h-4 inline" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteBatch(b.id)}
                                                        className="text-do-gach hover:underline"
                                                    >
                                                        <Trash2 className="w-4 h-4 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'qrcode' && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="font-serif text-2xl font-bold text-khoi-lam">
                                        Tạo mã QR truy xuất
                                    </h2>
                                    <p className="text-khoi-lam/70 text-sm mt-1">
                                        Nhập mã lô để tạo mã QR dán lên bao bì sản phẩm.
                                    </p>
                                </div>

                                <div className="max-w-md space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-khoi-lam mb-2">
                                            Mã lô sản xuất
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={qrBatchId}
                                                onChange={(e) => setQrBatchId(e.target.value)}
                                                className="flex-grow px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                            >
                                                <option value="">Chọn mã lô...</option>
                                                {batches.map((b: any) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.id} - {b.product_name}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => setGeneratedQr(qrBatchId)}
                                                disabled={!qrBatchId.trim()}
                                                className="bg-khoi-lam text-kem px-6 py-2 rounded-xl hover:bg-khoi-lam/90 transition-colors disabled:opacity-50"
                                            >
                                                Tạo mã
                                            </button>
                                        </div>
                                    </div>

                                    {generatedQr && (
                                        <div className="bg-kem/30 p-8 rounded-2xl border border-khoi-lam/10 flex flex-col items-center justify-center gap-6">
                                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                                <QRCodeSVG
                                                    value={generatedQr}
                                                    size={200}
                                                    level="H"
                                                    includeMargin
                                                    ref={qrRef}
                                                />
                                            </div>

                                            <div className="text-center">
                                                <p className="font-bold text-khoi-lam text-lg">{generatedQr}</p>
                                                <p className="text-sm text-khoi-lam/60">Khói Lam - Đặc sản Tây Bắc</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const svg = qrRef.current;
                                                    if (!svg) return;

                                                    const svgData = new XMLSerializer().serializeToString(svg);
                                                    const canvas = document.createElement('canvas');
                                                    const ctx = canvas.getContext('2d');
                                                    const img = new Image();

                                                    img.onload = () => {
                                                        canvas.width = img.width;
                                                        canvas.height = img.height + 60;

                                                        if (ctx) {
                                                            ctx.fillStyle = 'white';
                                                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                            ctx.drawImage(img, 0, 0);
                                                            ctx.fillStyle = 'black';
                                                            ctx.font = 'bold 20px sans-serif';
                                                            ctx.textAlign = 'center';
                                                            ctx.fillText(generatedQr, canvas.width / 2, img.height + 25);
                                                            ctx.font = '14px sans-serif';
                                                            ctx.fillText(
                                                                'Khói Lam - Đặc sản Tây Bắc',
                                                                canvas.width / 2,
                                                                img.height + 45
                                                            );

                                                            const printWindow = window.open('', '_blank');
                                                            if (printWindow) {
                                                                printWindow.document.write(`
                                  <html>
                                    <head><title>In mã QR</title></head>
                                    <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
                                      <img src="${canvas.toDataURL('image/png')}" style="max-width:100%;" onload="window.print();window.close()" />
                                    </body>
                                  </html>
                                `);
                                                                printWindow.document.close();
                                                            }
                                                        }
                                                    };

                                                    img.src =
                                                        'data:image/svg+xml;base64,' +
                                                        btoa(unescape(encodeURIComponent(svgData)));
                                                }}
                                                className="flex items-center gap-2 bg-vang-logo text-khoi-lam px-6 py-3 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors"
                                            >
                                                <Printer className="w-5 h-5" /> In mã QR
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-2xl font-bold text-khoi-lam">
                                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                            </h3>
                            <button
                                onClick={() => setIsProductModalOpen(false)}
                                className="text-khoi-lam/60 hover:text-khoi-lam"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Tên sản phẩm
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Danh mục
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Tồn kho
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) =>
                                            setProductForm({ ...productForm, stock: Number(e.target.value) })
                                        }
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Giá fallback
                                    </label>
                                    <input
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) =>
                                            setProductForm({ ...productForm, price: Number(e.target.value) })
                                        }
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Hình ảnh sản phẩm
                                </label>

                                <div className="flex gap-4 items-start">
                                    <div className="flex-grow space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vang-logo/20 file:text-khoi-lam hover:file:bg-vang-logo/30"
                                        />

                                        <div className="flex items-center gap-2">
                      <span className="text-xs text-khoi-lam/60 whitespace-nowrap">
                        Hoặc nhập URL:
                      </span>
                                            <input
                                                type="text"
                                                value={productForm.image}
                                                onChange={(e) =>
                                                    setProductForm({ ...productForm, image: e.target.value })
                                                }
                                                className="flex-grow px-3 py-1 text-sm border border-khoi-lam/20 rounded-lg focus:outline-none focus:border-vang-logo"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    {productForm.image && (
                                        <img
                                            src={productForm.image}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-xl object-cover border border-khoi-lam/10"
                                            referrerPolicy="no-referrer"
                                        />
                                    )}
                                </div>

                                {isUploading && (
                                    <p className="text-sm text-xanh-rung mt-2 animate-pulse">
                                        Đang tải ảnh lên Google Drive...
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Các mức trọng lượng
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={productForm.weights}
                                    onChange={(e) => setProductForm({ ...productForm, weights: e.target.value })}
                                    placeholder="VD: 250g, 500g, 1kg"
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Giá theo trọng lượng
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={productForm.weightPricesText}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, weightPricesText: e.target.value })
                                    }
                                    placeholder="VD: 250g:229000, 500g:459000, 1kg:900000"
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                                <p className="text-xs text-khoi-lam/60 mt-1">
                                    Định dạng: trọng_lượng:giá, cách nhau bằng dấu phẩy
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">Mô tả</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={productForm.description}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, description: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Thành phần
                                </label>
                                <textarea
                                    rows={3}
                                    value={productForm.ingredients}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, ingredients: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Bảo quản
                                </label>
                                <textarea
                                    rows={3}
                                    value={productForm.storage}
                                    onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Hướng dẫn sử dụng
                                </label>
                                <textarea
                                    rows={3}
                                    value={productForm.usage}
                                    onChange={(e) => setProductForm({ ...productForm, usage: e.target.value })}
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-vang-logo text-khoi-lam py-3 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors"
                            >
                                Lưu sản phẩm
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isCouponModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-2xl font-bold text-khoi-lam">
                                Thêm mã giảm giá
                            </h3>
                            <button
                                onClick={() => setIsCouponModalOpen(false)}
                                className="text-khoi-lam/60 hover:text-khoi-lam"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCoupon} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Mã giảm giá (VD: TET2026)
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={couponForm.code}
                                    onChange={(e) =>
                                        setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                                    }
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam mb-1">
                                    Phần trăm giảm (%)
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={couponForm.discount_percent}
                                    onChange={(e) =>
                                        setCouponForm({
                                            ...couponForm,
                                            discount_percent: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-vang-logo text-khoi-lam py-3 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors"
                            >
                                Thêm mã
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isBatchModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-2xl font-bold text-khoi-lam">
                                {editingBatch ? 'Sửa lô sản xuất' : 'Tạo lô sản xuất mới'}
                            </h3>
                            <button
                                onClick={() => setIsBatchModalOpen(false)}
                                className="text-khoi-lam/60 hover:text-khoi-lam"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBatch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Mã lô (VD: KL-TRB-2026-02)
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={batchForm.id}
                                        disabled={!!editingBatch}
                                        onChange={(e) => setBatchForm({ ...batchForm, id: e.target.value })}
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Sản phẩm
                                    </label>
                                    <select
                                        required
                                        value={batchForm.product_id}
                                        onChange={(e) => setBatchForm({ ...batchForm, product_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    >
                                        <option value="">Chọn sản phẩm...</option>
                                        {products.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        Ngày sản xuất
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={batchForm.production_date}
                                        onChange={(e) =>
                                            setBatchForm({ ...batchForm, production_date: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam mb-1">
                                        URL Giấy kiểm định (Tùy chọn)
                                    </label>
                                    <input
                                        type="text"
                                        value={batchForm.certificate_url}
                                        onChange={(e) =>
                                            setBatchForm({ ...batchForm, certificate_url: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-khoi-lam/20 rounded-xl focus:outline-none focus:border-vang-logo"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-khoi-lam">
                                        Nhật ký sản xuất (Truy xuất nguồn gốc)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addBatchLog}
                                        className="text-sm bg-khoi-lam/5 text-khoi-lam px-3 py-1 rounded-lg hover:bg-khoi-lam/10 font-medium"
                                    >
                                        + Thêm bước
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {batchForm.production_log.map((log, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 items-start bg-kem/30 p-3 rounded-xl border border-khoi-lam/10"
                                        >
                                            <div className="flex-grow space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Ngày (VD: 12/01/2026)"
                                                        value={log.date}
                                                        onChange={(e) => updateBatchLog(index, 'date', e.target.value)}
                                                        className="w-1/3 px-3 py-1.5 text-sm border border-khoi-lam/20 rounded-lg focus:outline-none focus:border-vang-logo"
                                                    />
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Tiêu đề (VD: Nhập nguyên liệu)"
                                                        value={log.title}
                                                        onChange={(e) => updateBatchLog(index, 'title', e.target.value)}
                                                        className="w-2/3 px-3 py-1.5 text-sm border border-khoi-lam/20 rounded-lg focus:outline-none focus:border-vang-logo"
                                                    />
                                                </div>

                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Mô tả chi tiết..."
                                                    value={log.description}
                                                    onChange={(e) => updateBatchLog(index, 'description', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm border border-khoi-lam/20 rounded-lg focus:outline-none focus:border-vang-logo"
                                                />

                                                <input
                                                    type="text"
                                                    placeholder="URL Hình ảnh minh họa (Tùy chọn)"
                                                    value={log.image_url || ''}
                                                    onChange={(e) => updateBatchLog(index, 'image_url', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm border border-khoi-lam/20 rounded-lg focus:outline-none focus:border-vang-logo"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeBatchLog(index)}
                                                className="p-2 text-do-gach hover:bg-do-gach/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {batchForm.production_log.length === 0 && (
                                        <p className="text-sm text-khoi-lam/60 italic text-center py-4">
                                            Chưa có nhật ký nào. Bấm "+ Thêm bước" để thêm.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-vang-logo text-khoi-lam py-3 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors mt-6"
                            >
                                Tạo lô
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isBatchDetailModalOpen && selectedBatchDetail && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-2xl font-bold text-khoi-lam">
                                Chi tiết lô: {selectedBatchDetail.id}
                            </h3>
                            <button
                                onClick={() => setIsBatchDetailModalOpen(false)}
                                className="text-khoi-lam/60 hover:text-khoi-lam"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-kem/30 p-4 rounded-xl border border-khoi-lam/10">
                                    <p className="text-sm text-khoi-lam/60 mb-1">Sản phẩm</p>
                                    <p className="font-bold text-khoi-lam">{selectedBatchDetail.product_name}</p>
                                </div>

                                <div className="bg-kem/30 p-4 rounded-xl border border-khoi-lam/10">
                                    <p className="text-sm text-khoi-lam/60 mb-1">Ngày sản xuất</p>
                                    <p className="font-bold text-khoi-lam">
                                        {selectedBatchDetail.production_date}
                                    </p>
                                </div>

                                <div className="bg-kem/30 p-4 rounded-xl border border-khoi-lam/10">
                                    <p className="text-sm text-khoi-lam/60 mb-1">Giấy kiểm định</p>
                                    <p className="font-bold text-xanh-rung">
                                        {selectedBatchDetail.certificate_url || 'Chưa có'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-khoi-lam mb-4">Nhật ký sản xuất</h4>
                                {selectedBatchDetail.production_log &&
                                selectedBatchDetail.production_log.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedBatchDetail.production_log.map((log: any, index: number) => (
                                            <div
                                                key={index}
                                                className="bg-kem/30 p-4 rounded-xl border border-khoi-lam/10"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-bold text-khoi-lam">{log.title}</h5>
                                                    <span className="text-sm text-khoi-lam/60">{log.date}</span>
                                                </div>

                                                <p className="text-sm text-khoi-lam/80">{log.description}</p>

                                                {log.image_url && (
                                                    <img
                                                        src={log.image_url}
                                                        alt={log.title}
                                                        className="mt-3 rounded-lg max-h-32 object-cover"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-khoi-lam/60 italic">Chưa có nhật ký sản xuất.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}