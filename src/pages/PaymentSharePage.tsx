import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Smartphone, Code, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import html2canvas from 'html2canvas/dist/html2canvas.js';
import { useState, useEffect } from 'react';

// Add CTA variations
const CTA_VARIATIONS = [
  {
    title: "Create Your Own Payment Page",
    description: "Start accepting UPI payments in seconds"
  },
  {
    title: "Need Your Own Payment Link?",
    description: "Create your personalized UPI payment page instantly"
  },
  {
    title: "Want to Accept UPI Payments?",
    description: "Generate your payment page in one click"
  },
  {
    title: "Create Payment Page",
    description: "Get your own UPI payment link & QR code"
  }
];

export default function PaymentSharePage() {
  const [searchParams] = useSearchParams();
  
  const paymentData = {
    name: searchParams.get('name') || '',
    upiId: searchParams.get('upiId') || '',
    amount: searchParams.get('amount') || '',
    description: searchParams.get('description') || ''
  };

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
  const randomCTA = CTA_VARIATIONS[Math.floor(Math.random() * CTA_VARIATIONS.length)];

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
            onClick={() => window.location.href = upiUrl}
          >
            <Smartphone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm whitespace-nowrap">Pay with UPI</span>
          </Button>

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

        <CardFooter className="flex flex-col gap-3 sm:gap-4 border-t bg-gray-50/50 mt-4 sm:mt-6 py-4 sm:py-6">
          <Button 
            variant="outline" 
            className="w-full hover:bg-primary hover:text-primary-foreground transition-colors h-auto py-2.5"
            onClick={() => window.location.href = '/create'}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            <span className="text-sm whitespace-nowrap">{randomCTA.title}</span>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {randomCTA.description}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 