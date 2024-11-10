import { Button } from './ui/button';
import { motion } from 'framer-motion';

export interface QRColorOption {
  id: string;
  colors: {
    primary: string;
    background: string;
  };
  isGradient?: boolean;
  gradientStops?: string[];
}

const QR_COLOR_OPTIONS: QRColorOption[] = [
  // Solid Colors
  {
    id: 'default',
    colors: {
      primary: '#000000',
      background: '#FFFFFF'
    }
  },
  {
    id: 'indigo',
    colors: {
      primary: '#4F46E5',
      background: '#FFFFFF'
    }
  },
  {
    id: 'forest',
    colors: {
      primary: '#059669',
      background: '#FFFFFF'
    }
  },
  // Gradients
  {
    id: 'sunset',
    colors: {
      primary: '#F59E0B',
      background: '#FFFFFF'
    },
    isGradient: true,
    gradientStops: ['#F59E0B', '#EF4444']
  },
  {
    id: 'ocean',
    colors: {
      primary: '#0EA5E9',
      background: '#FFFFFF'
    },
    isGradient: true,
    gradientStops: ['#0EA5E9', '#6366F1']
  },
  {
    id: 'purple',
    colors: {
      primary: '#8B5CF6',
      background: '#FFFFFF'
    },
    isGradient: true,
    gradientStops: ['#8B5CF6', '#D946EF']
  }
];

interface QRColorPickerProps {
  value: string;
  onChange: (option: QRColorOption) => void;
}

export function QRColorPicker({ value, onChange }: QRColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">QR Code Style</label>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {QR_COLOR_OPTIONS.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant="outline"
            onClick={() => onChange(option)}
            className={`
              h-auto py-2 px-3 flex items-center justify-center 
              transition-all duration-200
              ${value === option.id 
                ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20' 
                : 'hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div 
              className={`
                w-8 h-8 rounded-md overflow-hidden
                ${value === option.id 
                  ? 'ring-2 ring-primary shadow-sm scale-95' 
                  : 'border border-gray-200 shadow-sm hover:shadow-md'
                }
                transition-all duration-200
              `}
            >
              {option.isGradient ? (
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(45deg, ${option.gradientStops?.join(', ')})`
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{ backgroundColor: option.colors.primary }}
                />
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

export { QR_COLOR_OPTIONS };