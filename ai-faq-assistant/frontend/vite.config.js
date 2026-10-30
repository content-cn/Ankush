import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server proxies /api -> Flask on :5000, so the browser makes same-origin
// calls and we need no CORS handling on the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:5001" },
  },
});
