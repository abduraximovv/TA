import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { VisionSection } from "@/components/landing/VisionSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  return (
    <main style={{ background: "#F9F8F5" }}>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RoadmapSection />
      <VisionSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
