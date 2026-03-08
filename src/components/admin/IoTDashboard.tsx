import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2, Clock, ChevronRight, ArrowLeft, Camera, Plus, Settings, Package } from 'lucide-react';

const mockTempData = [
  { time: '0h', temp: 25, humidity: 48, smoke: 85 },
  { time: '2h', temp: 35, humidity: 60, smoke: 88 },
  { time: '4h', temp: 45, humidity: 58, smoke: 82 },
  { time: '6h', temp: 40, humidity: 65, smoke: 80 },
  { time: '8h', temp: 25, humidity: 80, smoke: 75 },
  { time: '10h', temp: 30, humidity: 68, smoke: 78 },
  { time: '12h', temp: 40, humidity: 72, smoke: 85 },
  { time: '14h', temp: 32, humidity: 65, smoke: 88 },
  { time: '16h', temp: 35, humidity: 75, smoke: 86 },
  { time: '18h', temp: 34, humidity: 78, smoke: 84 },
  { time: '22h', temp: 35, humidity: 70, smoke: 82 },
  { time: '24h', temp: 40, humidity: 68, smoke: 85 },
];

const mockDetailedTempData = [
  { time: '15:00', temp: 74, humidity: 48, smoke: 85 },
  { time: '15:05', temp: 75, humidity: 45, smoke: 82 },
  { time: '15:10', temp: 76, humidity: 42, smoke: 78 },
  { time: '15:15', temp: 75, humidity: 45, smoke: 80 },
  { time: '15:20', temp: 76, humidity: 48, smoke: 84 },
  { time: '15:25', temp: 75, humidity: 50, smoke: 86 },
  { time: '15:30', temp: 76, humidity: 49, smoke: 85 },
];

