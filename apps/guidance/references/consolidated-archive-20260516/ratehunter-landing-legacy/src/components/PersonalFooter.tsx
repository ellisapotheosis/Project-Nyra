import Link from "next/link";

const socialLinks = [
  {
    href: "https://instagram.com/ellisapotheosis",
    label: "Instagram",
    icon: "IG",
  },
  {
    href: "https://www.linkedin.com/in/ellisandersen/",
    label: "LinkedIn",
    icon: "LI",
  },
];

const quickLinks = [
  {
    href: "#rates",
    label: "Current Rates",
  },
  {
    href: "#about",
    label: "About Ellis",
  },
  {
    href: "#news",
    label: "Market News",
  },
  {
    href: "https://www.westcapitallending.com/team/Ellis-Andersen",
    label: "Professional Profile",
    external: true,
  },
];

export function PersonalFooter() {
  return (
    <footer className="relative border-t border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Contact Ellis Andersen
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-cyan-400">📱</span>
                <div>
                  <Link
                    href="tel:+9493783133"
                    className="text-slate-300 hover:text-cyan-300 transition"
                  >
                    (949) 378-3133
                  </Link>
                  <p className="text-xs text-slate-500">Call or text</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-cyan-400">🏢</span>
                <div>
                  <p className="text-slate-300">West Capital Lending</p>
                  <p className="text-xs text-slate-500">
                    NMLS Licensed Mortgage Broker
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-cyan-400">⭐</span>
                <div>
                  <p className="text-slate-300">A+ BBB Rating</p>
                  <p className="text-xs text-slate-500">
                    5-star reviews across platforms
                  </p>
                </div>
              </div>
            </div>

            {/* Save Contact */}
            <div className="mt-6">
              <Link
                href="https://app.wavecnct.com/ellis.andersen.myo8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white transition hover:from-violet-400 hover:to-fuchsia-400"
              >
                📇 Save My Contact Info
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-cyan-300 transition text-sm"
                    {...(link.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* HELOC Special */}
            <div className="mt-6 rounded-lg border border-emerald-800 bg-emerald-900/20 p-4">
              <h4 className="font-medium text-emerald-300 mb-2">
                Fixed Rate HELOC Available
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                Get competitive rates on home equity lines of credit
              </p>
              <Link
                href="https://heloc.westcapitallending.com/account/heloc/register?referrer=c6b56b11-3f54-4719-83bc-964085a31e87"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 hover:text-emerald-200 transition"
              >
                Get HELOC Quote →
              </Link>
            </div>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Connect & Legal
            </h3>

            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-sm font-medium text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            {/* Legal Text */}
            <div className="space-y-3 text-xs text-slate-500">
              <p>
                Equal Housing Lender. NMLS Consumer Access. Licensed by the
                Department of Financial Protection and Innovation.
              </p>
              <p>
                Rates and terms subject to change without notice. Not all
                applicants will qualify.
              </p>
              <p>
                This is not a commitment to lend. Programs, rates, terms and
                conditions are subject to change without notice.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              © 2026 Ellis Andersen, West Capital Lending. All rights reserved.
            </p>
            <p className="text-sm text-slate-500 mt-2 sm:mt-0">
              RateHunter Platform - Powered by Nyra
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
