import { expect, it, describe, vi } from 'vitest';
// @ts-ignore
import LeadCockpitPage from '../../../apps/webapp/app/app/leads/[id]/page';

describe('Lead Cockpit Page', () => {
  it('should exist and be a function', () => {
    expect(LeadCockpitPage).toBeDefined();
    expect(typeof LeadCockpitPage).toBe('function');
  });
});
