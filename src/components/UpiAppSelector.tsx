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
    
    setIsRedirecting(true);
    setSelectedApp(app.package);

    try {
      // Construct UPI parameters
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
      let appUrl = '';

      // Construct app-specific URLs
      if (app.name === 'Google Pay') {
        appUrl = `tez://upi/pay?${upiParams}&mode=00&orgid=159761`;
      } else if (app.name === 'PhonePe') {
        const merchantId = "MERCHANTUAT";
        appUrl = `phonepe://pay?${upiParams}&redirect=true&merchant=${merchantId}`;
      } else {
        appUrl = `${app.scheme}?${upiParams}`;
      }

      // Handle Android intent
      if (/android/i.test(navigator.userAgent)) {
        const intentUrl = `intent://${appUrl.replace(/^[^:]+:\/\//, '')}#Intent;scheme=${
          app.name === 'Google Pay' ? 'tez' : app.scheme.split(':')[0]
        };package=${app.package};end`;
        window.location.href = intentUrl;
      } else {
        // Handle iOS and other platforms
        window.location.href = appUrl;
      }

      // Keep popup open for a while to allow app switch
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
      <DialogContent className="max-w-[90vw] w-[340px] rounded-lg p-0 gap-0 border-0 shadow-lg overflow-hidden bg-background">
        {/* More compact header */}
        <DialogHeader className="p-4 border-b bg-card/50">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Select Payment App
            {selectedApp && !isRedirecting && (
              <span className="text-xs text-muted-foreground font-normal ml-2">
                Click × to close
              </span>
            )}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {isMobile 
              ? selectedApp 
                ? "App opened. You can close this window after completing the payment."
                : "Choose your preferred UPI app to complete the payment"
              : "UPI app payments are only available on mobile devices"
            }
          </p>
        </DialogHeader>

        {/* More compact content section */}
        <div className="p-4 bg-background">
          {isMobile ? (
            <div className="grid grid-cols-2 gap-3">
              {UPI_APPS.map((app) => (
                <Button
                  key={app.package}
                  variant="outline"
                  disabled={isRedirecting || app.status === 'coming_soon'}
                  className={`
                    relative h-auto py-4 px-3 flex flex-col items-center justify-center gap-3
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
                  {/* Smaller app icon */}
                  <div 
                    className={`
                      w-11 h-11 flex items-center justify-center 
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
                  
                  {/* Smaller app name */}
                  <span className={`
                    text-xs font-medium text-center
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

                  {/* Smaller coming soon badge */}
                  {app.status === 'coming_soon' && (
                    <div className="absolute inset-0 flex items-end justify-center bg-background/60 rounded-lg backdrop-blur-[1px]">
                      <div className="mb-3 text-[9px] font-medium text-muted-foreground/90 px-2.5 py-0.5 bg-background/90 rounded-full border border-border/50">
                        Coming Soon
                      </div>
                    </div>
                  )}

                  {/* Smaller loading indicator */}
                  {selectedApp === app.package && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50">
                      <div className="animate-pulse text-[10px] text-primary font-medium px-2.5 py-1 bg-background/90 rounded-full">
                        Opening {app.name}...
                      </div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            // Compact desktop view
            <div className="py-4 text-center">
              <div className="inline-flex p-2.5 rounded-full bg-muted mb-4">
                <Smartphone className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-2">Mobile Only Feature</h3>
              <p className="text-xs text-muted-foreground mb-3 max-w-[260px] mx-auto">
                Please scan the QR code or open this page on your mobile device to use UPI apps.
              </p>
            </div>
          )}
          
          {/* Compact payment details card */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs space-y-2 border border-input/10">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground/80">Payment Details</p>
              <span className="text-[10px] text-muted-foreground">UPI Payment</span>
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