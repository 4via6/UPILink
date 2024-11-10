import { PaymentHistory } from '@/hooks/usePaymentHistory';
import { PaymentHistoryCard } from './PaymentHistoryCard';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash } from 'lucide-react';
import { useState } from 'react';

interface PaymentHistorySectionProps {
  history: PaymentHistory[];
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onClear: () => void;
  onClick: (item: PaymentHistory) => void;
  onClone: (item: PaymentHistory) => void;
}

export function PaymentHistorySection({
  history,
  onDelete,
  onPin,
  onClear,
  onClick,
  onClone
}: PaymentHistorySectionProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setIsClearing(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      onClear();
    }
  };

  if (history.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative -mt-8"
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Recent Payment Pages</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className={`
              text-gray-500 hover:text-red-500 hover:bg-red-50 
              transition-colors duration-200
              ${isClearing ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <Trash className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>
      
      <motion.div 
        className="grid gap-4 sm:grid-cols-2"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {history.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <PaymentHistoryCard
                item={item}
                onDelete={onDelete}
                onPin={onPin}
                onClick={onClick}
                onClone={onClone}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 