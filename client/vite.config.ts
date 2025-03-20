import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig, loadEnv } from "vite";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const baseUrl = isProduction 
    ? 'https://codestakes-9f7dui59d-aadis-projects-ee189e65.vercel.app'
    : 'http://localhost:5001';

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: true,
      emptyOutDir: true
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: baseUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    css: {
      postcss: {
        plugins: [tailwind()],
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(baseUrl)
    }
  }
});
