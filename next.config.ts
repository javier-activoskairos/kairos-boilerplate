import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Imágenes remotas permitidas por proyecto (añadir dominios del cliente).
  images: {
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
