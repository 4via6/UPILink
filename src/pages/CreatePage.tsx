import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Updated UPI App configurations with correct handles
const UPI_APPS = [
  { name: 'PhonePe', handle: '@ybl' },
  { name: 'Google Pay', handle: '@okaxis' },
  { name: 'Paytm', handle: '@paytm' },
  { name: 'BHIM', handle: '@upi' },
  { name: 'Amazon Pay', handle: '@apl' },
  { name: 'CRED', handle: '@axisb' }
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    upiHandle: '',
    amount: '',
    description: ''
  });

  // Handle UPI app selection
  const handleUpiAppSelect = (handle: string) => {
    const baseId = formData.upiId.split('@')[0];
    setFormData({
      ...formData,
      upiHandle: handle,
      upiId: baseId ? `${baseId}${handle}` : ''
    });
  };

  // Handle UPI ID input
  const handleUpiIdChange = (value: string) => {
    // Remove any existing handles
    const cleanValue = value.split('@')[0];
    setFormData({
      ...formData,
      upiId: formData.upiHandle ? `${cleanValue}${formData.upiHandle}` : cleanValue
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams({
      name: formData.name,
      upiId: formData.upiId,
      ...(formData.amount && { amount: formData.amount }),
      ...(formData.description && { description: formData.description })
    });

    navigate(`/pay?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
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
                  className={`
                    h-auto py-2 sm:py-3 px-3 sm:px-4 
                    flex flex-col items-center gap-0.5 sm:gap-1 
                    transition-all duration-200
                    ${formData.upiHandle === app.handle 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/20 hover:bg-primary/90' 
                      : 'hover:bg-primary/5 hover:border-primary/30'
                    }
                  `}
                  onClick={() => handleUpiAppSelect(app.handle)}
                >
                  <span className={`text-xs sm:text-sm font-medium ${
                    formData.upiHandle === app.handle 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'
                  }`}>
                    {app.name}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${
                    formData.upiHandle === app.handle 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {app.handle}
                  </span>
                </Button>
              ))}
            </div>

            {/* UPI ID Input Field */}
            <div className="relative">
              <Input
                id="upiId"
                placeholder="Enter your UPI ID"
                value={formData.upiId.split('@')[0] || ''}
                onChange={(e) => handleUpiIdChange(e.target.value)}
                required
                className="h-10 sm:h-11 text-sm sm:text-base pr-20 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground">
                {formData.upiHandle}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1.5 sm:mt-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Select your UPI app and enter your ID carefully
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
                if (e.target.value.length <= 100) {
                  setFormData({ ...formData, description: e.target.value })
                }
              }}
              maxLength={100}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Add a note for the payment</span>
              <span>{formData.description.length}/100</span>
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
      </motion.div>
    </div>
  );
}