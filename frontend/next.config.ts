import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Liste des domaines autorisés (méthode simple)
    domains: [
      "culturesetpatrimoines.bj",
      "if-benin.com",
      "www.if-benin.com",
      "www.events-booster.com",
      "uopujgrfvaxfdrzqlwdm.supabase.co",
    ],

    // OU méthode plus flexible avec des patterns (recommandée)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "culturesetpatrimoines.bj",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "if-benin.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.if-benin.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.events-booster.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.uopujgrfvaxfdrzqlwdm.supabase.co",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
