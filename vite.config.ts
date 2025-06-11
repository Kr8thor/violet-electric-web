import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { wordpressContentPlugin } from "./vite-plugins/wordpress-content-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'dist'
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // WordPress content fetcher (runs during build)
    wordpressContentPlugin({
      apiUrl: 'https://wp.violetrainwater.com',
      fallbackContent: {
        hero_title: 'Change the Channel.',
        hero_subtitle_line2: 'Change Your Life.',
        hero_subtitle: 'Transform your potential with neuroscience-backed strategies and heart-centered leadership. Discover the power within you to create extraordinary results.',
        hero_cta: 'Book Violet',
        hero_cta_secondary: 'Watch Violet in Action'
      }
    }),
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
