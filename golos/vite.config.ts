import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiUrl = env.VITE_API_URL?.trim() || '/api';
  if (command === 'build' && !apiUrl.startsWith('/')) {
    const url = new URL(apiUrl);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      throw new Error('Production VITE_API_URL must be /api or an HTTPS API URL, not localhost.');
    }
  }
  if (command === 'build' && apiUrl.startsWith('//')) {
    throw new Error('Production VITE_API_URL must be /api or an explicit HTTPS API URL.');
  }
  return { plugins: [react(), tailwindcss()] };
});
