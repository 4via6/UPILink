import { ArrowRight, Zap, Shield, Share2, CheckCircle2, Sparkles, Globe, Clock, Users, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { SEO } from '@/components/SEO';
import { FAQSection } from '@/components/FAQSection';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const illustrations = [
    '/SVG/DrawKit_Vector_Illustrations_Call waiting.svg',
    '/SVG/DrawKit_Vector_Illustrations_Cat shot.svg',
    '/SVG/DrawKit_Vector_Illustrations_Coffe call.svg',
    '/SVG/DrawKit_Vector_Illustrations_Dog call.svg',
    '/SVG/DrawKit_Vector_Illustrations_Podcast.svg',
    '/SVG/DrawKit_Vector_Illustrations_Selfie.svg',
    '/SVG/DrawKit_Vector_Illustrations_Shopping call.svg',
    '/SVG/DrawKit_Vector_Illustrations_Video park.svg'
  ];

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const promises = illustrations.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        setIsImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    loadImages();
  }, []);

  // Auto rotate illustrations only after loading
  useEffect(() => {
    if (!isImagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % illustrations.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isImagesLoaded]);

  // Stats data
  const stats = [
    { value: "100%", label: "Secure" },
    { value: "0₹", label: "Free Forever" },
    { value: "5 Sec", label: "Setup Time" },
    { value: "24/7", label: "Available" },
    { value: "No Ads", label: "Clean UI" },
    { value: "Instant", label: "QR Code" }
  ];

  const handleMouseEnter = () => {
    const scrollingElement = document.querySelector('.animate-scroll') as HTMLElement;
    if (scrollingElement) {
      // Get the current transform value
      const computedStyle = window.getComputedStyle(scrollingElement);
      const matrix = new WebKitCSSMatrix(computedStyle.transform);
      
      // Apply the current position as a style
      scrollingElement.style.transform = `translateX(${matrix.m41}px)`;
      scrollingElement.style.animationPlayState = 'paused';
    }
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    const scrollingElement = document.querySelector('.animate-scroll') as HTMLElement;
    if (scrollingElement) {
      // Remove the inline styles to resume animation
      scrollingElement.style.transform = '';
      scrollingElement.style.animationPlayState = 'running';
    }
    setIsPaused(false);
  };

  return (
    <>
      <SEO />
      <div className="bg-background overflow-x-hidden w-full">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 text-center max-w-full"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter mb-4 sm:mb-6">
            Create Your UPI Payment Page
            <span className="text-primary"> in Seconds</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8">
            Generate shareable payment links and QR codes instantly. No sign-up required.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/create')}
            className="group bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200"
          >
            Create Payment Page
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Enhanced Hero Illustration Section with Fixed Bleeding */}
          <div className="mt-12 sm:mt-16 mx-auto relative">
            {/* Container to prevent bleeding */}
            <div className="absolute inset-0 -mx-4 bg-background" /> {/* Background fix */}

            <div className="relative max-w-5xl mx-auto">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/20 blur-2xl opacity-10" />

              {/* Main Content Container */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-primary/10">
                {/* Stats Bar with Infinite Scroll */}
                <div className="relative mx-auto max-w-[calc(100vw-2rem)] overflow-hidden">
                  <div className="relative -mx-4 px-4">
                    {/* Gradient Fade Effect on Edges */}
                    <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background via-background to-transparent z-20" />
                    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background via-background to-transparent z-20" />
                    
                    {/* Scrollable Container */}
                    <div className="overflow-hidden">
                      <div 
                        className="flex gap-3 pb-4 px-2 scroll-smooth animate-scroll"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleMouseEnter}
                        onTouchEnd={handleMouseLeave}
                      >
                        {/* First set */}
                        {stats.map((stat, index) => (
                          <motion.div
                            key={`stat-1-${index}`}
                            className="flex-shrink-0 w-[200px] p-3 rounded-2xl bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">{stat.value}</h4>
                            <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{stat.label}</p>
                          </motion.div>
                        ))}
                        
                        {/* Second set */}
                        {stats.map((stat, index) => (
                          <motion.div
                            key={`stat-2-${index}`}
                            className="flex-shrink-0 w-[200px] p-3 rounded-2xl bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">{stat.value}</h4>
                            <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Illustration Container */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isImagesLoaded ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  {/* Main Illustration */}
                  <div className="relative h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                    {illustrations.map((src, index) => (
                      <motion.div
                        key={src}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ 
                          opacity: currentImageIndex === index ? 1 : 0,
                          scale: currentImageIndex === index ? 1 : 0.95,
                          zIndex: currentImageIndex === index ? 1 : 0
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 80,
                          damping: 20
                        }}
                        className="absolute inset-0 flex items-center justify-center p-4"
                      >
                        <img 
                          src={src}
                          alt={`Illustration ${index + 1}`}
                          className="w-full h-full object-contain"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {illustrations.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === index 
                            ? 'w-6 bg-primary' 
                            : 'bg-primary/30 hover:bg-primary/50'
                        }`}
                        aria-label={`Go to illustration ${index + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section with better mobile layout */}
        <div className="bg-muted py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Zap className="h-10 w-10 text-primary" />,
                  title: "Instant Setup",
                  description: "Create your payment page in seconds. No registration required."
                },
                {
                  icon: <Shield className="h-10 w-10 text-primary" />,
                  title: "Secure",
                  description: "Direct UPI payments. We don't store any sensitive information."
                },
                {
                  icon: <Share2 className="h-10 w-10 text-primary" />,
                  title: "Easy Sharing",
                  description: "Share your payment link or QR code instantly with anyone."
                },
                {
                  icon: <Globe className="h-10 w-10 text-primary" />,
                  title: "Works Everywhere",
                  description: "Compatible with all UPI apps and devices."
                },
                {
                  icon: <Clock className="h-10 w-10 text-primary" />,
                  title: "Always Available",
                  description: "Your payment page is accessible 24/7."
                },
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "For Everyone",
                  description: "Perfect for individuals, freelancers, and small businesses."
                },
              ].map((feature, index) => (
                <FeatureCard
                  key={index}
                  {...feature}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section with improved styling */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="relative max-w-4xl mx-auto">
              {/* Connection Line with improved visibility */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/30 -translate-y-1/2 hidden md:block" />
              
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  {
                    number: "1",
                    title: "Enter Details",
                    description: "Add your name and UPI ID",
                    icon: <CheckCircle2 className="h-6 w-6" />
                  },
                  {
                    number: "2",
                    title: "Get QR Code",
                    description: "Instantly generate your payment QR",
                    icon: <Sparkles className="h-6 w-6" />
                  },
                  {
                    number: "3",
                    title: "Share & Receive",
                    description: "Share link and receive payments",
                    icon: <Share2 className="h-6 w-6" />
                  },
                ].map((step, index) => (
                  <StepCard
                    key={index}
                    {...step}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-20 overflow-hidden"
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-primary/10 blur-2xl opacity-20" />

            <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-primary/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Ready to Get Started?
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Create your UPI payment page now and start accepting payments in seconds. No registration required.
                  </p>
                </div>

                <div className="flex flex-col gap-4 w-full sm:w-auto">
                  <Button
                    size="lg"
                    onClick={() => navigate('/create')}
                    className="group bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 h-12 px-8"
                  >
                    Create Payment Page
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <span className="text-xs text-center text-muted-foreground">
                    Free forever • No sign up needed
                  </span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
            </div>
          </div>
        </motion.div>

        {/* PWA Feature Section */}
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="flex justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <WifiOff className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Works Offline
            </h2>
            
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Install UPI2QR on your device and use it anytime, even without internet. Create payment pages seamlessly in offline mode.
            </p>

            <div className="inline-flex items-center gap-2 text-sm text-primary bg-primary/5 px-4 py-2 rounded-full">
              <Smartphone className="h-4 w-4" />
              <span>Install app to use offline</span>
            </div>
          </motion.div>
        </div>

        {/* Add FAQ Section before footer */}
        <FAQSection />
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description, index }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.3,
          duration: 0.8,
          delay: index * 0.1
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="bg-background p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="bg-primary/10 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description, icon, index }: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.3,
          duration: 0.8,
          delay: index * 0.2
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="relative bg-background p-6 sm:p-8 rounded-xl border border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className="text-3xl sm:text-4xl font-bold text-primary/20">{number}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </motion.div>
  );
}