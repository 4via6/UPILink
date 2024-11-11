import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { PaymentHistorySection } from '@/components/PaymentHistorySection';
import { PaymentHistory } from '@/types/payment';
import { useAnalytics } from '@/hooks/useAnalytics';

// Updated UPI App configurations
const UPI_APPS = [
  { name: 'PhonePe', handle: '@ybl' },
  { name: 'Google Pay', handle: '@okicici' },
  { name: 'Paytm', handle: '@paytm' },
  { name: 'BHIM', handle: '@upi' },
  { name: 'Amazon Pay', handle: '@apl' },
  { name: 'CRED', handle: '@axisb' }
];

export default function CreatePage() {
  const navigate = useNavigate();
  const { history, addToHistory, deleteEntry, togglePin, clearHistory } = usePaymentHistory();
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    upiHandle: '',
    amount: '',
    description: ''
  });
  const { trackEvent } = useAnalytics();

  // Handle UPI app selection with toggle functionality
  const handleUpiAppSelect = (handle: string) => {
    // Track UPI app selection
    trackEvent(
      'select_upi_app',
      'interaction',
      handle
    );

    // If clicking the same handle again, deselect it
    if (handle === formData.upiHandle) {
      setFormData({
        ...formData,
        upiHandle: '',
        upiId: formData.upiId.split('@')[0] // Keep only the base ID
      });
    } else {
      const baseId = formData.upiId.includes('@') 
        ? formData.upiId.split('@')[0] 
        : formData.upiId;
      setFormData({
        ...formData,
        upiHandle: handle,
        upiId: baseId ? `${baseId}${handle}` : ''
      });
    }
  };

  // Handle UPI ID input
  const handleUpiIdChange = (value: string) => {
    if (!formData.upiHandle) {
      // No UPI app selected, allow full UPI ID input
      setFormData({
        ...formData,
        upiId: value
      });
    } else {
      // UPI app selected, only allow base ID
      const cleanValue = value.split('@')[0];
      setFormData({
        ...formData,
        upiId: formData.upiHandle ? `${cleanValue}${formData.upiHandle}` : cleanValue
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission
    trackEvent(
      'create_payment_page',
      'payment',
      `Created by ${formData.name}`,
      formData.amount ? parseFloat(formData.amount) : undefined
    );

    const params = new URLSearchParams({
      name: formData.name,
      upiId: formData.upiId,
      ...(formData.amount && { amount: formData.amount }),
      ...(formData.description && { description: formData.description })
    });

    const url = `/pay?${params.toString()}`;

    // Add to history
    addToHistory({
      name: formData.name,
      upiId: formData.upiId,
      amount: formData.amount,
      description: formData.description,
      url
    });

    navigate(url);
  };

  const handleHistoryClick = (item: PaymentHistory) => {
    navigate(item.url);
  };

  const handleClone = (item: PaymentHistory) => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Update to include upiHandle
    setFormData({
      name: item.name,
      upiId: item.upiId,
      upiHandle: '', // Reset handle when cloning
      amount: item.amount || '',
      description: item.description || ''
    });

    formRef.current?.classList.add('highlight-animation');
    setTimeout(() => {
      formRef.current?.classList.remove('highlight-animation');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Form Section */}
        <div 
          ref={formRef}
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-16 transition-all duration-300"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Create Payment Page</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Name Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* UPI ID Input with App Selection */}
            <div className="space-y-3 sm:space-y-4">
              <Label htmlFor="upiId">UPI ID</Label>
              
              {/* UPI Apps Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {UPI_APPS.map((app) => (
                  <Button
                    key={app.handle}
                    type="button"
                    variant={formData.upiHandle === app.handle ? "default" : "outline"}
                    className={`h-auto py-2 sm:py-3 px-3 sm:px-4 flex flex-col items-center gap-0.5 sm:gap-1 transition-all duration-200
                      ${formData.upiHandle === app.handle ? 'ring-2 ring-primary/20' : 'hover:bg-primary/5'}`}
                    onClick={() => handleUpiAppSelect(app.handle)}
                  >
                    <span className="text-xs sm:text-sm font-medium">{app.name}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{app.handle}</span>
                  </Button>
                ))}
              </div>

              {/* UPI ID Input Field with Updated Placeholder */}
              <div className="relative">
                <Input
                  id="upiId"
                  placeholder={formData.upiHandle ? "Enter UPI ID" : "Enter UPI ID with @handle"}
                  value={formData.upiHandle ? formData.upiId.split('@')[0] : formData.upiId}
                  onChange={(e) => handleUpiIdChange(e.target.value)}
                  required
                  className="pr-20 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                {formData.upiHandle && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.upiHandle}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4" />
                {formData.upiHandle 
                  ? "Enter your UPI ID" 
                  : "Select UPI app or enter complete UPI ID"}
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-7 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Leave empty to let payer decide the amount
              </p>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Payment Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Payment for services"
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setFormData({ ...formData, description: e.target.value })
                  }
                }}
                maxLength={50}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Add a note for the payment</span>
                <span>{formData.description.length}/50</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-10 sm:h-12 text-base sm:text-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Generate Payment Page
            </Button>
          </form>
        </div>

        {/* History Section */}
        <div className="relative">
          <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-background pointer-events-none" />
          <PaymentHistorySection
            history={history}
            onDelete={deleteEntry}
            onPin={togglePin}
            onClear={clearHistory}
            onClick={handleHistoryClick}
            onClone={handleClone}
          />
        </div>
      </motion.div>
    </div>
  );
}