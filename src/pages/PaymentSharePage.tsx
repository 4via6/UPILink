import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Smartphone, Code, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import html2canvas from 'html2canvas/dist/html2canvas.js';
import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SEO } from '@/components/SEO';
import { addPendingPayment } from '@/utils/db';
import { toast } from 'sonner';
import { isOffline } from '@/utils/offline';
import { UpiAppSelector } from '@/components/UpiAppSelector';

// Add CTA variations
const CTA_VARIATIONS = [
  "Create Your Own Payment Link",
  "Start Accepting Payments",
  "Your Turn to Create One",
  "Make Money Move Faster",
  "Get Your Payment Link Now",
  "Join the Digital Payment Era",
  "Create Your Payment Magic",
  "Time to Get Paid Smarter",
  "Simplify Your Payments",
  "Level Up Your Payment Game"
];

export default function PaymentSharePage() {
  const [searchParams] = useSearchParams();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const paymentData = {
    name: searchParams.get('name') || '',
    upiId: searchParams.get('upiId') || '',
    amount: searchParams.get('amount') || '',
    description: searchParams.get('description') || ''
  };

  const title = `Pay ${paymentData.name}${paymentData.amount ? ` - ₹${paymentData.amount}` : ''} | UPI2QR`;
  const description = `Payment request from ${paymentData.name}${paymentData.amount ? ` for ₹${paymentData.amount}` : ''}${paymentData.description ? `: ${paymentData.description}` : ''}`;

  // Format number with commas
  const formatNumber = (num: string) => {
    if (!num) return '';
    const number = parseFloat(num);
    return new Intl.NumberFormat('en-IN').format(number);
  };

  // Generate UPI URL
  const upiUrl = `upi://pay?pa=${paymentData.upiId}&pn=${encodeURIComponent(paymentData.name)}${paymentData.amount ? `&am=${paymentData.amount}` : ''}${paymentData.description ? `&tn=${encodeURIComponent(paymentData.description)}` : ''}`;

  // Updated download handler
  const handleDownloadQR = async () => {
    trackEvent(
      'download_qr',
      'download',
      'Download QR code'
    );
    // Get the card content without buttons
    const cardContent = document.getElementById('downloadable-card');
    
    if (cardContent) {
      try {
        const canvas = await html2canvas(cardContent, {
          backgroundColor: 'white',
          scale: 2, // For better quality
          removeContainer: true,
        });
        
        const link = document.createElement('a');
        link.download = `pay-${paymentData.name.toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  // Enhanced share functionality
  const handleShare = async () => {
    trackEvent(
      'share_payment',
      'sharing',
      'Share payment page'
    );
    const shareUrl = window.location.href;
    const shareData = {
      title: `Pay ${paymentData.name}`,
      text: `Payment request from ${paymentData.name}${paymentData.amount ? ` for ₹${paymentData.amount}` : ''}`,
      url: shareUrl
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile && navigator.share && navigator.canShare(shareData)) {
        // Use native share on mobile if available
        await navigator.share(shareData);
      } else {
        // Desktop or fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Payment link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback
      await navigator.clipboard.writeText(shareUrl);
      alert('Payment link copied to clipboard!');
    }
  };

  // Get random CTA variation
  const [ctaText] = useState(() => 
    CTA_VARIATIONS[Math.floor(Math.random() * CTA_VARIATIONS.length)]
  );

  // Handle embed code copy
  const handleCopyEmbed = async (size: 'small' | 'medium' | 'large') => {
    try {
      setSelectedSize(size);
      await navigator.clipboard.writeText(getEmbedCode(size));
      setCopyState('copied');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy embed code');
    }
  };

  const [showEmbed, setShowEmbed] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copyState === 'copied') {
      const timer = setTimeout(() => setCopyState('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyState]);

  // Single getEmbedCode function
  const getEmbedCode = (size: 'small' | 'medium' | 'large' = selectedSize) => {
    const sizes = {
      small: { width: 300, height: 400 },
      medium: { width: 400, height: 600 },
      large: { width: 500, height: 700 }
    };
    
    const { width, height } = sizes[size];
    
    return `<!-- UPI Payment Widget -->
<iframe 
  src="${window.location.href}"
  width="${width}"
  height="${height}"
  style="border: 1px solid #E5E7EB; border-radius: 8px; max-width: 100%;"
  title="UPI Payment - ${paymentData.name}"
  loading="lazy"
></iframe>`;
  };

  const handlePayment = async () => {
    const payment = {
      name: paymentData.name,
      upiId: paymentData.upiId,
      amount: paymentData.amount,
      timestamp: Date.now()
    };

    if (!navigator.onLine) {
      try {
        await addPendingPayment(payment);
        
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          await (registration as any).sync.register('sync-payments');
          toast.success('Payment will be processed when online');
        } else {
          localStorage.setItem('pendingPayment', JSON.stringify(payment));
          toast.info('Payment saved. Please retry when online.');
        }
      } catch (error) {
        console.error('Failed to queue payment:', error);
        toast.error('Failed to save payment');
      }
    } else {
      try {
        // Your payment processing logic
        toast.success('Payment processed successfully');
      } catch (error) {
        console.error('Payment failed:', error);
        toast.error('Payment failed. Please try again.');
      }
    }
  };

  // Add online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      // Process any pending payments stored in localStorage
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        try {
          const payment = JSON.parse(pendingPayment);
          // Process payment
          localStorage.removeItem('pendingPayment');
          toast.success('Pending payment processed');
        } catch (error) {
          console.error('Failed to process pending payment:', error);
          toast.error('Failed to process pending payment');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleCreateNewPayment = () => {
    navigate('/create');
  };

  const [showAppSelector, setShowAppSelector] = useState(false);

  // Replace the direct UPI URL opening with app selector
  const handlePayWithApp = () => {
    setShowAppSelector(true);
  };

  // Add message listener for online status
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ONLINE_STATUS' && event.data.online) {
        // Process any pending payments when we're back online
        processPendingPayments();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md">
        {/* Downloadable content */}
        <div id="downloadable-card" className="bg-white p-4 sm:p-6 rounded-lg">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold mb-2">Pay {paymentData.name}</h1>
            {paymentData.amount && (
              <p className="text-3xl font-bold text-primary">
                ₹{formatNumber(paymentData.amount)}
              </p>
            )}
            {paymentData.description && (
              <p className="text-muted-foreground mt-2 break-words text-sm">
                {paymentData.description}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[256px] mx-auto">
              <QRCodeSVG 
                value={upiUrl}
                size={256}
                level="H"
                includeMargin={true}
                className="w-full h-auto"
              />
            </div>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 mb-2">
              Scan with any UPI app to pay
            </p>
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              UPI ID: {paymentData.upiId}
            </p>
          </div>
        </div>

        {/* Interactive elements (not included in download) */}
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
            <Button 
              variant="outline" 
              className="group hover:border-primary hover:bg-primary/5 transition-all duration-300 h-auto py-2 px-2 sm:px-3"
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4 mr-1.5 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
              <span className="group-hover:text-primary transition-colors duration-300 text-sm whitespace-nowrap">
                Save
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="group hover:border-primary hover:bg-primary/5 transition-all duration-300 h-auto py-2 px-2 sm:px-3"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-1.5 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
              <span className="group-hover:text-primary transition-colors duration-300 text-sm whitespace-nowrap">
                Share
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="group hover:border-primary hover:bg-primary/5 transition-all duration-300 h-auto py-2 px-2 sm:px-3"
              onClick={() => setShowEmbed(!showEmbed)}
            >
              <Code className="w-4 h-4 mr-1.5 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
              <span className="group-hover:text-primary transition-colors duration-300 text-sm whitespace-nowrap">
                Embed
              </span>
            </Button>
          </div>

          <Button 
            className="w-full mt-4 group hover:bg-primary/90 transition-all duration-300 h-auto py-2.5"
            onClick={handlePayWithApp}
          >
            <Smartphone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm whitespace-nowrap">Pay with UPI</span>
          </Button>

          <UpiAppSelector
            open={showAppSelector}
            onClose={() => setShowAppSelector(false)}
            paymentData={{
              upiId: paymentData.upiId,
              name: paymentData.name,
              amount: paymentData.amount,
              description: paymentData.description
            }}
          />

          {/* Collapsible Embed Section */}
          {showEmbed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Embed Size</span>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      className={`h-8 px-2 transition-colors duration-200 ${
                        selectedSize === size 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-primary/10 hover:text-primary'
                      }`}
                      onClick={() => setSelectedSize(size as 'small' | 'medium' | 'large')}
                    >
                      <span className="text-xs capitalize">{size}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {getEmbedCode()}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className={`w-full mt-3 transition-all duration-200 ${
                  copyState === 'copied' 
                    ? 'bg-green-50 border-green-500 text-green-600' 
                    : ''
                }`}
                onClick={() => handleCopyEmbed(selectedSize)}
                disabled={copyState === 'copied'}
              >
                {copyState === 'copied' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Copy Embed Code
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full hover:bg-primary/5 transition-colors duration-200"
            onClick={handleCreateNewPayment}
          >
            {ctaText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 