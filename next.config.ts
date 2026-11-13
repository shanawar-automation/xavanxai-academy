import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // The AI interview room needs camera, microphone and screen capture on our own origin.
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pdf-parse", "mammoth"],
  experimental: {
    // tree-shake big icon barrel imports → smaller, faster bundles
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
