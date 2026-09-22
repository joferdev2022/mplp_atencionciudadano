import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const backend = resolve(__dirname, '../mplp_backend');
const python = resolve(backend, 'venv/Scripts/python.exe');
const baseURL = process.env['MPLP_E2E_BASE_URL'] ?? 'http://127.0.0.1:4200';
const externalServer = process.env['MPLP_E2E_EXTERNAL_SERVER'] === '1';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: 'list',
  outputDir: 'test-results',
  use: {
    baseURL,
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'laptop', use: { viewport: { width: 1366, height: 768 } } },
    { name: 'movil', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: externalServer ? undefined : [
    {
      command: '"' + python + '" -B -m uvicorn main:app --host 127.0.0.1 --port 8000',
      cwd: backend,
      url: 'http://127.0.0.1:8000/api',
      reuseExistingServer: true,
      timeout: 30000
    },
    {
      command: 'node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4200',
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: true,
      timeout: 60000
    }
  ]
});
