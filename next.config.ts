import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React strict mode for catching issues early in dev
  reactStrictMode: true,

  // Production source maps off (faster builds, smaller output)
  productionBrowserSourceMaps: false,

  // Compression
  compress: true,

  // Tree-shake & optimize package imports for these heavy libs
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-progress",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "recharts",
      "date-fns",
    ],
  },

  // Bundle external native deps so Next.js doesn't try to bundle them client-side
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "bcryptjs"],

  // Logging
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
