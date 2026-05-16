const DEFAULT_TENANT = 'ratehunter';

export function resolveTenantFromHost(hostname: string): string {
  if (!hostname) return DEFAULT_TENANT;

  const normalized = hostname.toLowerCase();
  if (normalized === 'localhost' || normalized === '127.0.0.1') {
    return DEFAULT_TENANT;
  }

  if (normalized.endsWith('.pages.dev')) {
    const [subdomain] = normalized.split('.');
    return sanitizeTenantId(subdomain);
  }

  const [subdomain] = normalized.split('.');
  return sanitizeTenantId(subdomain);
}

export function sanitizeTenantId(raw: string): string {
  const sanitized = raw.replace(/[^a-z0-9-]/g, '').slice(0, 48);
  return sanitized || DEFAULT_TENANT;
}
