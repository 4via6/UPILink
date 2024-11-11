import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from '@/pages/HomePage';
import CreatePage from '@/pages/CreatePage';
import PaymentSharePage from '@/pages/PaymentSharePage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAnalytics } from '@/hooks/useAnalytics';
import { checkConnectivity } from '@/utils/offline';

function App() {
  const location = useLocation();
  const isPaymentPage = location.pathname === '/pay';

  // Initialize analytics
  useAnalytics();

  // Handle online/offline silently
  useEffect(() => {
    const cleanup = checkConnectivity(
      // Online callback - silent refresh if needed
      () => {
        if (document.visibilityState === 'visible') {
          window.location.reload();
        }
      },
      // Offline callback - no notification needed
      () => {}
    );

    return cleanup;
  }, []);

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