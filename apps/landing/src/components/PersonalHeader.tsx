import Link from 'next/link';

interface ContactLink {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}

const contactLinks: ContactLink[] = [
  {
    href: 'tel:+9493783133',
    icon: '📱',
    label: 'Call Me',
  },
  {
    href: 'sms:+9493783133',
    icon: '💬',
    label: 'Text Me',
  },
  {
    href: 'https://app.wavecnct.com/ellis.andersen.myo8',
    icon: '📇',
    label: 'Save Contact',
    external: true,
  },
  {
    href: 'https://instagram.com/ellisapotheosis',
    icon: '📷',
    label: 'Instagram',
    external: true,
  },
  {
    href: 'https://www.linkedin.com/in/ellisandersen/',
    icon: '💼',
    label: 'LinkedIn',
    external: true,
  },
];

export function PersonalHeader() {
  return (
    <header className="relative border-b border-border/40 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Personal Branding */}
          <div className="flex items-center gap-5 group">
            <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white text-xl font-black italic">E</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">Ellis Andersen</h1>
              <p className="text-[10px] font-bold text-turquoise-400 uppercase tracking-[0.2em] mt-0.5">
                West Capital Lending · Mortgage Partner
              </p>
            </div>
          </div>

          {/* Contact Links */}
          <div className="flex gap-3 flex-wrap">
            {contactLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex h-9 items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 text-[10px] font-black uppercase tracking-widest text-indigo-300 transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-400 shadow-sm"
                {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
