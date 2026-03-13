import { QuoteForm } from "@/components/quote-form";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { RateTable } from "@/components/rate-table";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <section id="quote-form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Get Your Personalized Quote
            </h2>
            <p className="text-xl text-gray-600">
              Compare rates from top lenders in seconds - no impact to your credit score
            </p>
          </div>
          <QuoteForm />
        </div>
      </section>
      <RateTable />
      <Features />
      <Testimonials />
      <Footer />
    </main>
  );
}
