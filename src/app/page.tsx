import { StoreNav } from "@/features/store/components/StoreNav";
import { Hero } from "@/features/store/components/Hero";
import { MissionSection } from "@/features/store/components/MissionSection";
import { ProductGrid } from "@/features/store/components/ProductGrid";
import { SizeGuide } from "@/features/store/components/SizeGuide";
import { PreOrderPanel } from "@/features/store/components/PreOrderPanel";
import { StoreFooter } from "@/features/store/components/StoreFooter";
import { CartDrawer } from "@/features/store/components/CartDrawer";

export default function Home() {
  return (
    <div className="ic-store min-h-screen">
      <StoreNav />
      <Hero />
      <MissionSection />
      <ProductGrid />
      <SizeGuide />
      <PreOrderPanel />
      <StoreFooter />
      <CartDrawer />
    </div>
  );
}
