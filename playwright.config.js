import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:5173'
const localApis = {
  VITE_DOTNET_API_URL: 'http://127.0.0.1:8080',
  VITE_JAVA_API_URL: 'http://127.0.0.1:8081',
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serve compiled assets: cold dev-module compilation must not consume test time.
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5173 --strictPort',
    url: baseURL,
    env: localApis,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
