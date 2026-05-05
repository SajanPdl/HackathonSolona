import {
  Navbar,
  TrustSection,
  HowItWorksSection,
  FeaturesSection,
  ArchitectureSection,
  UseCasesSection,
  AgentCTASection,
  FinalCTASection,
  Footer,
} from '@/components/Landing';
import { CinematicLanding } from '@/components/CinematicLanding';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <CinematicLanding />
      <TrustSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ArchitectureSection />
      <UseCasesSection />
      <AgentCTASection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}