import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROME_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH }
      : {},
  },
  webServer: {
    command: process.env.E2E_PRODUCTION ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  reporter: "list",
});
