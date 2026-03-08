import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';

export default function Layout() {
  return (
    <div className="flex-1 flex flex-col bg-kem text-khoi-lam font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