export default function IoTDashboard({ user }: { user?: any }) {
  const [view, setView] = useState<'overview' | 'batch_detail' | 'alert_detail'>('overview');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [targetTemp, setTargetTemp] = useState(75);
  const [inventory, setInventory] = useState({ meat: 500, spices: 50, wood: 200 });

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold text-khoi-lam">Giám sát sản xuất IoT</h2>
        <div className="text-right">
          <p className="text-khoi-lam font-medium">Nguyễn Thanh Bình</p>
          <p className="text-sm text-khoi-lam/60">Thứ Năm, 05/03/2026 - 15:30</p>
        </div>
      </div>

      {user && ['admin', 'seller'].includes(user.role) && (
        <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
          <h3 className="font-bold text-khoi-lam mb-4">Quản lý Nhiệt độ & Kho nguyên liệu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl border border-khoi-lam/10">
              <h4 className="font-medium text-khoi-lam mb-4 flex items-center gap-2"><Thermometer className="w-5 h-5 text-vang-logo" /> Điều chỉnh nhiệt độ mục tiêu</h4>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="50" max="100" 
                  value={targetTemp} 
                  onChange={(e) => setTargetTemp(Number(e.target.value))}
                  className="w-full accent-vang-logo"
                />
                <span className="font-bold text-xl text-khoi-lam w-16 text-center">{targetTemp}°C</span>
              </div>
              <button className="mt-4 w-full bg-vang-logo text-khoi-lam py-2 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors">
                Cập nhật nhiệt độ
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-khoi-lam/10">
              <h4 className="font-medium text-khoi-lam mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-xanh-rung" /> Quản lý kho nguyên liệu</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-khoi-lam/70">Thịt tươi (kg)</span>
                  <input 
                    type="number" 
                    value={inventory.meat} 
                    onChange={(e) => setInventory({...inventory, meat: Number(e.target.value)})}
                    className="w-24 p-1 border border-khoi-lam/20 rounded text-right"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-khoi-lam/70">Gia vị (kg)</span>
                  <input 
                    type="number" 
                    value={inventory.spices} 
                    onChange={(e) => setInventory({...inventory, spices: Number(e.target.value)})}
                    className="w-24 p-1 border border-khoi-lam/20 rounded text-right"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-khoi-lam/70">Củi nhãn (kg)</span>
                  <input 
                    type="number" 
                    value={inventory.wood} 
                    onChange={(e) => setInventory({...inventory, wood: Number(e.target.value)})}
                    className="w-24 p-1 border border-khoi-lam/20 rounded text-right"
                  />
                </div>
              </div>
              <button className="mt-4 w-full bg-xanh-rung text-white py-2 rounded-xl font-bold hover:bg-xanh-rung/90 transition-colors">
                Cập nhật kho
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-kem/30 p-4 rounded-2xl border border-khoi-lam/10 text-center">
          <p className="text-khoi-lam/70 text-sm mb-1">Lô đang chạy</p>
          <p className="text-3xl font-bold text-khoi-lam">12</p>
        </div>
        <div className="bg-kem/30 p-4 rounded-2xl border border-khoi-lam/10 text-center">
          <p className="text-khoi-lam/70 text-sm mb-1">Nhiệt độ TB lò</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-bold text-khoi-lam">76°C</p>
            <Thermometer className="w-5 h-5 text-vang-logo" />
          </div>
        </div>
        <div className="bg-kem/30 p-4 rounded-2xl border border-khoi-lam/10 text-center">
          <p className="text-khoi-lam/70 text-sm mb-1">Độ ẩm TB lò</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-bold text-khoi-lam">34%</p>
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-do-gach/10 p-4 rounded-2xl border border-do-gach/20 flex justify-between items-center cursor-pointer" onClick={() => setView('alert_detail')}>
          <span className="font-medium text-do-gach">Cảnh báo mới</span>
          <span className="bg-do-gach text-white px-3 py-1 rounded-full text-sm font-bold">3</span>
        </div>
        <div className="bg-do-gach/10 p-4 rounded-2xl border border-do-gach/20 flex justify-between items-center">
          <span className="font-medium text-do-gach">Cảnh báo tồn đọng</span>
          <span className="bg-do-gach text-white px-3 py-1 rounded-full text-sm font-bold">3</span>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Theo dõi thời gian thực lò sấy XKL-2603</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTempData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <ReferenceLine y={35} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#d97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10 text-center">
          <h4 className="font-medium text-khoi-lam mb-4">Mật độ khói</h4>
          <div className="relative w-32 h-16 mx-auto overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-khoi-lam/10 border-t-vang-logo border-l-vang-logo transform -rotate-45"></div>
          </div>
          <p className="mt-2 font-bold text-khoi-lam text-xl">85% <span className="text-sm font-normal text-xanh-rung ml-2">● Tốt</span></p>
        </div>
        <div className="bg-kem/30 p-6 rounded-2xl border border-khoi-lam/10 text-center">
          <h4 className="font-medium text-khoi-lam mb-4">Chất lượng không khí</h4>
          <div className="relative w-32 h-16 mx-auto overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-khoi-lam/10 border-t-xanh-rung border-l-xanh-rung transform rotate-45"></div>
          </div>
          <p className="mt-2 font-bold text-xanh-rung text-xl">● An toàn</p>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-khoi-lam">Danh sách lô hàng đang sản xuất</h3>
          <button className="text-khoi-lam/60 hover:text-khoi-lam"><Settings className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-vang-logo/10 p-4 rounded-2xl border border-vang-logo/20">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-khoi-lam text-lg">#KL-260{item}</h4>
                  <p className="text-khoi-lam/70 text-sm">Gác bếp | Ướp | Đóng gói</p>
                </div>
                <button className="bg-vang-logo/20 text-khoi-lam p-2 rounded-lg"><Settings className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-4 text-sm text-khoi-lam/80 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 15:30</span>
                <span className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> 76°C</span>
                <span className="flex items-center gap-1"><Droplets className="w-4 h-4" /> 34%</span>
              </div>
              <button 
                onClick={() => { setSelectedBatch(`KL-260${item}`); setView('batch_detail'); }}
                className="w-full bg-vang-logo/30 text-khoi-lam py-2 rounded-xl font-medium hover:bg-vang-logo/40 transition-colors"
              >
                Xem chi tiết / Nhật ký
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBatchDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('overview')} className="p-2 hover:bg-khoi-lam/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-khoi-lam" />
        </button>
        <h2 className="font-serif text-2xl font-bold text-khoi-lam">Chi tiết Lô hàng #{selectedBatch}</h2>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Thẻ 1: Tổng quan Lô hàng</h3>
        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-24 h-12 overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-[8px] border-khoi-lam/10 border-t-vang-logo border-l-vang-logo transform -rotate-45"></div>
          </div>
          <div>
            <h4 className="font-bold text-khoi-lam text-lg">Hun khói đang diễn ra</h4>
            <p className="text-xanh-rung font-medium flex items-center gap-2">● Hun khói tốt</p>
          </div>
        </div>
        <p className="text-khoi-lam/80 text-sm leading-relaxed">
          Trạng thái: Đang gác bếp | Bắt đầu: 02/03/2026<br/>
          Số lượng: 50 kg | Trưởng lò: Nguyễn V.
        </p>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-6">Thẻ 2: Nhật ký Sản xuất (timeline)</h3>
        <div className="relative border-l-2 border-xanh-rung/30 ml-3 space-y-8">
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-xanh-rung border-4 border-white"></div>
            <p className="font-bold text-khoi-lam">05/03/2026 (Hiện tại)</p>
            <p className="text-khoi-lam/70 mt-1">Hun khói đang diễn ra tại Lò #KXL-2603.</p>
          </div>
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-vang-logo border-4 border-white"></div>
            <p className="font-bold text-khoi-lam">02/03/2026 | 14:00</p>
            <div className="flex gap-4 mt-2">
              <img src="https://picsum.photos/seed/thit1/100/60" alt="Thịt" className="w-24 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
              <div>
                <p className="text-khoi-lam font-medium">Đưa thịt vào Lò #KXL-2603.</p>
                <p className="text-khoi-lam/70 text-sm mt-1">Bắt đầu quy trình hun khói. Nhiệt độ mục tiêu: 75°C.</p>
              </div>
            </div>
          </div>
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-vang-logo border-4 border-white"></div>
            <p className="font-bold text-khoi-lam">01/03/2026 | 09:00</p>
            <div className="flex gap-4 mt-2">
              <img src="https://picsum.photos/seed/thit2/100/60" alt="Thịt" className="w-24 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
              <div>
                <p className="text-khoi-lam font-medium">Nhập nguyên liệu.</p>
                <p className="text-khoi-lam/70 text-sm mt-1">Lô thịt tươi hun khói được kiểm định và tẩm ướp mắc khén, hạt dổi, ớt.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Thẻ 3: Dữ liệu IoT chi tiết Lô hàng (Lịch sử)</h3>
        <p className="text-sm font-medium text-khoi-lam mb-4">Lịch sử Nhiệt độ & Độ ẩm Lò #KXL-2603 (02/03 - 05/03)</p>
        <div className="h-48 w-full bg-kem/10 rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTempData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Thẻ 4: Cảnh báo liên quan Lô hàng</h3>
        <div className="space-y-3">
          <div className="bg-vang-logo/10 p-4 rounded-xl border border-vang-logo/20">
            <p className="text-khoi-lam font-medium">Cảnh báo: 14 phút trước - Mật độ khói thấp tại KXL-2603 &lt;80% (Đã xử lý).</p>
          </div>
          <div className="bg-vang-logo/10 p-4 rounded-xl border border-vang-logo/20">
            <p className="text-khoi-lam font-medium">Cảnh báo: 04/03/2026 - Nhiệt độ vượt 80°C tại KXL-2603 (Đã xử lý).</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlertDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('overview')} className="p-2 hover:bg-khoi-lam/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-khoi-lam" />
          </button>
          <h2 className="font-serif text-xl font-bold text-khoi-lam">Chi tiết Cảnh báo Lò sấy #KXL-2603</h2>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Thẻ 1: Tóm tắt Cảnh báo</h3>
        <div className="flex gap-6">
          <div className="relative w-24 h-24 shrink-0 flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-[8px] border-khoi-lam/10 border-t-vang-logo border-l-vang-logo transform -rotate-45"></div>
            <AlertTriangle className="w-8 h-8 text-do-gach mt-2" />
            <span className="text-xs font-bold text-do-gach mt-1">&lt;80%</span>
          </div>
          <div>
            <h4 className="font-bold text-khoi-lam text-xl">Cảnh báo Mật độ khói THẤP</h4>
            <p className="text-xanh-rung font-medium mb-2">● Hun khói tốt</p>
            <p className="text-sm text-khoi-lam/80 leading-relaxed">
              Thời gian xảy ra: 15:05 | 05/03/2026<br/>
              Thời gian kéo dài: 10 phút<br/>
              Trạng thái: <span className="text-do-gach font-bold">● Cần xử lý</span><br/>
              Mức độ nghiêm trọng: <span className="text-vang-logo font-bold">⚠️ Trung bình</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Thẻ 2: Phân tích Dữ liệu Lò sấy #KXL-2603</h3>
        <p className="text-sm font-medium text-khoi-lam mb-2">Lịch sử Nhiệt độ & Độ ẩm Lò #KXL-2603 (15:00-15:30)</p>
        <div className="flex gap-4 text-xs text-khoi-lam/70 mb-4">
          <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-blue-500"></div> Nhiệt độ (target: 70-80°C)</span>
          <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-green-500"></div> Độ ẩm (target: 40-50%)</span>
          <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-orange-500"></div> Mật độ khói (target: 80-90%)</span>
        </div>
        <div className="h-48 w-full bg-kem/10 rounded-xl p-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockDetailedTempData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="smoke" stroke="#f97316" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          {/* Mock alert highlight area */}
          <div className="absolute top-0 bottom-6 left-[20%] right-[60%] bg-do-gach/10 border-x border-do-gach/30 pointer-events-none"></div>
          <div className="absolute top-2 left-[25%] text-xs font-bold text-do-gach">Cảnh báo</div>
        </div>
      </div>

      <div className="bg-kem/30 p-6 rounded-3xl shadow-sm border border-khoi-lam/5">
        <h3 className="font-bold text-khoi-lam mb-4">Thẻ 3: Thao tác & Nhật ký Xử lý</h3>
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center justify-between bg-kem/30 p-3 rounded-xl border border-khoi-lam/10 hover:bg-kem/50 transition-colors">
            <span className="flex items-center gap-3 font-medium text-khoi-lam"><Camera className="w-5 h-5 text-xanh-rung" /> Xem Camera Lò sấy #KXL-2603</span>
          </button>
          <button className="w-full flex items-center justify-between bg-kem/30 p-3 rounded-xl border border-khoi-lam/10 hover:bg-kem/50 transition-colors">
            <span className="flex items-center gap-3 font-medium text-khoi-lam"><span className="text-xl">🪵</span> Cấp thêm củi gỗ</span>
            <span className="bg-khoi-lam/10 text-khoi-lam text-xs px-2 py-1 rounded">Đã cấp củi gỗ</span>
          </button>
          <button className="w-full flex items-center justify-between bg-kem/30 p-3 rounded-xl border border-khoi-lam/10 hover:bg-kem/50 transition-colors">
            <span className="flex items-center gap-3 font-medium text-khoi-lam"><Plus className="w-5 h-5 text-xanh-rung" /> Hun khói gác bếp</span>
            <span className="bg-khoi-lam/10 text-khoi-lam text-xs px-2 py-1 rounded">Đã cấp củi gỗ</span>
          </button>
          <button className="w-full flex items-center justify-between bg-kem/30 p-3 rounded-xl border border-khoi-lam/10 hover:bg-kem/50 transition-colors">
            <span className="flex items-center gap-3 font-medium text-khoi-lam"><Wind className="w-5 h-5 text-xanh-rung" /> Mở cửa gió phụ</span>
            <span className="bg-khoi-lam/10 text-khoi-lam text-xs px-2 py-1 rounded">Đã mở cửa gió phụ</span>
          </button>
          <button className="w-full flex items-center justify-between bg-kem/30 p-3 rounded-xl border border-khoi-lam/10 hover:bg-kem/50 transition-colors">
            <span className="flex items-center gap-3 font-medium text-khoi-lam"><Activity className="w-5 h-5 text-xanh-rung" /> Tăng cường hun khói (hệ thống lò)</span>
            <span className="bg-khoi-lam/10 text-khoi-lam text-xs px-2 py-1 rounded">Đã tăng cường hun khói</span>
          </button>
          <button className="w-full flex items-center justify-between bg-do-gach/10 p-3 rounded-xl border border-do-gach/20 hover:bg-do-gach/20 transition-colors">
            <span className="flex items-center gap-3 font-medium text-do-gach"><div className="w-4 h-4 rounded-full bg-do-gach"></div> Bỏ qua cảnh báo</span>
          </button>
          <button className="w-full flex items-center justify-between bg-kem/30 p-3 rounded-xl border border-khoi-lam/10 hover:bg-kem/50 transition-colors">
            <span className="flex items-center gap-3 font-medium text-khoi-lam"><span className="text-xl">💬</span> Liên hệ Trưởng lò Nguyễn V.</span>
          </button>
        </div>

        <h4 className="font-medium text-khoi-lam mb-3">Nhật ký cảnh báo liên quan Lot #KL-2603</h4>
        <div className="bg-vang-logo/10 p-4 rounded-xl border border-vang-logo/20">
          <p className="text-khoi-lam font-medium">Cảnh báo: 14 phút trước - Mật độ khói thấp tại KXL-2603 &lt;80% (Đã xử lý).</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {view === 'overview' && renderOverview()}
      {view === 'batch_detail' && renderBatchDetail()}
      {view === 'alert_detail' && renderAlertDetail()}
    </div>
  );
}
