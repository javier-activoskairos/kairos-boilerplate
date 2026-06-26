import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Rutas del sitio (sin prefijo de idioma). Añadir aquí cada página nueva.
const paths = [""];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    routing.locales.map((locale) => {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      return {
        url: `${siteUrl}${prefix}${path ? `/${path}` : ""}`,
        lastModified: new Date(),
      };
    }),
  );
}
