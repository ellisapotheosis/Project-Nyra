import Link from 'next/link';

const professionalLinks = [
  {
    href: 'https://www.westcapitallending.com/team/Ellis-Andersen',
    label: 'View My Profile',
    icon: '👤',
    description: 'West Capital Lending team page'
  },
  {
    href: 'https://www.westcapitallending.com/',
    label: 'West Capital Lending',
    icon: '🏢',
    description: 'Company information & credentials'
  },
  {
    href: 'https://heloc.westcapitallending.com/account/heloc/register?referrer=c6b56b11-3f54-4719-83bc-964085a31e87',
    label: 'Fixed Rate HELOC Quote',
    icon: '🏠',
    description: 'Get your HELOC quote now'
  },
];

export function AboutSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-16" id="about">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        {/* Content */}
        <div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            About Ellis & West Capital Lending
          </h2>

          <div className="space-y-4 text-slate-300">
            <p>
              At West Capital Lending, I shop around with <strong className="text-cyan-300">hundreds of approved lenders and investors wholesale pricing</strong> to secure the best rates and terms — so you don't have to. With an <strong className="text-emerald-300">A+ BBB rating and five-star reviews</strong> across multiple platforms, our reputation speaks for itself.
            </p>

            <p>
              Whether you're purchasing your first home, a commercial property, or seeking cash-out options like <strong className="text-violet-300">HELOCs, reverse mortgages, or hard-cash money loans</strong>, I custom-tailor each loan to fit your unique financial profile.
            </p>

            <p>
              Our <strong className="text-fuchsia-300">closing times are substantially faster than industry averages</strong>, ensuring a seamless experience from start to finish.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-emerald-800 bg-emerald-900/20 p-3">
              <p className="text-xs uppercase tracking-widest text-emerald-400">BBB Rating</p>
              <p className="text-xl font-semibold text-emerald-300">A+</p>
            </div>
            <div className="rounded-lg border border-violet-800 bg-violet-900/20 p-3">
              <p className="text-xs uppercase tracking-widest text-violet-400">Reviews</p>
              <p className="text-xl font-semibold text-violet-300">5 Stars</p>
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-100 mb-4">
            Professional Resources
          </h3>

          {professionalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition hover:border-cyan-400/50 hover:bg-slate-800/60 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{link.icon}</span>
                <div>
                  <p className="font-medium text-slate-100 group-hover:text-cyan-300 transition">
                    {link.label}
                  </p>
                  <p className="text-sm text-slate-400">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Contact CTA */}
          <div className="mt-6 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-400/10 to-violet-400/10 p-6">
            <p className="font-medium text-slate-100 mb-2">
              Ready to get started?
            </p>
            <p className="text-sm text-slate-300 mb-4">
              Call or text me directly for a personalized rate quote
            </p>
            <div className="flex gap-3">
              <Link
                href="tel:+9493783133"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-cyan-400"
              >
                📱 Call (949) 378-3133
              </Link>
              <Link
                href="sms:+9493783133"
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
              >
                💬 Text Me
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
