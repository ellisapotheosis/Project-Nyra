const ORIGINAL_ENV = process.env;

describe("Supabase env helpers", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns null when public config is missing or placeholder-only", async () => {
    const { getSupabasePublicConfig } = await import("@/lib/supabase/env");

    expect(getSupabasePublicConfig()).toBeNull();

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://api.projectnyra.com";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "replace-me";

    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("falls back to anon key when publishable key is empty", async () => {
    const { getSupabasePublicConfig } = await import("@/lib/supabase/env");

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://api.projectnyra.com";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";

    expect(getSupabasePublicConfig()).toEqual({
      anonKey: "anon-test-key",
      url: "https://api.projectnyra.com",
    });
  });

  it("detects service role readiness without accepting placeholders", async () => {
    const { getSupabaseServiceRoleKey } =
      await import("@/lib/supabase/server-env");

    expect(getSupabaseServiceRoleKey()).toBeNull();

    process.env.SUPABASE_SERVICE_ROLE_KEY = "replace-me";
    expect(getSupabaseServiceRoleKey()).toBeNull();

    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
    expect(getSupabaseServiceRoleKey()).toBe("service-role-test-key");
  });
});
