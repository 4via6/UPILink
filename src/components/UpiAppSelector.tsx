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
    color: '#5F259F' // PhonePe purple
  },
  { 
    name: 'Google Pay',
    package: 'com.google.android.apps.nbu.paisa.user',
    scheme: 'tez://upi/pay',
    color: '#2DA94F' // GPay green
  },
  { 
    name: 'Paytm',
    package: 'net.one97.paytm',
    scheme: 'paytmmp://pay',
    color: '#00BAF2' // Paytm blue
  },
  { 
    name: 'BHIM',
    package: 'in.org.npci.upiapp',
    scheme: 'upi://',
    color: '#00A0E3' // BHIM blue
  },
  { 
    name: 'Amazon Pay',
    package: 'in.amazon.mShop.android.shopping',
    scheme: 'amazonpay://',
    color: '#FF9900' // Amazon orange
  },
  { 
    name: 'CRED',
    package: 'com.dreamplug.androidapp',
    scheme: 'credpay://upi/pay',  // Updated CRED scheme
    color: '#1C1C1C' // CRED black
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

    const upiParams = new URLSearchParams({
      pa: paymentData.upiId,
      pn: paymentData.name,
      ...(paymentData.amount && { am: paymentData.amount }),
      ...(paymentData.description && { tn: paymentData.description }),
      cu: 'INR'
    });

    try {
      if (/android/i.test(navigator.userAgent)) {
        const intentUrl = `intent://pay?${upiParams.toString()}#Intent;scheme=upi;package=${app.package};end`;
        window.location.href = intentUrl;
      } else {
        const appUrl = `${app.scheme}?${upiParams.toString()}`;
        const link = document.createElement('a');
        link.href = appUrl;
        link.rel = 'noopener noreferrer';
        link.click();
      }

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">Select Payment App</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {!isOnline 
              ? "You're currently offline. Payment will be saved for later."
              : isMobile 
                ? "Choose your preferred UPI app to complete the payment"
                : "UPI app payments are only available on mobile devices"}
          </p>
        </DialogHeader>

        {!isOnline ? (
          // Offline View
          <div className="py-8 px-4 text-center">
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
          // Mobile Online View - App Selection Grid remains the same
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 sm:p-2">
            {UPI_APPS.map((app) => (
              <Button
                key={app.package}
                variant="outline"
                disabled={isRedirecting}
                className={`
                  group relative h-auto py-6 px-3 flex flex-col items-center justify-center gap-3 
                  hover:border-primary/50 hover:shadow-sm transition-all duration-200
                  ${isRedirecting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => handleAppClick(app)}
              >
                {/* Circle with first letter */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: app.color }}
                >
                  {app.name[0]}
                </div>
                
                {/* App name */}
                <span className="text-sm font-medium text-center group-hover:text-primary transition-colors duration-200">
                  {app.name}
                </span>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-md border-2 border-transparent group-hover:border-primary/50 transition-all duration-200" />
              </Button>
            ))}
          </div>
        ) : (
          // Desktop View remains the same
          <div className="py-8 px-4 text-center">
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
        <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
          <p className="font-medium">Payment Details:</p>
          <p className="text-muted-foreground">
            To: {paymentData.name}
            {paymentData.amount && ` • ₹${paymentData.amount}`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 