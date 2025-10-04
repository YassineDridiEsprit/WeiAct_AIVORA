// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/classify': {
//         target: 'http://127.0.0.1:8000',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/classify/, '/classify'),
//       },
//       '/quantify': {
//         target: 'http://127.0.0.1:8000',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/quantify/, '/quantify'),
//       },
//       '/api': {
//         target: 'http://localhost:8000',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//       },
//     },
//   },
// });

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/classify': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/classify/, '/classify'),
      },
      '/quantify': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/quantify/, '/quantify'),
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Remove rewrite to preserve /api prefix
      },
    },
  },
});