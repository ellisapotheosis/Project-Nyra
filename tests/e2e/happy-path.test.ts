import { expect, test } from "@playwright/test";

test.describe("Project Nyra - Happy Path Smoke Test", () => {
  test.skip(
    process.env.NYRA_E2E_HAPPY_PATH !== "1",
    "Set NYRA_E2E_HAPPY_PATH=1 after owner-gated app, CRM, and auth setup is ready."
  );

  test("should navigate through core platform flows", async ({ page }) => {
    const projectNyraUrl =
      process.env.PROJECTNYRA_E2E_URL || "http://localhost:3000";
    const rateHunterUrl =
      process.env.RATEHUNTER_E2E_URL || "http://localhost:3001";

    await page.goto(rateHunterUrl);
    await expect(page).toHaveTitle(/RateHunter/i);

    await page.goto(projectNyraUrl);
    await expect(page.getByText(/Broker Command Deck/i)).toBeVisible();
    await expect(page.getByText(/Live System Status/i)).toBeVisible();

    await page.goto(`${projectNyraUrl}/leads/1`);
    await expect(page.getByText(/Lead Intelligence/i)).toBeVisible();
    await expect(page.getByText(/Campaign Orchestration/i)).toBeVisible();

    await page.goto(`${projectNyraUrl}/quotes`);
    await expect(page.getByText(/Quote Desk/i)).toBeVisible();
    await expect(page.getByText(/Scenario Architect/i)).toBeVisible();

    await page.goto(`${projectNyraUrl}/admin/integrations`);
    await expect(page.getByText(/Integrations Hub/i)).toBeVisible();
    await expect(page.getByText(/Twenty CRM/i)).toBeVisible();
  });
});
