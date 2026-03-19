import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProblemsSection } from "@/components/ProblemsSection";
import { DifferentialsSection } from "@/components/DifferentialsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { RolesSection } from "@/components/RolesSection";
import { PricingSection } from "@/components/PricingSection";
import { EarlyAccessSection } from "@/components/EarlyAccessSection";
import { Footer } from "@/components/Footer";
import { CheckoutSuccessRedirect } from "@/components/CheckoutSuccessRedirect";

export default function Home() {
  return (
    <main className="min-h-screen bg-arcane-dark">
      <Suspense>
        <CheckoutSuccessRedirect />
      </Suspense>
      <Navbar />
      <HeroSection />
      <ProblemsSection />
      <DifferentialsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
      <PricingSection />
      <EarlyAccessSection />
      <Footer />
    </main>
  );
}
