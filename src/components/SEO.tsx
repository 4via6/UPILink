import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({ 
  title = "UPI2QR - Create UPI Payment Pages Instantly",
  description = "Generate shareable UPI payment links and QR codes instantly. No sign-up required. Free forever.",
  image = "/preview.png",
  url = "https://upi2qr.in"
}: SEOProps) {
  const fullUrl = `https://upi2qr.in${url}`;
  const imageUrl = `https://upi2qr.in${image}`;

  useEffect(() => {
    // Update meta tags
    document.title = title;
    
    // Primary Meta Tags
    document.querySelector('meta[name="title"]')?.setAttribute("content", title);
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    
    // Open Graph / Facebook
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", imageUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", fullUrl);
    
    // Twitter
    document.querySelector('meta[property="twitter:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="twitter:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="twitter:image"]')?.setAttribute("content", imageUrl);
    document.querySelector('meta[property="twitter:url"]')?.setAttribute("content", fullUrl);
  }, [title, description, imageUrl, fullUrl]);

  return null;
} 