import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Traceability from './pages/Traceability';
import Story from './pages/Story';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Combo from './pages/Combo';
import ComboDetail from './pages/ComboDetail';
import Gift from './pages/Gift';
import GiftDetail from './pages/GiftDetail';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="san-pham" element={<Products />} />
                            <Route path="san-pham/:id" element={<ProductDetail />} />
                            <Route path="truy-xuat" element={<Traceability />} />
                            <Route path="cau-chuyen" element={<Story />} />
                            <Route path="gioi-thieu" element={<About />} />
                            <Route path="dang-nhap" element={<Login />} />
                            <Route path="dang-ky" element={<Register />} />
                            <Route path="gio-hang" element={<Cart />} />
                            <Route path="thanh-toan" element={<Checkout />} />
                            <Route path="tai-khoan" element={<Account />} />
                            <Route path="admin" element={<Admin />} />
                            <Route path="combo" element={<Combo />} />
                            <Route path="combo/:id" element={<ComboDetail />} />
                            <Route path="qua-tang" element={<Gift />} />
                            <Route path="qua-tang/:id" element={<GiftDetail />} />

                            {/* Fallback for undefined routes */}
                            <Route path="*" element={<Home />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}