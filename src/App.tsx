import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from '@/pages/HomePage';
import CreatePage from '@/pages/CreatePage';
import PaymentSharePage from '@/pages/PaymentSharePage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { checkConnectivity } from '@/utils/offline';

function App() {
  const location = useLocation();
  const isPaymentPage = location.pathname === '/pay';

  // Initialize analytics
  useAnalytics();

  useEffect(() => {
    const cleanup = checkConnectivity(
      () => toast.success('Back online!'),
      () => toast.error('You are offline')
    );

    return cleanup;
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
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
    </>
  );
}

export default App;