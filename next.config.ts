import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      { source: '/code/session_:id', destination: '/code/session/:id' },
    ];
  },
};

export default nextConfig;
