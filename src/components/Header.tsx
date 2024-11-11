import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Twitter } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg sm:text-xl">
          <span className="font-bold">UPI</span>
          <span className="font-normal">2QR</span>
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" className="h-8 sm:h-9" asChild>
            <a
              href="https://x.com/anurag_30"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Twitter
            </a>
          </Button>
          <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm" asChild>
            <Link to="/create">Create Page</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}