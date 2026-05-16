import Link from 'next/link';

const socialLinks = [
  {
    href: 'https://instagram.com/ellisapotheosis',
    label: 'Instagram',
    icon: 'IG'
  },
  {
    href: 'https://www.linkedin.com/in/ellisandersen/',
    label: 'LinkedIn',
    icon: 'LI'
  },
];

const quickLinks = [
  {
    href: '#rates',
    label: 'Current Rates'
  },
  {
    href: '#about',
    label: 'About Ellis'
  },
  {
    href: '#news',
    label: 'Market News'
  },
  {
    href: 'https://www.westcapitallending.com/team/Ellis-Andersen',
    label: 'Professional Profile',
    external: true
  },
];

export function PersonalFooter() {
  return (
    <footer className="relative border-t border-border/40 bg-black/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
              UPLINK_STATION
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-5 group">
                <div className="p-2.5 rounded-xl bg-turquoise-500/10 border border-turquoise-500/20 text-turquoise-400 shadow-inner group-hover:scale-110 transition-transform">📱</div>
                <div>
                  <Link
                    href="tel:+9493783133"
                    className="text-lg font-black text-foreground uppercase tracking-tight hover:text-turquoise-400 transition-colors"
                  >
                    (949) 378-3133
                  </Link>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">DIRECT_CELL_NODE</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">🏢</div>
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight">West Capital Lending</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">NMLS_LICENSED_BROKER</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 shadow-inner group-hover:scale-110 transition-transform">⭐</div>
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight">A+ BBB_REGISTRY_RATING</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">5_STAR_PLATFORM_VERIFIED</p>
                </div>
              </div>
            </div>

            {/* Save Contact */}
            <div className="pt-4">
              <Link
                href="https://app.wavecnct.com/ellis.andersen.myo8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-95"
              >
                📇 SAVE_CONTACT_BUFFER
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-turquoise-400">
              NAVIGATION_ROUTES
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-black text-muted-foreground hover:text-turquoise-400 transition-colors uppercase tracking-tight"
                    {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* HELOC Special */}
            <div className="mt-8 rounded-3xl border border-turquoise-500/20 bg-turquoise-500/5 p-6 shadow-2xl border-t-2 border-t-turquoise-500 group">
              <h4 className="text-xs font-black text-turquoise-400 uppercase tracking-widest mb-2 group-hover:scale-105 transition-transform origin-left">
                FIXED_RATE_HELOC_ACCESS
              </h4>
              <p className="text-[10px] font-bold text-muted-foreground mb-6 uppercase tracking-tight opacity-70">
                Competitive pricing engine for equity extraction.
              </p>
              <Link
                href="https://heloc.westcapitallending.com/account/heloc/register?referrer=c6b56b11-3f54-4719-83bc-964085a31e87"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-turquoise-400 hover:text-turquoise-300 transition-colors"
              >
                INITIALIZE_QUOTE →
              </Link>
            </div>
          </div>

          {/* Social & Legal */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">
              CONNECT_&_COMPLIANCE
            </h3>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-card/20 text-xs font-black text-muted-foreground transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-400 shadow-xl"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            {/* Legal Text */}
            <div className="space-y-4 text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-tight opacity-40">
              <div className="flex items-center gap-4 mb-2">
                 <div className="size-8 rounded bg-white/10 flex items-center justify-center font-black text-white border border-white/20">EHO</div>
                 <div className="size-8 rounded bg-white/10 flex items-center justify-center font-black text-white border border-white/20">NMLS</div>
              </div>
              <p>
                Ellis Andersen NMLS #2275661 · West Capital Lending NMLS #1664448.
              </p>
              <p>
                Equal Housing Lender. NMLS Consumer Access.
                Licensed by the Department of Financial Protection and Innovation.
              </p>
              <p>
                Rates and terms subject to change without notice.
                Not all applicants will qualify.
              </p>
              <p>
                This is not a commitment to lend.
                Programs, rates, terms and conditions are subject to change without notice.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-20 pt-10 border-t border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
              © 2026 Ellis Andersen, West Capital Lending. ALL_RIGHTS_RESERVED.
            </p>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] bg-indigo-500/5 px-4 py-1.5 rounded-full border border-indigo-500/10">
              RateHunter_Platform · Powered_by_Distributed_Inference
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
