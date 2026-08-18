import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/types"],
  async redirects() {
    // /destinations was consolidated into /discover (both listed the same destinations data
    // under two different top-level paths) -- keep old links/bookmarks working.
    return [
      { source: "/destinations", destination: "/discover", permanent: true },
      { source: "/destinations/:slug", destination: "/discover/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      }
    ],
  },
};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'mapbox-tiles',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\/$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'start-url',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
// Trigger dev server restart
