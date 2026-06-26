import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("Home");
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">404</h1>
      <Link href="/" className="mt-4 text-sm underline underline-offset-4">
        {t("ctaPrimary")}
      </Link>
    </div>
  );
}
