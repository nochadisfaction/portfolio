import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://aabdoo23.vercel.app",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    sitemap({
      serialize: (/** @type {{ url: string; [key: string]: any }} */ item) => {
        const url = item.url.endsWith("/") ? item.url.slice(0, -1) : item.url;
        return { ...item, url };
      },
    }),
  ],

  output: "server",
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
});
