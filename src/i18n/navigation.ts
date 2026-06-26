import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Wrappers de navegación conscientes del idioma. Usa estos `Link`,
// `useRouter`, etc. en vez de los de `next/navigation`.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
