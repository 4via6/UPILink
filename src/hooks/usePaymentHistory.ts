import { useState, useEffect } from 'react';

const STORAGE_KEY = 'upi-link-history';
const MAX_HISTORY = 10;

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

export function usePaymentHistory() {
  const [history, setHistory] = useState<PaymentHistory[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: PaymentHistory[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  // Add new entry
  const addToHistory = (entry: Omit<PaymentHistory, 'id' | 'createdAt' | 'isPinned'>) => {
    const newEntry: PaymentHistory = {
      ...entry,
      id: Date.now().toString(),
      createdAt: Date.now(),
      isPinned: false
    };

    const newHistory = [newEntry, ...history.filter(item => item.isPinned)]
      .concat(history.filter(item => !item.isPinned))
      .slice(0, MAX_HISTORY);

    saveHistory(newHistory);
  };

  // Delete entry
  const deleteEntry = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  // Toggle pin status
  const togglePin = (id: string) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    );
    
    // Reorder to keep pinned items at top
    const pinnedItems = newHistory.filter(item => item.isPinned);
    const unpinnedItems = newHistory.filter(item => !item.isPinned);
    saveHistory([...pinnedItems, ...unpinnedItems]);
  };

  // Clear all history
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    deleteEntry,
    togglePin,
    clearHistory
  };
} 