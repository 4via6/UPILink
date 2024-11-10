export interface PaymentHistory {
  id: string;
  name: string;
  upiId: string;
  amount?: string;
  description?: string;
  createdAt: number;
  url: string;
  isPinned: boolean;
} 