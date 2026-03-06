// frontend/src/app/landing/page.tsx
import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import PricingSection from "../../components/landing/PricingSection";
import FAQSection from "../../components/landing/FAQSection";
import CTABanner from "../../components/landing/CTABanner";
import TestimonialsSection from "../../components/landing/TestimonialsSection";
import { HowItWorks } from "@/src/components/landing/HowItWorks";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTABanner />
    </>
  );
}