import { openDB } from 'idb';

const DB_NAME = 'UPI2QR';
const DB_VERSION = 1;

export interface PendingPayment {
  id?: number;
  name: string;
  upiId: string;
  amount: string;
  timestamp: number;
}

export async function openDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pendingPayments')) {
        db.createObjectStore('pendingPayments', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
    },
  });
}

export async function addPendingPayment(payment: PendingPayment) {
  const db = await openDB();
  return db.add('pendingPayments', {
    ...payment,
    timestamp: Date.now()
  });
}

export async function getPendingPayments() {
  const db = await openDB();
  return db.getAll('pendingPayments');
}

export async function removePendingPayment(id: number) {
  const db = await openDB();
  return db.delete('pendingPayments', id);
} 