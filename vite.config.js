import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/SpeedyScheduler/",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "Speedy Scheduler",
        short_name: "Speedy",

        description:
          "A shared race weekend schedule, spotter's guide, checklist, and planning app.",

        theme_color: "#151515",
        background_color: "#f3f4f6",

        display: "standalone",

        start_url: "/SpeedyScheduler/#/",
        scope: "/SpeedyScheduler/",

        orientation: "portrait-primary",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "index.html",

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,json}",
        ],

        cleanupOutdatedCaches: true,
      },
    }),
  ],
});