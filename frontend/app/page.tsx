import Hero from "./components/Hero";
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
      <Promotions />
      <RecentlyViewed />
      <AdvertisementBanner position="center" />
      <FeaturedProducts />
    </div>
  );
}
