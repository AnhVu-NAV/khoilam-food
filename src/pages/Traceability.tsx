import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Droplets,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Thermometer,
  X,
} from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';

type TemperaturePoint = {
  time: string;
  temp: number;
  humidity: number;
};

type QualityCheck = {
  label: string;
  value: string;
};

const defaultQualityChecks: QualityCheck[] = [
  { label: 'Độ ẩm sản phẩm', value: '22% (Đạt)' },
  { label: 'Vi sinh vật', value: 'Âm tính' },
  { label: 'Chất bảo quản', value: 'Không phát hiện' },
  { label: 'Hạn sử dụng', value: '6 tháng từ NSX' },
];

const extractBatchId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    return (
      url.searchParams.get('batch') ||
      url.searchParams.get('id') ||
      decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
    );
  } catch {
    return trimmed;
  }
};

const getAverage = (items: TemperaturePoint[], key: 'temp' | 'humidity') => {
  const values = items.map((item) => Number(item[key])).filter(Number.isFinite);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export default function Traceability() {
  const [batchId, setBatchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [batchData, setBatchData] = useState<any>(null);
  const [error, setError] = useState('');

  const lookupBatch = async (value: string) => {
    const normalizedBatchId = extractBatchId(value);
    if (!normalizedBatchId) return;

    setIsSearching(true);
    setShowResult(false);
    setError('');
    setBatchId(normalizedBatchId);

    try {
      const res = await fetch(`/api/batches?id=${encodeURIComponent(normalizedBatchId)}`);
      const data = await res.json();

      if (data.success) {
        setBatchData(data.batch);
        setShowResult(true);
      } else {
        setError(data.message || 'Không tìm thấy thông tin lô sản xuất này.');
      }
    } catch {
      setError('Có lỗi xảy ra khi tra cứu.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await lookupBatch(batchId);
  };

  const handleScan = (text: string) => {
    if (!text) return;
    setIsScannerOpen(false);
    lookupBatch(text);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialBatchId = params.get('batch') || params.get('id');

    if (initialBatchId) {
      lookupBatch(initialBatchId);
    }
  }, []);

  const temperatureData = useMemo<TemperaturePoint[]>(() => {
    if (!Array.isArray(batchData?.temperature_log)) return [];

    return batchData.temperature_log
      .map((item: any) => ({
        time: String(item.time || '').trim(),
        temp: Number(item.temp),
        humidity: Number(item.humidity),
      }))
      .filter((item: TemperaturePoint) => item.time && Number.isFinite(item.temp) && Number.isFinite(item.humidity));
  }, [batchData]);

  const certificateImages = Array.isArray(batchData?.certificate_images) ? batchData.certificate_images : [];
  const qualityChecks =
    Array.isArray(batchData?.quality_checks) && batchData.quality_checks.length > 0
      ? batchData.quality_checks
      : defaultQualityChecks;
  const averageTemp = getAverage(temperatureData, 'temp');
  const averageHumidity = getAverage(temperatureData, 'humidity');
  const smokingDuration = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1]?.time : '';
  const certificateValue = String(batchData?.certificate_url || '').trim();
  const certificateIsUrl = /^https?:\/\//i.test(certificateValue);

  return (
    <div className="bg-kem min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xanh-rung uppercase tracking-widest text-sm font-semibold mb-4 block">
            Công nghệ minh bạch
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-khoi-lam mb-6">
            Truy xuất nguồn gốc
          </h1>
          <p className="text-khoi-lam/70 max-w-2xl mx-auto text-lg">
            Nhập mã lô trên bao bì hoặc quét QR để xem dữ liệu sản xuất, nhiệt độ hun và chứng nhận chất lượng.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-khoi-lam/40" />
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="block w-full pl-12 pr-40 py-5 border-2 border-khoi-lam/10 rounded-2xl bg-white placeholder-khoi-lam/40 focus:outline-none focus:border-xanh-rung focus:ring-4 focus:ring-xanh-rung/10 transition-all text-lg text-khoi-lam shadow-sm"
              placeholder="Nhập mã lô hoặc URL QR"
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
                className="bg-vang-logo text-khoi-lam px-6 rounded-xl font-bold hover:bg-vang-logo/90 transition-colors disabled:opacity-70"
              >
                {isSearching ? 'Đang tra...' : 'Tra cứu'}
              </button>
            </div>
          </form>
          {error && <p className="text-do-gach text-center mt-4 font-medium">{error}</p>}
        </div>

        {showResult && batchData && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2rem] shadow-xl border border-khoi-lam/5 overflow-hidden"
          >
            <div className="bg-khoi-lam text-kem p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-kem/20 text-kem px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      Lô: {batchData.id}
                    </span>
                    <span className="flex items-center gap-1 text-xanh-rung bg-xanh-rung/20 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn
                    </span>
                  </div>
                  <h2 className="font-serif text-4xl font-bold">{batchData.product_name}</h2>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-kem/60 text-sm mb-1">Ngày sản xuất</p>
                  <p className="font-mono text-xl">{batchData.production_date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-kem/10">
                <div>
                  <p className="text-kem/50 text-xs uppercase mb-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Nguồn gốc
                  </p>
                  <p className="font-medium">Bản Lác, Mai Châu</p>
                </div>
                <div>
                  <p className="text-kem/50 text-xs uppercase mb-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Mốc hun cuối
                  </p>
                  <p className="font-medium">{smokingDuration || 'Chưa có log'}</p>
                </div>
                <div>
                  <p className="text-kem/50 text-xs uppercase mb-1 flex items-center gap-2">
                    <Thermometer className="w-3 h-3" /> Nhiệt độ TB
                  </p>
                  <p className="font-medium">{averageTemp !== null ? `${averageTemp}°C` : 'Chưa có log'}</p>
                </div>
                <div>
                  <p className="text-kem/50 text-xs uppercase mb-1 flex items-center gap-2">
                    <Droplets className="w-3 h-3" /> Độ ẩm TB
                  </p>
                  <p className="font-medium">{averageHumidity !== null ? `${averageHumidity}%` : 'Chưa có log'}</p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-8">Nhật ký sản xuất</h3>
                <div className="relative border-l-2 border-khoi-lam/10 ml-4 space-y-10">
                  {Array.isArray(batchData.production_log) && batchData.production_log.length > 0 ? (
                    batchData.production_log.map((log: any, index: number) => (
                      <div key={index} className="relative pl-8">
                        <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-kem border-4 border-xanh-rung" />
                        <p className="text-sm font-bold mb-1 text-xanh-rung">{log.date}</p>
                        <h4 className="font-semibold text-khoi-lam text-lg mb-2">{log.title}</h4>
                        <p className="text-khoi-lam/70 text-sm">{log.description}</p>
                        {log.image_url && (
                          <img
                            src={log.image_url}
                            alt={log.title}
                            className="mt-3 rounded-xl w-full max-h-48 object-cover border border-khoi-lam/10"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-khoi-lam/60 italic pl-8">Chưa có nhật ký cho lô này.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-khoi-lam mb-8">Biểu đồ nhiệt độ hun</h3>
                <div className="bg-kem/50 rounded-2xl p-6 border border-khoi-lam/5 mb-8">
                  {temperatureData.length > 0 ? (
                    <>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={temperatureData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B2E2B" opacity={0.1} vertical={false} />
                            <XAxis dataKey="time" stroke="#4B2E2B" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#4B2E2B" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#4B2E2B', borderRadius: '8px', border: 'none', color: '#F5E9D9' }}
                              itemStyle={{ color: '#F5E9D9' }}
                            />
                            <Line type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#F4CE6A" strokeWidth={3} />
                            <Line type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#2A6B38" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm text-khoi-lam/70">
                          <div className="w-3 h-3 rounded-full bg-vang-logo" /> Nhiệt độ (°C)
                        </div>
                        <div className="flex items-center gap-2 text-sm text-khoi-lam/70">
                          <div className="w-3 h-3 rounded-full bg-xanh-rung" /> Độ ẩm (%)
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-khoi-lam/60 text-center px-6">
                      Chưa có dữ liệu nhiệt độ và độ ẩm cho lô này. Vào Admin → Lô sản xuất để thêm điểm đo.
                    </div>
                  )}
                </div>

                <div className="bg-white border border-khoi-lam/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-khoi-lam mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-xanh-rung" /> Chứng nhận chất lượng
                  </h4>
                  <div className="space-y-3 text-sm text-khoi-lam/70">
                    {qualityChecks.map((check: QualityCheck, index: number) => (
                      <div key={index} className="flex justify-between border-b border-khoi-lam/5 pb-2 gap-4">
                        <span>{check.label}</span>
                        <span className="font-medium text-khoi-lam text-right">{check.value}</span>
                      </div>
                    ))}
                  </div>

                  {certificateValue && (
                    certificateIsUrl ? (
                      <a
                        href={certificateValue}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-5 text-sm font-semibold text-xanh-rung hover:underline"
                      >
                        Xem giấy kiểm định
                      </a>
                    ) : (
                      <p className="mt-5 text-sm font-semibold text-xanh-rung">{certificateValue}</p>
                    )
                  )}

                  {certificateImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      {certificateImages.map((url: string, index: number) => (
                        <a key={index} href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt={`Chứng nhận ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-xl border border-khoi-lam/10"
                            referrerPolicy="no-referrer"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

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
                  components={{ finder: false }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: { objectFit: 'cover' },
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
