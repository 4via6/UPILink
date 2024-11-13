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

// Updated UPI apps array with reordered apps
const UPI_APPS = [
  { 
    name: 'Paytm',
    package: 'net.one97.paytm',
    scheme: 'paytmmp://pay',
    color: '#00BAF2',
    icon: '/app-icons/paytm-square.svg',
    status: 'active'
  },
  { 
    name: 'CRED',
    package: 'com.dreamplug.androidapp',
    scheme: 'credpay://upi/pay',
    color: '#1C1C1C',
    icon: '/app-icons/cred-square.svg',
    status: 'active'
  },
  { 
    name: 'Amazon Pay',
    package: 'in.amazon.mShop.android.shopping',
    scheme: 'amazonpay://',
    color: '#FF9900',
    icon: '/app-icons/amazonpay-square.svg',
    status: 'active'
  },
  { 
    name: 'BHIM',
    package: 'in.org.npci.upiapp',
    scheme: 'upi://',
    color: '#00A0E3',
    icon: '/app-icons/bhim-square.svg',
    status: 'active'
  },
  { 
    name: 'PhonePe',
    package: 'com.phonepe.app',
    scheme: 'phonepe://pay',
    color: '#5F259F',
    icon: '/app-icons/phonepe-square.svg',
    status: 'coming_soon'
  },
  { 
    name: 'Google Pay',
    package: 'com.google.android.apps.nbu.paisa.user',
    scheme: 'tez://upi/pay',
    color: '#2DA94F',
    icon: '/app-icons/googlepay-square.svg',
    status: 'coming_soon'
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
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
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
    setSelectedApp(app.package);

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
        setTimeout(() => {
          window.location.href = intentUrl;
        }, 500); // Small delay before redirect
      } else {
        // For iOS: Use direct URL scheme
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = appUrl;
          link.rel = 'noopener noreferrer';
          link.click();
        }, 500);
      }

      // Remove the automatic closing
      setTimeout(() => {
        setIsRedirecting(false);
        setSelectedApp(null);
      }, 5000);

    } catch (error) {
      console.error('Error opening UPI app:', error);
      setIsRedirecting(false);
      setSelectedApp(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[400px] rounded-xl p-0 gap-0 border-0 shadow-xl overflow-hidden bg-background">
        {/* Header Section */}
        <DialogHeader className="p-6 border-b bg-card/50">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Select Payment App
            {selectedApp && !isRedirecting && (
              <span className="text-xs text-muted-foreground font-normal ml-2">
                Click × to close
              </span>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {!isOnline 
              ? "You're currently offline. Payment will be saved for later."
              : isMobile 
                ? selectedApp 
                  ? "App opened. You can close this window after completing the payment."
                  : "Choose your preferred UPI app to complete the payment"
                : "UPI app payments are only available on mobile devices"}
          </p>
        </DialogHeader>

        {/* Content Section */}
        <div className="p-6 bg-background">
          {!isOnline ? (
            // Offline View
            <div className="py-6 text-center">
              <div className="inline-flex p-3 rounded-full bg-muted mb-5">
                <WifiOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-3">You're Offline</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[280px] mx-auto">
                Your payment will be saved and processed automatically when you're back online.
              </p>
              <Button 
                onClick={handleOfflinePayment}
                className="w-full max-w-[200px]"
              >
                Save Payment for Later
              </Button>
            </div>
          ) : isMobile ? (
            // Mobile Online View - App Selection Grid
            <div className="grid grid-cols-2 gap-4">
              {UPI_APPS.map((app) => (
                <Button
                  key={app.package}
                  variant="outline"
                  disabled={isRedirecting || app.status === 'coming_soon'}
                  className={`
                    relative h-auto py-6 px-4 flex flex-col items-center justify-center gap-4
                    border border-input/50 
                    ${app.status === 'coming_soon' 
                      ? 'bg-muted/50 opacity-75 cursor-not-allowed' 
                      : 'bg-card/50 hover:bg-accent hover:border-accent active:scale-[0.98]'
                    }
                    transition-all duration-200
                    group
                    ${selectedApp === app.package ? 'ring-2 ring-primary ring-offset-2 bg-accent' : ''}
                  `}
                  onClick={() => app.status === 'active' && handleAppClick(app)}
                >
                  {/* App Icon */}
                  <div 
                    className={`
                      w-14 h-14 flex items-center justify-center 
                      transition-all duration-200 
                      ${app.status === 'coming_soon' ? 'opacity-50 blur-[1px]' : ''}
                      ${selectedApp === app.package ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                  >
                    <img 
                      src={app.icon} 
                      alt={`${app.name} icon`}
                      className="w-full h-full object-contain drop-shadow-sm"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* App name */}
                  <span className={`
                    text-sm font-medium text-center
                    transition-colors duration-200
                    ${app.status === 'coming_soon' 
                      ? 'text-muted-foreground' 
                      : selectedApp === app.package 
                        ? 'text-primary font-semibold' 
                        : 'text-foreground/90 group-hover:text-foreground'
                    }
                  `}>
                    {app.name}
                  </span>

                  {/* Coming Soon badge */}
                  {app.status === 'coming_soon' && (
                    <div className="absolute inset-0 flex items-end justify-center bg-background/60 rounded-lg backdrop-blur-[1px]">
                      <div className="mb-4 text-[10px] font-medium text-muted-foreground/90 px-3 py-1 bg-background/90 rounded-full border border-border/50">
                        Coming Soon
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {selectedApp === app.package && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50">
                      <div className="animate-pulse text-xs text-primary font-medium px-3 py-1.5 bg-background/90 rounded-full">
                        Opening {app.name}...
                      </div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            // Desktop View
            <div className="py-6 text-center">
              <div className="inline-flex p-3 rounded-full bg-muted mb-5">
                <Smartphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-3">Mobile Only Feature</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-[280px] mx-auto">
                Please scan the QR code or open this page on your mobile device to use UPI apps.
              </p>
            </div>
          )}
          
          {/* Payment Details Card */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm space-y-2.5 border border-input/10">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground/80">Payment Details</p>
              <span className="text-xs text-muted-foreground">UPI Payment</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>To: {paymentData.name}</span>
              {paymentData.amount && (
                <span className="font-medium text-foreground">
                  ₹{paymentData.amount}
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 