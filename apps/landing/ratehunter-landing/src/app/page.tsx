import { LeadCaptureWizard } from '@/components/LeadCaptureWizard';
import { BorrowerChatWidget } from '@/components/BorrowerChatWidget';
import { 
  Shield, Zap, Star, CheckCircle, 
  ArrowRight, Phone, MessageSquare, Mail 
} from 'lucide-react';

const serviceLines = [
  {
    title: 'Purchase Mortgage Strategy',
    body: 'Conventional, FHA, VA, and Jumbo planning built around payment comfort and timeline readiness.',
  },
  {
    title: 'Refinance & Equity',
    body: 'Cash-out and rate-and-term optimization with a plain-language breakdown of your break-even timing.',
  },
  {
    title: 'Real Estate Coordination',
    body: 'One advisor for financing and property search so you are never bouncing between silos.',
  },
  {
    title: 'Next-Gen Speed',
    body: 'Powered by Nyra AI for instant quotes and 24/7 document guidance.',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tighter">RateHunter</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#wizard" className="hover:text-primary transition-colors">Get Quote</a>
            <a href="tel:+18005550199" className="flex items-center text-primary">
              <Phone className="h-4 w-4 mr-2" /> (800) 555-0199
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Powered by Project Nyra AI</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground">
              Mortgage guidance that feels <span className="text-primary italic">personal</span>.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Get an instant, professional quote powered by the industry's most advanced AI engine. 
              No pressure. No silos. Just the numbers you need to move with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Instant Soft-Quote</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>TCPA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure Data Handling</span>
              </div>
            </div>
          </div>

          <div id="wizard" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <LeadCaptureWizard />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight">One front door for financing.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've replaced the generic "compare rates" treatment with a professional, AI-assisted advisory experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceLines.map((s, i) => (
              <div key={i} className="p-8 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <Shield className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
          <span className="font-bold text-2xl tracking-tighter">WEST CAPITAL</span>
          <span className="font-bold text-2xl tracking-tighter">FANNIE MAE</span>
          <span className="font-bold text-2xl tracking-tighter">FREDDIE MAC</span>
          <span className="font-bold text-2xl tracking-tighter">VA APPROVED</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex justify-center items-center space-x-2 grayscale opacity-50">
            <Zap className="h-5 w-5" />
            <span className="text-lg font-bold tracking-tighter">RateHunter</span>
          </div>
          <p className="text-[10px] text-muted-foreground max-w-3xl mx-auto leading-relaxed uppercase tracking-widest">
            RateHunter is a project nyra implementation. Mortgage services provided by licensed partners. 
            Rates and terms are subject to credit approval and market conditions. 
            Ellis D Andersen | NMLS# 2145025 | Equal Housing Opportunity.
          </p>
        </div>
      </footer>

      <BorrowerChatWidget />
    </main>
  );
}
