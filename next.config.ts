import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://unpkg.com https://maps.boxtal.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.boxtal.com",
              "font-src 'self' https://fonts.gstatic.com",
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
