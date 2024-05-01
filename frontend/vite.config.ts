import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const createProxyConfig = (width: number) => ({
  target: "http://host.docker.internal:8081",
  changeOrigin: true,
  rewrite: (path: string) => {
    const filename = path.split("/").pop();
    return `/insecure/resize:fit:${width}:0:no:0/plain/http://host.docker.internal:3000/images/${filename}`;
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://host.docker.internal:3000",
      "/images/full": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/images\/full/, "/images"),
      },
      "/images/tiny": createProxyConfig(20),
      "/images": createProxyConfig(825),
    },
  },
});
