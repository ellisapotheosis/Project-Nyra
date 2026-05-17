import Link from "next/link";

interface ContactLink {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}

const contactLinks: ContactLink[] = [
  {
    href: "tel:+9493783133",
    icon: "📱",
    label: "Call Me",
  },
  {
    href: "sms:+9493783133",
    icon: "💬",
    label: "Text Me",
  },
  {
    href: "https://app.wavecnct.com/ellis.andersen.myo8",
    icon: "📇",
    label: "Save Contact",
    external: true,
  },
  {
    href: "https://instagram.com/ellisapotheosis",
    icon: "📷",
    label: "Instagram",
    external: true,
  },
  {
    href: "https://www.linkedin.com/in/ellisandersen/",
    icon: "💼",
    label: "LinkedIn",
    external: true,
  },
];

export function PersonalHeader() {
  return (
    <header className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Personal Branding */}
          <div>
            <h1 className="text-xl font-bold text-slate-100">Ellis Andersen</h1>
            <p className="text-sm text-cyan-300">
              Your Trusted Mortgage Partner – Tailored Solutions, Unmatched
              Service
            </p>
            <p className="text-xs text-slate-400 mt-1">
              West Capital Lending | NMLS Licensed | A+ BBB Rating
            </p>
          </div>

          {/* Contact Links */}
          <div className="flex gap-2 flex-wrap">
            {contactLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/20 hover:border-cyan-400/50"
                {...(link.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
