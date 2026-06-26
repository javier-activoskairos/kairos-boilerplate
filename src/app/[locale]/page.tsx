import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const features = [
    { title: t("feature1Title"), body: t("feature1Body") },
    { title: t("feature2Title"), body: t("feature2Body") },
    { title: t("feature3Title"), body: t("feature3Body") },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-semibold tracking-tight">Kairos</span>
        <LocaleSwitcher />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <span className="text-muted-foreground mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
          {t("badge")}
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-lg text-pretty">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg">{t("ctaPrimary")}</Button>
          <Button size="lg" variant="outline">
            {t("ctaSecondary")}
          </Button>
        </div>

        <section className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="text-left">
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {f.body}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="text-muted-foreground px-6 py-8 text-center text-xs sm:px-10">
        {t("featuresTitle")}
      </footer>
    </div>
  );
}
