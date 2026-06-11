import Hero from "./components/Hero";
import HeroStats from "./components/HeroStats";
import CategoriesGrid from "./components/CategoriesGrid";
import FeaturedProducts from "./components/FeaturedProducts";
import Promotions from "./components/Promotions";
import RecentlyViewed from "./components/RecentlyViewed";
import AdvertisementBanner from "./components/AdvertisementBanner";

export default function Home() {
  return (
    <div className="bg-slate-900 min-h-screen">
      <Hero />
      <CategoriesGrid />
      <HeroStats className="relative sm:hidden border-t border-slate-700" />
      {/* <Promotions /> */}
      {/* <RecentlyViewed /> */}
      <AdvertisementBanner position="center" />
      {/* <FeaturedProducts /> */}
    </div>
  );
}
