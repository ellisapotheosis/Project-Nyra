import { resolveTenantFromHost, sanitizeTenantId } from '@/utils/tenant';

describe('tenant resolution', () => {
  it('uses default tenant for localhost', () => {
    expect(resolveTenantFromHost('localhost')).toBe('ratehunter');
  });

  it('resolves pages.dev subdomain tenant', () => {
    expect(resolveTenantFromHost('broker-alpha.pages.dev')).toBe('broker-alpha');
  });

  it('sanitizes invalid tenant characters', () => {
    expect(sanitizeTenantId('Broker_$#@!')).toBe('roker');
  });
});
