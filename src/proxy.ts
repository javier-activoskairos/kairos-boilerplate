import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Convención `proxy` de Next.js 16 (sustituye a `middleware`).
export default createMiddleware(routing);

export const config = {
  // Aplica el routing de idioma a todo salvo API, internos y archivos estáticos.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
