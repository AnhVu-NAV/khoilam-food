import React, { useState } from 'react';
import { Search, MapPin, Calendar, Thermometer, Droplets, ShieldCheck, Clock, CheckCircle2, QrCode, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';

const mockTemperatureData = [
  { time: '0h', temp: 25, humidity: 60 },
  { time: '12h', temp: 65, humidity: 45 },
  { time: '24h', temp: 70, humidity: 40 },
  { time: '36h', temp: 68, humidity: 38 },
  { time: '48h', temp: 72, humidity: 35 },
  { time: '60h', temp: 70, humidity: 30 },
];

export default function Traceability() {
  const [batchId, setBatchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [batchData, setBatchData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    
    setIsSearching(true);
    setShowResult(false);
    setError('');
    
    try {
      const res = await fetch(`/api/batches?id=${batchId}`);
      const data = await res.json();
      
      if (data.success) {
        setBatchData(data.batch);
        setShowResult(true);
      } else {
        setError(data.message || 'Không tìm thấy thông tin lô sản xuất này.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tra cứu.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleScan = (text: string) => {
    if (text) {
      setBatchId(text);
      setIsScannerOpen(false);
      // Automatically trigger search after a short delay
      setTimeout(() => {
        const formEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSearch(formEvent);
      }, 500);
    }
  };

  return (
    <div className="bg-kem min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xanh-rung uppercase tracking-widest text-sm font-semibold mb-4 block">Công nghệ minh bạch</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6">Truy xuất nguồn gốc</h1>
          <p className="text-khoi-lam/70 max-w-2xl mx-auto text-lg">
            Nhập mã lô sản xuất trên bao bì để xem toàn bộ hành trình của sản phẩm từ bản làng đến bàn ăn.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-20">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-khoi-lam/40" />
            </div>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="block w-full pl-12 pr-40 py-5 border-2 border-khoi-lam/10 rounded-2xl leading-5 bg-white placeholder-khoi-lam/40 focus:outline-none focus:border-xanh-rung focus:ring-4 focus:ring-xanh-rung/10 transition-all text-lg text-khoi-lam shadow-sm"
              placeholder="Nhập mã lô (VD: KL-TRB-2026-01)"
            />
            <div className="absolute inset-y-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="bg-khoi-lam/5 text-khoi-lam px-4 rounded-xl hover:bg-khoi-lam/10 transition-colors flex items-center justify-center"
                title="Quét mã QR"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-vang-logo text-khoi-lam px-6 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-kem/30 border-t-kem rounded-full animate-spin"></div>
                ) : (
                  'Tra cứu'
                )}
              </button>
            </div>
          </form>
          {error && (
            <p className="text-do-gach text-center mt-4 font-medium">{error}</p>
          )}
        </div>

        {/* Results */}
        {showResult && batchData && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2rem] shadow-xl border border-khoi-lam/5 overflow-hidden"
          >
            {/* Result Header */}
            <div className="bg-khoi-lam text-kem p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-vang-logo/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-kem/20 text-kem px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
                        Lô: {batchData.id}
                      </span>
                      <span className="flex items-center gap-1 text-xanh-rung bg-xanh-rung/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn
                      </span>
                    </div>
                    <h2 className="font-serif text-4xl font-bold">{batchData.product_name}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-kem/60 text-sm mb-1">Ngày sản xuất</p>
                    <p className="font-mono text-xl">{batchData.production_date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-kem/10">
                  <div>
                    <p className="text-kem/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-2"><MapPin className="w-3 h-3"/> Nguồn gốc</p>
                    <p className="font-medium">Bản Lác, Mai Châu</p>
                  </div>
                  <div>
                    <p className="text-kem/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-2"><Clock className="w-3 h-3"/> Thời gian hun</p>
                    <p className="font-medium">60 giờ liên tục</p>
                  </div>
                  <div>
                    <p className="text-kem/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-2"><Thermometer className="w-3 h-3"/> Nhiệt độ TB</p>
                    <p className="font-medium">68°C</p>
                  </div>
                  <div>
                    <p className="text-kem/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-2"><ShieldCheck className="w-3 h-3"/> Kiểm nghiệm</p>
                    <p className="font-medium">{batchData.certificate_url}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* Timeline */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-8">Nhật ký sản xuất</h3>
                  <div className="relative border-l-2 border-khoi-lam/10 ml-4 space-y-10">
                    
                    {batchData.production_log && batchData.production_log.length > 0 ? (
                      batchData.production_log.map((log: any, index: number) => (
                        <div key={index} className="relative pl-8">
                          <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-kem border-4 ${index === batchData.production_log.length - 1 ? 'border-khoi-lam/30' : 'border-xanh-rung'}`}></div>
                          <p className={`text-sm font-bold mb-1 ${index === batchData.production_log.length - 1 ? 'text-khoi-lam/50' : 'text-xanh-rung'}`}>{log.date}</p>
                          <h4 className="font-semibold text-khoi-lam text-lg mb-2">{log.title}</h4>
                          <p className="text-khoi-lam/70 text-sm">{log.description}</p>
                          {log.image_url && (
                            <img src={log.image_url} alt={log.title} className="mt-3 rounded-xl w-full max-h-48 object-cover border border-khoi-lam/10" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-khoi-lam/60 italic pl-8">Chưa có thông tin nhật ký cho lô này.</p>
                    )}

                  </div>
                </div>

                {/* Charts & Details */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-8">Biểu đồ nhiệt độ hun</h3>
                  <div className="bg-kem/50 rounded-2xl p-6 border border-khoi-lam/5 mb-8">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={batchData.temperature_log || mockTemperatureData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4B2E2B" opacity={0.1} vertical={false} />
                          <XAxis dataKey="time" stroke="#4B2E2B" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#4B2E2B" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#4B2E2B', borderRadius: '8px', border: 'none', color: '#F5E9D9' }}
                            itemStyle={{ color: '#F5E9D9' }}
                          />
                          <Line type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#F4CE6A" strokeWidth={3} dot={{ r: 4, fill: '#F4CE6A', strokeWidth: 2, stroke: '#FDF9EE' }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#2A6B38" strokeWidth={3} dot={{ r: 4, fill: '#2A6B38', strokeWidth: 2, stroke: '#FDF9EE' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-sm text-khoi-lam/70">
                        <div className="w-3 h-3 rounded-full bg-vang-logo"></div> Nhiệt độ (°C)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-khoi-lam/70">
                        <div className="w-3 h-3 rounded-full bg-xanh-rung"></div> Độ ẩm (%)
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-khoi-lam/10 rounded-2xl p-6">
                    <h4 className="font-semibold text-khoi-lam mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-xanh-rung" /> Chứng nhận chất lượng
                    </h4>
                    <ul className="space-y-3 text-sm text-khoi-lam/70">
                      <li className="flex justify-between border-b border-khoi-lam/5 pb-2">
                        <span>Độ ẩm sản phẩm</span>
                        <span className="font-medium text-khoi-lam">22% (Đạt)</span>
                      </li>
                      <li className="flex justify-between border-b border-khoi-lam/5 pb-2">
                        <span>Vi sinh vật</span>
                        <span className="font-medium text-khoi-lam">Âm tính</span>
                      </li>
                      <li className="flex justify-between border-b border-khoi-lam/5 pb-2">
                        <span>Chất bảo quản</span>
                        <span className="font-medium text-khoi-lam">Không phát hiện</span>
                      </li>
                      <li className="flex justify-between pt-1">
                        <span>Hạn sử dụng</span>
                        <span className="font-medium text-khoi-lam">6 tháng từ NSX</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-khoi-lam/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-4 right-4 p-2 bg-khoi-lam/5 text-khoi-lam rounded-full hover:bg-khoi-lam/10 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-2">Quét mã QR</h3>
                <p className="text-khoi-lam/70 text-sm">Đưa mã QR trên bao bì vào khung hình để tra cứu tự động.</p>
              </div>

              <div className="rounded-2xl overflow-hidden border-4 border-vang-logo/30 aspect-square bg-khoi-lam/5">
                <Scanner
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      handleScan(result[0].rawValue);
                    }
                  }}
                  components={{
                    finder: false,
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: { objectFit: 'cover' }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
