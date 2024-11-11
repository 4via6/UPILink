export const isOffline = () => !navigator.onLine;

export const checkConnectivity = (online: () => void, offline: () => void) => {
  window.addEventListener('online', online);
  window.addEventListener('offline', offline);

  return () => {
    window.removeEventListener('online', online);
    window.removeEventListener('offline', offline);
  };
}; 