import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminGifts() {
    const generateId = (name: string) => {
        const slug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        return `gift-${slug}-${Date.now().toString(36)}`;
    };
    const [gifts, setGifts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [giftForm, setGiftForm] = useState({
        id: '',
        name: '',
        description: '',
        price: 0,
        badge: '',
        image: '',
        items: [] as any[],
    });

    useEffect(() => {
        fetchData();
        fetchProducts();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/gifts');
        const data = await res.json();
        setGifts(Array.isArray(data) ? data : []);
    };

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
    };

    const openModal = (gift: any = null) => {
        if (gift) {
            setEditingGift(gift);
            setGiftForm({
                id: gift.id || '',
                name: gift.name || '',
                description: gift.description || '',
                price: Number(gift.price || 0),
                badge: gift.badge || '',
                image: gift.image || '',
                items: Array.isArray(gift.items) ? gift.items : [],
            });
        } else {
            setEditingGift(null);
            setGiftForm({
                id: '',
                name: '',
                description: '',
                price: 0,
                badge: '',
                image: '',
                items: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = editingGift ? giftForm.id : generateId(giftForm.name);
        const payload = { ...giftForm, id };
        const method = editingGift ? 'PUT' : 'POST';
        const url = editingGift
            ? `/api/gifts?id=${encodeURIComponent(id)}`
            : '/api/gifts';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchData();
        } else {
            const data = await res.json().catch(() => null);
            alert(data?.message || 'Có lỗi xảy ra khi lưu quà tặng');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa quà tặng này?')) {
            try {
                const res = await fetch(`/api/gifts?id=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });
                if (!res.ok) throw new Error('Network response error');
                const data = await res.json();
                if (data.success) {
                    fetchData();
                } else {
                    alert(data.message || 'Không thể xóa quà tặng.');
                }
            } catch (error) {
                alert('Lỗi kết nối khi xóa quà tặng');
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
                setGiftForm((prev) => ({ ...prev, image: data.url }));
            } else {
                alert('Lỗi tải ảnh lên: ' + data.message);
            }
        } catch (error) {
            alert('Lỗi kết nối khi tải ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const addItem = () => {
        setGiftForm({
            ...giftForm,
            items: [...giftForm.items, { product_id: '', weight: '', quantity: 1, label: '' }],
        });
    };

    const updateItem = (index: number, updates: Record<string, any>) => {
        setGiftForm(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], ...updates };
            return { ...prev, items: newItems };
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...giftForm.items];
        newItems.splice(index, 1);
        setGiftForm({ ...giftForm, items: newItems });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-khoi-lam">Quản lý Quà Tặng</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-vang-logo text-khoi-lam px-4 py-2 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Thêm Quà Tặng
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                        <th className="pb-4 font-medium">Quà Tặng</th>
                        <th className="pb-4 font-medium">Giá</th>
                        <th className="pb-4 font-medium">Badge</th>
                        <th className="pb-4 font-medium">Sản phẩm bao gồm</th>
                        <th className="pb-4 font-medium">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-khoi-lam/5">
                    {gifts.map((c) => (
                        <tr key={c.id}>
                            <td className="py-4 flex items-center gap-4">
                                {c.image && (
                                    <img src={c.image} alt={c.name} className="w-12 h-12 rounded-lg object-cover" />
                                )}
                                <div>
                                    <span className="font-medium text-khoi-lam block">{c.name}</span>
                                    <span className="text-xs text-khoi-lam/60">{c.id}</span>
                                </div>
                            </td>
                            <td className="py-4 text-khoi-lam font-medium">
                                {Number(c.price).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="py-4 text-khoi-lam/70">{c.badge}</td>
                            <td className="py-4 text-xs text-khoi-lam/70">
                                <ul className="list-disc pl-4 space-y-1">
                                    {(c.items || []).map((item: any, idx: number) => (
                                        <li key={idx}>
                                            {item.label || item.product_id} x{item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className="py-4">
                                <button onClick={() => openModal(c)} className="text-xanh-rung hover:underline mr-4">
                                    <Edit className="w-4 h-4 inline" />
                                </button>
                                <button onClick={() => handleDelete(c.id)} className="text-do-gach hover:underline">
                                    <Trash2 className="w-4 h-4 inline" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="font-serif text-2xl font-bold text-khoi-lam mb-6">
                            {editingGift ? 'Chỉnh sửa Quà Tặng' : 'Thêm Quà Tặng mới'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Tên Quà Tặng</label>
                                <input
                                    type="text"
                                    required
                                    value={giftForm.name}
                                    onChange={(e) => setGiftForm({ ...giftForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Mô tả</label>
                                <textarea
                                    value={giftForm.description}
                                    onChange={(e) => setGiftForm({ ...giftForm, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Giá Quà Tặng</label>
                                    <input
                                        type="number"
                                        required
                                        value={giftForm.price}
                                        onChange={(e) => setGiftForm({ ...giftForm, price: Number(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Badge</label>
                                    <input
                                        type="text"
                                        value={giftForm.badge}
                                        onChange={(e) => setGiftForm({ ...giftForm, badge: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                        placeholder="Ví dụ: Tiết kiệm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Ảnh Quà Tặng</label>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-4">
                                        {giftForm.image && (
                                            <img src={giftForm.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vang-logo/20 file:text-khoi-lam hover:file:bg-vang-logo/30"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Hoặc dán Link ảnh (URL) vào đây"
                                        value={giftForm.image}
                                        onChange={(e) => setGiftForm({ ...giftForm, image: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Hộp quà bao gồm những gì?</label>
                                <div className="space-y-3 mb-3">
                                    {giftForm.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="flex-1">
                                                <select
                                                    value={item.product_id || ''}
                                                    onChange={(e) => {
                                                        updateItem(idx, { product_id: e.target.value, weight: '' });
                                                    }}
                                                    className="w-full px-3 py-2 text-sm rounded bg-kem/30 border border-khoi-lam/10"
                                                >
                                                    <option value="">-- Chọn sản phẩm / Khác --</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                {item.product_id && (() => {
                                                    const selectedProduct = products.find(p => p.id === item.product_id);
                                                    const weightsStr = selectedProduct?.weights || '';
                                                    const weights = (Array.isArray(weightsStr) ? weightsStr : weightsStr.split(',')).map((w: string) => w.trim()).filter(Boolean);
                                                    if (weights.length > 0) {
                                                        return (
                                                            <select
                                                                value={item.weight || ''}
                                                                onChange={(e) => updateItem(idx, { weight: e.target.value })}
                                                                className="w-full mt-2 px-3 py-2 text-sm rounded bg-kem/30 border border-khoi-lam/10"
                                                            >
                                                                <option value="">-- Chọn phân loại (không bắt buộc) --</option>
                                                                {weights.map((w: string) => (
                                                                    <option key={w} value={w}>{w}</option>
                                                                ))}
                                                            </select>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                                <input
                                                    type="text"
                                                    placeholder="Nhãn hiển thị (ví dụ: 500gr thịt trâu)"
                                                    value={item.label}
                                                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                                                    className="w-full mt-2 px-3 py-2 text-sm rounded bg-kem/30 border border-khoi-lam/10"
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) })}
                                                className="w-20 px-3 py-2 text-sm rounded bg-kem/30 border border-khoi-lam/10"
                                            />
                                            <button type="button" onClick={() => removeItem(idx)} className="text-do-gach py-2">
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-sm px-3 py-1.5 rounded bg-khoi-lam/5 text-khoi-lam font-medium"
                                >
                                    + Thêm sản phẩm
                                </button>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-khoi-lam/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-khoi-lam/10 text-khoi-lam font-medium hover:bg-khoi-lam/5 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-vang-logo text-khoi-lam font-bold hover:bg-vang-logo/90 transition-colors"
                                >
                                    {editingGift ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
