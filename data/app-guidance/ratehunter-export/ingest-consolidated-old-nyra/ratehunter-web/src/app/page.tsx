import { HeroSection } from '@/components/sections/hero-section';
import { RatesSection } from '@/components/sections/rates-section';
import { CalculatorSection } from '@/components/sections/calculator-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <RatesSection />
      <CalculatorSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
