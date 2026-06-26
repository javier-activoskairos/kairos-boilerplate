import { defineRouting } from "next-intl/routing";

// Idiomas que sirve la web. El idioma por defecto se sirve en `/`,
// el resto con prefijo (`/en`, `/fr`, ...). Ajustar por proyecto.
export const routing = defineRouting({
  locales: ["es", "en", "fr", "it", "pt"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});
