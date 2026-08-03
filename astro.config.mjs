import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://tora.dev",
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/arml/") }),
    react(),
  ],
  output: 'static',
});