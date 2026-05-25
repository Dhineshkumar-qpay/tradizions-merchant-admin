import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api"),
      'process.env.NEXT_PUBLIC_IMAGE_URL': JSON.stringify(env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3003"),
    }
  };
})
