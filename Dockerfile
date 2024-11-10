# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create types directory and declaration file
RUN mkdir -p src/types && \
    echo "declare module 'html2canvas/dist/html2canvas.js' { const html2canvas: any; export default html2canvas; }" > src/types/html2canvas.d.ts

# Remove unused UI components and QRColorPicker
RUN rm -rf src/components/ui/accordion.tsx \
    src/components/ui/alert-dialog.tsx \
    src/components/ui/aspect-ratio.tsx \
    src/components/ui/avatar.tsx \
    src/components/ui/breadcrumb.tsx \
    src/components/ui/calendar.tsx \
    src/components/ui/carousel.tsx \
    src/components/ui/chart.tsx \
    src/components/ui/checkbox.tsx \
    src/components/ui/collapsible.tsx \
    src/components/ui/command.tsx \
    src/components/ui/context-menu.tsx \
    src/components/ui/dialog.tsx \
    src/components/ui/drawer.tsx \
    src/components/ui/dropdown-menu.tsx \
    src/components/ui/form.tsx \
    src/components/ui/hover-card.tsx \
    src/components/ui/input-otp.tsx \
    src/components/ui/menubar.tsx \
    src/components/ui/navigation-menu.tsx \
    src/components/ui/pagination.tsx \
    src/components/ui/popover.tsx \
    src/components/ui/progress.tsx \
    src/components/ui/radio-group.tsx \
    src/components/ui/resizable.tsx \
    src/components/ui/scroll-area.tsx \
    src/components/ui/select.tsx \
    src/components/ui/separator.tsx \
    src/components/ui/sheet.tsx \
    src/components/ui/slider.tsx \
    src/components/ui/sonner.tsx \
    src/components/ui/switch.tsx \
    src/components/ui/tabs.tsx \
    src/components/ui/toast.tsx \
    src/components/ui/toggle-group.tsx \
    src/components/ui/toggle.tsx \
    src/components/ui/tooltip.tsx \
    src/components/ui/toaster.tsx \
    src/hooks/use-toast.ts \
    src/pages/PaymentPage.tsx \
    src/components/QRColorPicker.tsx

# Install additional dependencies
RUN npm install html2canvas qrcode.react

# Build the app
RUN npm run build

# Run stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies and serve
RUN npm install --production && \
    npm install -g serve

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Use serve instead of Vite preview
CMD ["serve", "-s", "dist", "-l", "3000"]