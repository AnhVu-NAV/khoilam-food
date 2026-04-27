import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCombos() {
    const [combos, setCombos] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [comboForm, setComboForm] = useState({
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
        const res = await fetch('/api/combos');
        const data = await res.json();
        setCombos(Array.isArray(data) ? data : []);
    };

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
    };

    const openModal = (combo: any = null) => {
        if (combo) {
            setEditingCombo(combo);
            setComboForm({
                id: combo.id || '',
                name: combo.name || '',
                description: combo.description || '',
                price: Number(combo.price || 0),
                badge: combo.badge || '',
                image: combo.image || '',
                items: Array.isArray(combo.items) ? combo.items : [],
            });
        } else {
            setEditingCombo(null);
            setComboForm({
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

        const payload = { ...comboForm };
        const method = editingCombo ? 'PUT' : 'POST';
        const url = editingCombo
            ? `/api/combos?id=${encodeURIComponent(comboForm.id)}`
            : '/api/combos';

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
            alert(data?.message || 'Có lỗi xảy ra khi lưu combo');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa combo này?')) {
            try {
                const res = await fetch(`/api/combos?id=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });
                if (!res.ok) throw new Error('Network response error');
                const data = await res.json();
                if (data.success) {
                    fetchData();
                } else {
                    alert(data.message || 'Không thể xóa combo.');
                }
            } catch (error) {
                alert('Lỗi kết nối khi xóa combo');
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
                setComboForm((prev) => ({ ...prev, image: data.url }));
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
        setComboForm({
            ...comboForm,
            items: [...comboForm.items, { product_id: '', quantity: 1, label: '' }],
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...comboForm.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setComboForm({ ...comboForm, items: newItems });
    };

    const removeItem = (index: number) => {
        const newItems = [...comboForm.items];
        newItems.splice(index, 1);
        setComboForm({ ...comboForm, items: newItems });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-khoi-lam">Quản lý Combos</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-vang-logo text-khoi-lam px-4 py-2 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Thêm Combo
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="border-b border-khoi-lam/10 text-khoi-lam/60 text-sm">
                        <th className="pb-4 font-medium">Combo</th>
                        <th className="pb-4 font-medium">Giá</th>
                        <th className="pb-4 font-medium">Badge</th>
                        <th className="pb-4 font-medium">Sản phẩm bao gồm</th>
                        <th className="pb-4 font-medium">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-khoi-lam/5">
                    {combos.map((c) => (
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
                            {editingCombo ? 'Chỉnh sửa Combo' : 'Thêm Combo mới'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam/70 mb-2">ID</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingCombo}
                                        value={comboForm.id}
                                        onChange={(e) => setComboForm({ ...comboForm, id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Tên Combo</label>
                                    <input
                                        type="text"
                                        required
                                        value={comboForm.name}
                                        onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Mô tả</label>
                                <textarea
                                    value={comboForm.description}
                                    onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Giá Combo</label>
                                    <input
                                        type="number"
                                        required
                                        value={comboForm.price}
                                        onChange={(e) => setComboForm({ ...comboForm, price: Number(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Badge</label>
                                    <input
                                        type="text"
                                        value={comboForm.badge}
                                        onChange={(e) => setComboForm({ ...comboForm, badge: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-kem/30 border border-khoi-lam/10 focus:outline-none focus:border-khoi-lam/30"
                                        placeholder="Ví dụ: Tiết kiệm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Ảnh Combo</label>
                                <div className="flex items-center gap-4">
                                    {comboForm.image && (
                                        <img src={comboForm.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vang-logo/20 file:text-khoi-lam hover:file:bg-vang-logo/30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-khoi-lam/70 mb-2">Sản phẩm có trong Combo</label>
                                <div className="space-y-3 mb-3">
                                    {comboForm.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="flex-1">
                                                <select
                                                    value={item.product_id || ''}
                                                    onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded bg-kem/30 border border-khoi-lam/10"
                                                >
                                                    <option value="">-- Quà tặng / Khác --</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Nhãn hiển thị (ví dụ: 500gr thịt trâu)"
                                                    value={item.label}
                                                    onChange={(e) => updateItem(idx, 'label', e.target.value)}
                                                    className="w-full mt-2 px-3 py-2 text-sm rounded bg-kem/30 border border-khoi-lam/10"
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
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
                                    {editingCombo ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
