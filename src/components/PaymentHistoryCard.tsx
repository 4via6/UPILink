import { PaymentHistory } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Pin, Trash2, ExternalLink, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface PaymentHistoryCardProps {
  item: PaymentHistory;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onClick: (item: PaymentHistory) => void;
  onClone: (item: PaymentHistory) => void;
}

export function PaymentHistoryCard({ item, onDelete, onPin, onClick, onClone }: PaymentHistoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onDelete(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDeleting ? 0 : 1, 
        y: isDeleting ? 20 : 0,
        scale: isDeleting ? 0.95 : 1
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        bg-gray-50 rounded-xl p-4 
        shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] 
        hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.15)] 
        transition-all duration-200
        border border-gray-200
        h-[180px]
        flex flex-col
        ${item.isPinned ? 'bg-primary/5 border-primary/20' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="min-h-[52px]">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{item.upiId}</p>
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClone(item)}
            className="text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors duration-200"
            title="Clone payment"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPin(item.id)}
            className={`
              hover:bg-primary/10 transition-colors duration-200
              ${item.isPinned ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary'}
            `}
          >
            <Pin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow min-h-[40px] py-2">
        {item.amount && (
          <p className="text-sm font-medium text-gray-900">₹{item.amount}</p>
        )}
        
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-auto">
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(item.createdAt, { addSuffix: true })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClick(item)}
          className="text-primary hover:bg-primary/10 transition-colors duration-200"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          <span className="text-sm">Open</span>
        </Button>
      </div>
    </motion.div>
  );
} 