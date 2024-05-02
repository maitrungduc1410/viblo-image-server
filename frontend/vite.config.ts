import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const createProxyConfig = (width: number) => ({
  target: "http://imgproxy:8080",
  changeOrigin: true,
  rewrite: (path: string) => {
    const filename = path.split("/").pop();
    return `/insecure/resize:fit:${width}:0:no:0/plain/http://backend:3000/images/${filename}`;
  },
});

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://backend:3000",
      "/images/full": {
        target: "http://backend:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/images\/full/, "/images"),
      },
      "/images/tiny": createProxyConfig(20),
      "/images": createProxyConfig(825),
    },
  },
});
