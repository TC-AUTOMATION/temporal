import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Keep sharp (native module) external so it loads from node_modules at runtime
  // instead of being bundled. Used for server-side image compression.
  serverExternalPackages: ["sharp"],

  // Allow larger request bodies for admin image uploads (camera/phone photos
  // are often several MB each). Default limit is 10MB which truncates the
  // multipart body and breaks FormData parsing.
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },

  // Images are pre-optimized as WebP - skip server-side optimization to avoid CPU overload
  images: {
    unoptimized: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://unpkg.com https://maps.boxtal.com https://kit.fontawesome.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.boxtal.com https://unpkg.com https://ka-f.fontawesome.com https://ka-p.fontawesome.com",
              "font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com https://ka-p.fontawesome.com https://fonts.googleapis.com data:",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.stripe.com https://api.boxtal.com https://maps.boxtal.com https://iam.boxtal.com https://geo.api.gouv.fr https://nominatim.openstreetmap.org https://overpass-api.de",
              "frame-src 'self' https://js.stripe.com https://maps.boxtal.com",
              "worker-src 'self' blob:",
              "media-src 'self' blob: data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
