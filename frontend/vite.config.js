import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },

    build: {
        // Warn if any single chunk exceeds 600 KB
        chunkSizeWarningLimit: 600,

        rollupOptions: {
            output: {
                // Split large vendor libraries into separate cached chunks
                manualChunks: {
                    // React core — cached forever, changes almost never
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],

                    // Animation library — large, separate chunk
                    'vendor-motion': ['framer-motion'],

                    // Chart library — only loaded on analytics pages
                    'vendor-charts': ['recharts'],

                    // PDF generation — only loaded on demand
                    'vendor-pdf': ['jspdf', 'jspdf-autotable'],

                    // Icons — medium sized, shared across many pages
                    'vendor-icons': ['react-icons'],

                    // Socket.io client — real-time features
                    'vendor-socket': ['socket.io-client'],
                },
            },
        },
    },
});
