export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center flex-wrap justify-center">
            <span>Built with ❤️ by</span>
            <a 
              href="https://anuragvishwakarma.webflow.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors ml-1 sm:ml-2"
            >
              Anurag Vishwakarma
            </a>
          </div>
          <div className="text-[10px] sm:text-xs text-center">
            © {new Date().getFullYear()} UPI2QR. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}