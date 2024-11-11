interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
  sync: SyncManager;
}

interface Window {
  SyncManager: SyncManager;
} 