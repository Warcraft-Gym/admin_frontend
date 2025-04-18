import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        host: true, // Allow access from outside the container (important for Docker)
        port: 5003, // Matches the port exposed by your Dockerfile
        strictPort: true, // Ensures the port is available and does not auto-select another
        proxy: {
            '/api': {
              target: 'http://host.docker.internal:5002',
              changeOrigin: true,
              secure: false,      
              rewrite: path => path.replace(/^\/api/, ''),
            }
          }
      },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
