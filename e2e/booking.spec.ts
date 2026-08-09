import { test, expect } from '@playwright/test';

const BOOKING = 'http://localhost:3002';

test('la portada sin slug pide el link del negocio', async ({ page }) => {
  await page.goto(`${BOOKING}/`);
  await expect(page.getByText('Agendox')).toBeVisible();
});

// Extensión (requiere backend + seed con un negocio publicado):
// test('wizard: servicio → horario → OTP → confirmar', async ({ page }) => { ... });
