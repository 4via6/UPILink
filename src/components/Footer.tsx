import { Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Main Footer Content */}
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with ❤️ by</span>
              <a 
                href="https://anuragvishwakarma.webflow.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Anurag Vishwakarma
              </a>
            </div>
            
            <a 
              href="mailto:support@upi2qr.in"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <Mail className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span>support@upi2qr.in</span>
            </a>

            {/* Copyright */}
            <div className="text-[10px] sm:text-xs text-muted-foreground/80">
              © {currentYear} UPI2QR. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}