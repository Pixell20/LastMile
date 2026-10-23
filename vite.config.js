import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The Copilot falls back to a local rule-based answer when /api/copilot is
  // unavailable. If you run the optional API backend, proxy it here:
  // server: { proxy: { '/api': 'http://localhost:3001' } },
});
