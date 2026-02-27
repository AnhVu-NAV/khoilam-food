import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/dang-nhap');
    } else {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          // Filter orders for the current user by ID or Email
          const userOrders = data.filter((o: any) => o.user_id === user.id || o.email === user.email);
          setOrders(userOrders);
        });
    }
  }, [user, navigate]);

  const toggleOrderDetails = async (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setOrderItems([]);
    } else {
      setExpandedOrder(orderId);
      const res = await fetch(`/api/orders/${orderId}/items`);
      const data = await res.json();
      setOrderItems(data);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-kem min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-khoi-lam mb-12">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-khoi-lam/5">
              <div className="w-20 h-20 bg-vang-logo/20 rounded-full flex items-center justify-center text-khoi-lam text-3xl font-bold mb-4 mx-auto">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-khoi-lam text-center mb-2">{user.name}</h2>
              <p className="text-khoi-lam/60 text-center text-sm mb-6">{user.email}</p>
              
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full bg-khoi-lam/5 text-do-gach font-medium py-2 rounded-xl hover:bg-do-gach/10 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-6">Lịch sử đơn hàng</h3>
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-khoi-lam/5">
                <p className="text-khoi-lam/60">Bạn chưa có đơn hàng nào.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-khoi-lam/5">
                    <div className="flex justify-between items-center mb-4 border-b border-khoi-lam/10 pb-4">
                      <div>
                        <p className="text-sm text-khoi-lam/60">Đơn hàng #{order.id}</p>
                        <p className="text-xs text-khoi-lam/40">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-vang-logo/20 text-khoi-lam' :
                        order.status === 'shipping' ? 'bg-blue-500/20 text-blue-700' :
                        (order.status === 'delivered' || order.status === 'completed') ? 'bg-xanh-rung/20 text-xanh-rung' :
                        'bg-do-gach/20 text-do-gach'
                      }`}>
                        {order.status === 'pending' ? 'Đang xử lý' :
                         order.status === 'shipping' ? 'Đang giao hàng' :
                         (order.status === 'delivered' || order.status === 'completed') ? 'Đã giao' : 'Đã huỷ'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-khoi-lam/70 mr-2">Tổng tiền:</span>
                        <span className="font-bold text-lg text-khoi-lam">{order.total.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <button 
                        onClick={() => toggleOrderDetails(order.id)}
                        className="text-sm font-medium text-khoi-lam hover:text-khoi-lam/70 transition-colors underline"
                      >
                        {expandedOrder === order.id ? 'Đóng' : 'Xem chi tiết'}
                      </button>
                    </div>
                    
                    {expandedOrder === order.id && (
                      <div className="mt-6 pt-6 border-t border-khoi-lam/10">
                        <h4 className="font-bold text-khoi-lam mb-4">Sản phẩm trong đơn hàng</h4>
                        <div className="space-y-4">
                          {orderItems.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 bg-kem/30 p-3 rounded-xl border border-khoi-lam/5">
                              <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <div className="flex-grow">
                                <p className="font-bold text-khoi-lam text-sm">{item.product_name}</p>
                                <p className="text-xs text-khoi-lam/60">{item.price.toLocaleString('vi-VN')}đ x {item.quantity}</p>
                              </div>
                              <div className="font-bold text-khoi-lam text-sm">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 bg-kem/30 p-4 rounded-xl border border-khoi-lam/5">
                          <p className="text-sm text-khoi-lam/70 mb-1"><span className="font-medium">Giao đến:</span> {order.shipping_address}</p>
                          <p className="text-sm text-khoi-lam/70"><span className="font-medium">Số điện thoại:</span> {order.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
