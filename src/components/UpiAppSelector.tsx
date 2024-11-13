import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Smartphone, WifiOff } from 'lucide-react';
import { addPendingPayment } from '@/utils/db';

// Updated UPI apps with proper package names and schemes
const UPI_APPS = [
  { 
    name: 'PhonePe',
    package: 'com.phonepe.app',
    scheme: 'phonepe://pay',
    color: '#5F259F',
    icon: '/app-icons/phonepe-square.svg'
  },
  { 
    name: 'Google Pay',
    package: 'com.google.android.apps.nbu.paisa.user',
    scheme: 'tez://upi/pay',
    color: '#2DA94F',
    icon: '/app-icons/googlepay-square.svg'
  },
  { 
    name: 'Paytm',
    package: 'net.one97.paytm',
    scheme: 'paytmmp://pay',
    color: '#00BAF2',
    icon: '/app-icons/paytm-square.svg'
  },
  { 
    name: 'BHIM',
    package: 'in.org.npci.upiapp',
    scheme: 'upi://',
    color: '#00A0E3',
    icon: '/app-icons/bhim-square.svg'
  },
  { 
    name: 'Amazon Pay',
    package: 'in.amazon.mShop.android.shopping',
    scheme: 'amazonpay://',
    color: '#FF9900',
    icon: '/app-icons/amazonpay-square.svg'
  },
  { 
    name: 'CRED',
    package: 'com.dreamplug.androidapp',
    scheme: 'credpay://upi/pay',
    color: '#1C1C1C',
    icon: '/app-icons/cred-square.svg'
  }
];

interface UpiAppSelectorProps {
  open: boolean;
  onClose: () => void;
  paymentData: {
    upiId: string;
    name: string;
    amount?: string;
    description?: string;
  };
}

export function UpiAppSelector({ open, onClose, paymentData }: UpiAppSelectorProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOfflinePayment = async () => {
    try {
      await addPendingPayment({
        name: paymentData.name,
        upiId: paymentData.upiId,
        amount: paymentData.amount || '',
        timestamp: Date.now()
      });

      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-payments');
      } else {
        localStorage.setItem('pendingPayment', JSON.stringify({
          ...paymentData,
          timestamp: Date.now()
        }));
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save offline payment:', error);
    }
  };

  const handleAppClick = async (app: typeof UPI_APPS[0]) => {
    if (isRedirecting || !isMobile) return;
    
    if (!isOnline) {
      handleOfflinePayment();
      return;
    }

    setIsRedirecting(true);

    try {
      // Construct UPI parameters based on app
      let appUrl = '';
      const baseParams = {
        pa: paymentData.upiId,
        pn: encodeURIComponent(paymentData.name),
        cu: 'INR'
      };

      if (paymentData.amount) {
        baseParams['am'] = paymentData.amount;
      }
      
      if (paymentData.description) {
        baseParams['tn'] = encodeURIComponent(paymentData.description);
      }

      const upiParams = new URLSearchParams(baseParams).toString();

      if (app.name === 'Google Pay') {
        // Special handling for GPay
        appUrl = `tez://upi/pay?${upiParams}&mode=00&orgid=159761`;
      } else if (app.name === 'PhonePe') {
        // Special handling for PhonePe
        const merchantId = "MERCHANTUAT"; // Optional: Add if you have a merchant ID
        appUrl = `phonepe://pay?${upiParams}&redirect=true&merchant=${merchantId}`;
      } else {
        // Default UPI URL construction for other apps
        appUrl = `${app.scheme}?${upiParams}`;
      }

      if (/android/i.test(navigator.userAgent)) {
        // For Android: Use intent URL
        const intentUrl = `intent://${appUrl.replace(/^[^:]+:\/\//, '')}#Intent;scheme=${
          app.name === 'Google Pay' ? 'tez' : app.scheme.split(':')[0]
        };package=${app.package};end`;
        window.location.href = intentUrl;
      } else {
        // For iOS: Use direct URL scheme
        const link = document.createElement('a');
        link.href = appUrl;
        link.rel = 'noopener noreferrer';
        link.click();
      }

      // Reset state and close dialog after a delay
      setTimeout(() => {
        setIsRedirecting(false);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error opening UPI app:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isRedirecting) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-[95vw] w-[400px] rounded-xl p-0 gap-0 border-0 shadow-lg overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b bg-card">
          <DialogTitle className="text-lg font-semibold">Select Payment App</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {!isOnline 
              ? "You're currently offline. Payment will be saved for later."
              : isMobile 
                ? "Choose your preferred UPI app to complete the payment"
                : "UPI app payments are only available on mobile devices"}
          </p>
        </DialogHeader>

        <div className="p-4 sm:p-6 bg-background">
          {!isOnline ? (
            // Offline View
            <div className="py-6 text-center">
              <div className="flex justify-center mb-4">
                <WifiOff className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">You're Offline</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your payment will be saved and processed automatically when you're back online.
              </p>
              <Button 
                onClick={handleOfflinePayment}
                className="w-full"
              >
                Save Payment for Later
              </Button>
            </div>
          ) : isMobile ? (
            // Mobile Online View - App Selection Grid
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {UPI_APPS.map((app) => (
                <Button
                  key={app.package}
                  variant="outline"
                  disabled={isRedirecting}
                  className={`
                    relative h-auto py-4 px-2 flex flex-col items-center justify-center gap-2
                    border border-input bg-background
                    hover:bg-accent hover:border-accent
                    active:scale-[0.98] transition-all duration-200
                    ${isRedirecting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => handleAppClick(app)}
                >
                  {/* App Icon */}
                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-transform duration-200"
                  >
                    <img 
                      src={app.icon} 
                      alt={`${app.name} icon`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* App name */}
                  <span className="text-xs sm:text-sm font-medium text-center text-foreground">
                    {app.name}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            // Desktop View
            <div className="py-6 text-center">
              <div className="flex justify-center mb-4">
                <Smartphone className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Mobile Only Feature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please scan the QR code or open this page on your mobile device to use UPI apps.
              </p>
            </div>
          )}
          
          {/* Payment details summary */}
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-1">
            <p className="font-medium">Payment Details:</p>
            <p className="text-muted-foreground">
              To: {paymentData.name}
              {paymentData.amount && ` • ₹${paymentData.amount}`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 