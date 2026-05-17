import Link from "next/link";

const professionalLinks = [
  {
    href: "https://www.westcapitallending.com/team/Ellis-Andersen",
    label: "View My Profile",
    icon: "👤",
    description: "West Capital Lending team page",
  },
  {
    href: "https://www.westcapitallending.com/",
    label: "West Capital Lending",
    icon: "🏢",
    description: "Company information & credentials",
  },
  {
    href: "https://heloc.westcapitallending.com/account/heloc/register?referrer=c6b56b11-3f54-4719-83bc-964085a31e87",
    label: "Fixed Rate HELOC Quote",
    icon: "🏠",
    description: "Get your HELOC quote now",
  },
];

export function AboutSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24" id="about">
      <div className="grid gap-16 lg:grid-cols-2 items-center">
        {/* Content */}
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div>
            <p className="text-turquoise-500 text-[10px] font-black tracking-[0.2em] uppercase mb-3">
              Professional_Biography
            </p>
            <h2 className="text-4xl font-black text-foreground uppercase tracking-tight leading-none">
              Ellis Andersen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-turquoise-400 italic">
                West Capital Lending
              </span>
            </h2>
          </div>

          <div className="space-y-6 text-sm font-medium text-muted-foreground leading-relaxed uppercase tracking-tight opacity-80">
            <p>
              At West Capital Lending, I shop around with{" "}
              <strong className="text-indigo-400 font-black">
                hundreds of approved lenders and investors wholesale pricing
              </strong>{" "}
              to secure the best rates and terms — so you don't have to.
            </p>

            <p>
              Whether you're purchasing your first home, a commercial property,
              or seeking cash-out options like{" "}
              <strong className="text-turquoise-400 font-black">
                HELOCs, reverse mortgages, or hard-cash money loans
              </strong>
              , I custom-tailor each loan to fit your unique financial profile.
            </p>

            <p>
              With an{" "}
              <strong className="text-turquoise-400 font-black">
                A+ BBB rating and five-star reviews
              </strong>{" "}
              across multiple platforms, our reputation speaks for itself. Our
              closing times are substantially faster than industry averages.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="rounded-2xl border border-turquoise-500/20 bg-turquoise-500/5 p-6 shadow-2xl border-t-2 border-t-turquoise-500 group hover:bg-turquoise-500/10 transition-colors">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-turquoise-400 transition-colors">
                BBB Rating
              </p>
              <p className="mt-2 text-3xl font-black text-foreground">A+</p>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-2xl border-t-2 border-t-indigo-500 group hover:bg-indigo-500/10 transition-colors">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors">
                Reviews
              </p>
              <p className="mt-2 text-3xl font-black text-foreground">
                5_STARS
              </p>
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="space-y-6 lg:pl-12">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-4">
            REGISTRY_RESOURCE_UPLINKS
          </h3>

          {professionalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-3xl border border-border/40 bg-card/20 p-6 transition-all hover:bg-indigo-500/5 hover:border-indigo-500/30 group shadow-2xl border-l-2 border-l-turquoise-500"
            >
              <div className="flex items-center gap-6">
                <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-inner">
                  {link.icon}
                </div>
                <div>
                  <p className="font-black text-foreground uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Contact CTA */}
          <div className="mt-10 rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-xl p-8 shadow-2xl border-b-2 border-b-pink-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-2xl -z-10" />
            <p className="font-black text-foreground uppercase tracking-tight text-xl mb-2 italic">
              DIRECT_OPERATOR_ACCESS
            </p>
            <p className="text-[10px] font-bold text-muted-foreground mb-8 uppercase tracking-widest opacity-60">
              Uplink via cellular or SMS for immediate scenario review.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="tel:+9493783133"
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-95"
              >
                📱 CALL_NODE: (949)_378-3133
              </Link>
              <Link
                href="sms:+9493783133"
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-turquoise-500/30 bg-turquoise-500/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-turquoise-400 shadow-xl transition-all hover:bg-turquoise-500/10 active:scale-95"
              >
                💬 SMS_UPLINK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
