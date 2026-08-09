import { defineConfig, devices } from '@playwright/test';

// E2E smoke del frontend. Requiere ambas apps corriendo (`pnpm dev`):
//   dashboard :3001 · booking :3002
// Los flujos completos (login + reserva con 409) requieren además el backend
// levantado y con seed; se agregan sobre este scaffold.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
