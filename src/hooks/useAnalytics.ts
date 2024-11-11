import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-6KDXM4XWNH';

export const useAnalytics = () => {
  const location = useLocation();

  // Page view tracking
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  // Event tracking
  const trackEvent = useCallback((action: string, category: string, label: string, value?: number) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }, []);

  return { trackEvent };
}; 