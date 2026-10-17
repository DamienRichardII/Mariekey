import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos envoyées depuis l'administration (Supabase Storage, bucket public site-media).
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Envoi de photos depuis /admin/photos.
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
