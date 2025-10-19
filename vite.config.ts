import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // 👇 base correta para o GitHub Pages (nome do repositório)
  base: mode === "production" ? "/Resi/" : "/",

  server: {
    host: true,
    port: 8080,
    https: process.env.VITE_HTTPS === "1" ? true : false,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
