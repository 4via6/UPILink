import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Share2, Smartphone, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');

  const name = searchParams.get('name');
  const upiId = searchParams.get('upiId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!name || !upiId) {
      navigate('/create');
      return;
    }

    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}${
      amount ? `&am=${amount}` : ''
    }&cu=INR`;

    QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then(setQrCode)
      .catch(console.error);
  }, [name, upiId, amount, navigate]);

  const handleShare = async () => {
    const shareData = {
      title: `Pay ${name}`,
      text: `Pay ${name} via UPI`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Payment link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handlePayViaApp = () => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}${
      amount ? `&am=${amount}` : ''
    }&cu=INR`;
    window.location.href = upiUrl;
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold mb-4">Pay {name}</h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span>UPI ID: {upiId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyUpiId}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {amount && <span className="ml-2">• Amount: ₹{amount}</span>}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              {qrCode && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <img
                    src={qrCode}
                    alt="Payment QR Code"
                    className="rounded-lg"
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <Button
                className="w-full group"
                onClick={handlePayViaApp}
              >
                <Smartphone className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Pay via UPI App
              </Button>

              <Button
                variant="outline"
                className="w-full group"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Share Payment Link
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}