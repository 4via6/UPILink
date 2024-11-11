declare module 'sonner' {
  export interface ToasterProps {
    position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
    richColors?: boolean;
  }

  export function Toaster(props: ToasterProps): JSX.Element;
  
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
} 