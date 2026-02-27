import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Chào bạn! Mình là trợ lý ảo của Khói Lam. Mình có thể giúp bạn chọn món, gợi ý combo quà biếu, hoặc hướng dẫn cách chế biến đặc sản Tây Bắc. Bạn cần mình giúp gì nào?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction: `Bạn là trợ lý ảo của Khói Lam - thương hiệu đặc sản Tây Bắc cao cấp. 
          Sản phẩm chính: Thịt trâu gác bếp, Thịt lợn bản gác bếp, Ba chỉ heo gác bếp, Bắp heo gác bếp, Lạp xưởng gác bếp, Lạp xưởng hun mía, Lạp xưởng trứng muối, Cá trắm đen gác bếp, Gia vị chẩm chéo.
          Nhiệm vụ: Tư vấn món ăn, gợi ý combo quà biếu, hướng dẫn chế biến, tư vấn bảo quản.
          Giọng điệu: Thân thiện, mộc mạc, nhiệt tình, mang đậm văn hoá Tây Bắc.
          Luôn trả lời ngắn gọn, súc tích và tập trung vào sản phẩm của Khói Lam.
          QUAN TRỌNG: Khi bạn gợi ý hoặc nhắc đến một sản phẩm cụ thể, BẮT BUỘC phải chèn mã sản phẩm theo cú pháp [PRODUCT:id_sản_phẩm] vào cuối câu giới thiệu để hệ thống hiển thị nút mua hàng.
          Danh sách ID sản phẩm:
          - Thịt Trâu Gác Bếp: trau-gac-bep
          - Thịt Lợn Bản Gác Bếp: lon-ban-gac-bep
          - Ba Chỉ Heo Gác Bếp: ba-chi-heo-gac-bep
          - Bắp Heo Gác Bếp: bap-heo-gac-bep
          - Lạp Xưởng Gác Bếp: lap-xuong-gac-bep
          - Lạp Xưởng Hun Mía: lap-xuong-hun-mia
          - Lạp Xưởng Trứng Muối: lap-xuong-trung-muoi
          - Cá Trắm Đen Gác Bếp: ca-tram-den-gac-bep
          - Gia Vị Chẩm Chéo: gia-vi-cham-cheo
          Ví dụ: "Dạ, anh chị dùng thử Thịt Trâu Gác Bếp nhé, rất hợp để nhâm nhi ạ. [PRODUCT:trau-gac-bep]"
          Sử dụng Markdown để in đậm, in nghiêng cho đẹp mắt.`,
        }
      });

      const botMessage: Message = { id: (Date.now() + 1).toString(), text: response.text || 'Xin lỗi, mình chưa hiểu ý bạn.', sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (text: string) => {
    const parts = text.split(/(\[PRODUCT:[a-z0-9-]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[PRODUCT:([a-z0-9-]+)\]/);
      if (match) {
        const productId = match[1];
        const product = products.find(p => p.id === productId);
        if (product) {
          return (
            <div key={index} className="mt-3 mb-2 p-3 bg-white rounded-xl border border-vang-logo/30 shadow-sm flex flex-col gap-3">
              <div className="flex gap-3 items-center">
                <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-khoi-lam text-sm leading-tight mb-1">{product.name}</p>
                  <p className="text-do-gach font-bold text-xs">{product.price.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  addToCart(product, 1, product.weights[0]);
                  alert('Đã thêm vào giỏ hàng!');
                }}
                className="w-full bg-vang-logo text-khoi-lam text-xs font-bold py-2 rounded-lg hover:bg-vang-logo/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ ({product.weights[0]})
              </button>
            </div>
          );
        }
        return null;
      }
      return (
        <div key={index} className="prose prose-sm prose-p:leading-relaxed prose-strong:text-khoi-lam max-w-none">
          <ReactMarkdown>
            {part}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-vang-logo text-khoi-lam rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-khoi-lam/10 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-khoi-lam text-kem p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-vang-logo rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-khoi-lam" />
                </div>
                <div>
                  <h3 className="font-serif font-bold">Trợ lý Khói Lam</h3>
                  <p className="text-xs text-kem/70 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Đang trực tuyến
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-kem/70 hover:text-kem transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto bg-kem/30 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-khoi-lam text-kem rounded-tr-sm' 
                      : 'bg-white border border-khoi-lam/10 text-khoi-lam rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.sender === 'bot' ? renderMessage(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-khoi-lam/10 text-khoi-lam rounded-2xl rounded-tl-sm p-3 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-khoi-lam/40 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-khoi-lam/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-khoi-lam/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-khoi-lam/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-grow bg-kem/50 border border-khoi-lam/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-vang-logo focus:ring-1 focus:ring-vang-logo transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-vang-logo text-khoi-lam p-2 rounded-xl hover:bg-vang-logo/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
