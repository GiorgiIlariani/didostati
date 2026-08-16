import Hero from "./components/Hero";
import HeroStats from "./components/HeroStats";
import CategoriesGrid from "./components/CategoriesGrid";
import AdvertisementBanner from "./components/AdvertisementBanner";
import HowToOrder from "./components/HowToOrder";

export default function Home() {
  return (
    <div className="bg-slate-900 min-h-screen">
      <Hero />
      <CategoriesGrid />
      <HowToOrder />
      <HeroStats className="relative sm:hidden border-t border-slate-700" />
      <AdvertisementBanner position="center" />
    </div>
  );
}
