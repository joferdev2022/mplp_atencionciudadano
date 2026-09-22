import { expect, test, Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

test.skip(process.env['MPLP_RUN_E2E'] !== '1', 'Activar MPLP_RUN_E2E=1 para las pruebas con MySQL local.');

let marker: string;
let keys: Set<string>;

test.beforeEach(async ({ page }) => {
  marker = 'E2E encuesta ' + randomUUID();
  keys = new Set<string>();
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().endsWith('/api/v1/public/calificaciones')) {
      const body = request.postDataJSON();
      if (body?.observacion === marker) keys.add(body.id_envio);
    }
  });
});

test.afterEach(async () => {
  if (keys.size === 0) return;
  const backend = resolve(__dirname, '../../mplp_backend');
  const payload = Buffer.from(JSON.stringify({ marker, keys: [...keys] })).toString('base64');
  execFileSync(resolve(backend, 'venv/Scripts/python.exe'), ['-B', '-m', 'tests.cleanup_e2e', payload], {
    cwd: backend,
    env: { ...process.env, MPLP_RUN_E2E: '1' },
    windowsHide: true
  });
});

async function completarEncuesta(page: Page) {
  await page.goto('/bienvenida');
  await page.getByRole('button', { name: 'Comenzar', exact: true }).click();
  await page.getByRole('button', { name: 'Mesa de Partes' }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByText('Mesa de Partes', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '5 estrellas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sí', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Sí', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'No', exact: true })).toBeDisabled();
  await expect(page.getByText('Con 5 estrellas se marca Sí automáticamente.')).toBeVisible();
  await page.getByLabel('Comentarios adicionales').fill(marker);
}

test('una estrella marca No y una puntuación intermedia vuelve a habilitar la pregunta', async ({ page }) => {
  await page.goto('/bienvenida');
  await page.getByRole('button', { name: 'Comenzar', exact: true }).click();
  await page.getByRole('button', { name: 'Mesa de Partes' }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: '1 estrella', exact: true }).click();
  await expect(page.getByRole('button', { name: 'No', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Con 1 estrella se marca No automáticamente.')).toBeVisible();
  await page.getByRole('button', { name: '3 estrellas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sí', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'No', exact: true })).toBeEnabled();
});

test('registra la encuesta y muestra confirmación', async ({ page }, testInfo) => {
  await completarEncuesta(page);
  await page.screenshot({ path: testInfo.outputPath('encuesta.png'), fullPage: true });
  const response = page.waitForResponse(
    result => result.url().endsWith('/api/v1/public/calificaciones') && result.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Enviar calificación', exact: true }).click();
  expect((await response).status()).toBe(201);
  await expect(page.getByRole('heading', { name: '¡Gracias por tu opinión!' })).toBeVisible();
  await expect(page).toHaveURL(/\/confirmacion$/);
  expect(keys.size).toBe(1);
});

test('recupera una respuesta perdida después del guardado y no duplica', async ({ page }) => {
  let first = true;
  await page.route('**/api/v1/public/calificaciones', async route => {
    if (first) {
      first = false;
      const saved = await route.fetch();
      expect(saved.status()).toBe(201);
      await route.abort('failed');
    } else {
      await route.continue();
    }
  });
  await completarEncuesta(page);
  await page.getByRole('button', { name: 'Enviar calificación', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'No pudimos confirmar el guardado' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Comentarios adicionales')).toHaveValue(marker);
  await expect(page.getByLabel('Comentarios adicionales')).toBeDisabled();
  const response = page.waitForResponse(result => result.url().endsWith('/api/v1/public/calificaciones'));
  await page.getByRole('button', { name: 'Reintentar envío', exact: true }).click();
  const replay = await response;
  expect(replay.status()).toBe(200);
  expect((await replay.json()).duplicado).toBe(true);
  await expect(page.getByRole('heading', { name: '¡Gracias por tu opinión!' })).toBeVisible();
  expect(keys.size).toBe(1);
});

test('permite reintentar la carga de áreas cuando la API falla', async ({ page }) => {
  let first = true;
  await page.route('**/api/v1/public/areas', async route => {
    if (first) {
      first = false;
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"Prueba de indisponibilidad"}' });
    } else {
      await route.continue();
    }
  });
  await page.goto('/seleccion-area');
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar las áreas');
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mesa de Partes' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('no permite abrir una confirmación sin haber enviado', async ({ page }) => {
  await page.goto('/confirmacion');
  await expect(page).toHaveURL(/\/bienvenida$/);
  await expect(page.getByRole('button', { name: 'Comenzar', exact: true })).toBeVisible();
});
