import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/start/vite';

export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    tsconfigPaths(),
  ],
});
