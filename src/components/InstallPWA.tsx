import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    // Clear the deferredPrompt for the next time
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 sm:h-9 group"
      onClick={handleInstall}
    >
      <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
      <span className="text-xs sm:text-sm">Install App</span>
    </Button>
  );
} 