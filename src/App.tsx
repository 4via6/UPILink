import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from '@/pages/HomePage';
import CreatePage from '@/pages/CreatePage';
import PaymentSharePage from '@/pages/PaymentSharePage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function App() {
  const location = useLocation();
  const isPaymentPage = location.pathname === '/pay';

  // Update title based on route
  useEffect(() => {
    const baseTitle = "UPI Link";
    let pageTitle = "";

    switch (location.pathname) {
      case '/':
        pageTitle = `${baseTitle} - Create UPI Payment Pages Instantly`;
        break;
      case '/create':
        pageTitle = `${baseTitle} - Create Your Payment Page`;
        break;
      case '/pay':
        pageTitle = `${baseTitle} - Payment Request`;
        break;
      default:
        pageTitle = baseTitle;
    }

    document.title = pageTitle;
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isPaymentPage && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/pay" element={<PaymentSharePage />} />
        </Routes>
      </main>
      {!isPaymentPage && <Footer />}
    </div>
  );
}

export default App;