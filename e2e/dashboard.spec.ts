import { test, expect } from '@playwright/test';

const DASHBOARD = 'http://localhost:3001';

test('la raíz redirige a login sin sesión', async ({ page }) => {
  await page.goto(`${DASHBOARD}/`);
  await expect(page).toHaveURL(/\/login/);
});

test('el login muestra el formulario', async ({ page }) => {
  await page.goto(`${DASHBOARD}/login`);
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
});

// Extensión (requiere backend + seed):
// test('login → shell → crear turno (maneja 409)', async ({ page }) => { ... });
