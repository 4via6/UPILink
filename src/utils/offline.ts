export const isOffline = () => !navigator.onLine;

export const checkConnectivity = (
  onOnline: () => void,
  onOffline: () => void
) => {
  // Check initial state
  if (!navigator.onLine) {
    onOffline();
  }

  // Add listeners
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Cleanup
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}; 