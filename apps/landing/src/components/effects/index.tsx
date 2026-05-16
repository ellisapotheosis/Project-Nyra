import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes } from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function TrustGlowCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('rh-trust-glow-card', className)} {...props}>
      {children}
    </div>
  );
}

export function SubtleMovingButton({
  className,
  children,
  href,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href) {
    return (
      <a className={cx('rh-subtle-moving-button', className)} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={cx('rh-subtle-moving-button', className)} {...props}>
      {children}
    </button>
  );
}

export function RateHunterLeadFormFrame({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('rh-lead-form-frame', className)} {...props}>
      {children}
    </div>
  );
}

export function SoftAuroraSection({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cx('rh-soft-aurora-section', className)} {...props}>
      {children}
    </section>
  );
}

export function MortgageProcessBeam({ className, steps, ...props }: HTMLAttributes<HTMLDivElement> & { steps: string[] }) {
  return (
    <div className={cx('rh-process-beam', className)} {...props}>
      {steps.map((step, index) => (
        <div className="rh-process-step" key={step}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <p>{step}</p>
        </div>
      ))}
    </div>
  );
}
