import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '10.0.0.12', // Ensure this is the desired IP address
    port: 3000, // Set the port to 3000
    strictPort: true, // Ensures the server uses the specified port or fails
  },
  build: {
    rollupOptions: {
      // Specify entry if needed, typically not required for basic setups
      // input: '/path/to/your/index.html', // Uncomment and set the correct path if necessary
    }
  },
  optimizeDeps: {
    // Uncomment and add dependencies that need pre-bundling if necessary
    // include: ['your-dependency']
  }
});