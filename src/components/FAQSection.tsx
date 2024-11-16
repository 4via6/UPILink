import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQs = [
  {
    question: "What is the current UPI transaction limit?",
    answer: "The standard limit for peer-to-peer transactions remains at ₹1 lakh. However, for specific transactions like tax payments and hospital bills, the limit is now ₹5 lakh. Other categories like capital markets and insurance have a daily cap of ₹2 lakh."
  },
  {
    question: "How can I create and use a UPI QR code?",
    answer: "To create a UPI QR code, you need to use a UPI-enabled application that supports QR code generation. Once created, customers can scan this code using their UPI apps to make payments directly to your account."
  },
  {
    question: "Are there any fees associated with high-value UPI transactions?",
    answer: "Currently, there are no fees for personal UPI transactions. However, an interchange fee of up to 1.1% may apply to merchant transactions above ₹2,000 made through payment service providers (PPIs) starting in 2024."
  },
  {
    question: "What should I do if I need to make a payment exceeding my bank's limit?",
    answer: "If you need to make a payment exceeding your bank's limit, consider splitting the payment into multiple UPI transactions."
  },
  {
    question: "What should I do if my transaction fails?",
    answer: "If your transaction fails, the amount will usually be refunded back to your account within a few hours. If you do not receive the refund within this timeframe, contact your bank's customer support for assistance."
  },
  {
    question: "How do I ensure my transactions are secure while using UPI?",
    answer: "To ensure security while using UPI:\n• Never share your UPI PIN with anyone.\n• Use only trusted apps and websites for transactions.\n• Immediately block your mobile number if it gets lost or stolen to prevent unauthorized access."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: isOpen ? "hsl(var(--primary) / 0.05)" : "transparent" }}
      className="border-b border-border/50 last:border-0 rounded-lg transition-colors duration-200"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start justify-between w-full py-4 px-4 sm:px-6 text-left hover:bg-muted/50 rounded-lg transition-colors duration-200"
      >
        <span className="font-medium text-sm sm:text-base pr-4">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {answer.split('\n').map((line, index) => (
                <p 
                  key={index} 
                  className={`${line.startsWith('•') ? 'pl-4 relative before:content-["•"] before:absolute before:left-0' : ''} ${index > 0 ? 'mt-2' : ''}`}
                >
                  {line.startsWith('•') ? line.substring(1) : line}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Everything you need to know about UPI payments and transaction limits
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border shadow-sm p-2 sm:p-4 space-y-2">
          {FAQs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>
      </motion.div>
    </div>
  );
} 