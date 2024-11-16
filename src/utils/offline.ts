export const isOffline = () => !navigator.onLine;

export function isUpiScheme(url: string): boolean {
  const upiSchemes = [
    'upi:', 
    'phonepe:', 
    'tez:', 
    'paytmmp:', 
    'credpay:', 
    'intent:'
  ];
  return upiSchemes.some(scheme => url.startsWith(scheme));
}

export function checkConnectivity(
  onOnline: () => void,
  onOffline: () => void
) {
  const handleOnline = () => {
    if (!isUpiScheme(window.location.href)) {
      onOnline();
    }
  };

  const handleOffline = () => {
    if (!isUpiScheme(window.location.href)) {
      onOffline();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
} 