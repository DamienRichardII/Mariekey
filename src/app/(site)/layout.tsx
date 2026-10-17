import { BottomNav } from "@/components/site/bottom-nav";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getSalonSettings } from "@/lib/data/salon";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSalonSettings();
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white">
        Aller au contenu
      </a>
      <Header social={settings?.social ?? null} />
      <main id="contenu" className="pt-16 pb-20 lg:pt-[72px] lg:pb-0">{children}</main>
      <Footer settings={settings} />
      <BottomNav />
    </>
  );
}
