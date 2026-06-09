import { getSafeRedirectPath } from "@/lib/safe-redirect";

describe("getSafeRedirectPath", () => {
  it("keeps relative application paths", () => {
    expect(getSafeRedirectPath("/pipeline?lead=123")).toBe(
      "/pipeline?lead=123"
    );
  });

  it("falls back for empty or external values", () => {
    expect(getSafeRedirectPath(null, "/fallback")).toBe("/fallback");
    expect(getSafeRedirectPath("", "/fallback")).toBe("/fallback");
    expect(getSafeRedirectPath("https://evil.example")).toBe("/");
    expect(getSafeRedirectPath("//evil.example")).toBe("/");
  });

  it("falls back for backslash path smuggling", () => {
    expect(getSafeRedirectPath("/\\evil.example")).toBe("/");
  });
});
