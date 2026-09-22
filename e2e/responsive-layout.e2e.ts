import { expect, Page, test } from '@playwright/test';

const areas = [
  { id: 1, codigo: 'mesa-partes', nombre: 'Mesa de Partes' },
  { id: 2, codigo: 'fiscalizacion', nombre: 'Fiscalización y Control' },
  { id: 3, codigo: 'desarrollo-social', nombre: 'Desarrollo Social' },
  { id: 4, codigo: 'rentas', nombre: 'Administración Tributaria' },
  { id: 5, codigo: 'infraestructura', nombre: 'Infraestructura y Obras' },
  { id: 6, codigo: 'ambiente', nombre: 'Gestión Ambiental' },
];

async function mockAreas(page: Page) {
  await page.route('**/api/v1/public/areas', route => route.fulfill({ json: areas }));
}

async function expectLayout(page: Page, actionName: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const action = page.getByRole('button', { name: actionName, exact: true });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  const viewportHeight = page.viewportSize()?.height ?? 0;
  expect(box).not.toBeNull();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewportHeight);
}

async function settle(page: Page) {
  await page.waitForTimeout(850);
}

test('flujo ciudadano aprovecha correctamente pantallas de escritorio', async ({ page }, info) => {
  test.skip(info.project.name === 'movil', 'Validación específica para escritorio y laptop.');
  await mockAreas(page);

  await page.goto('/bienvenida');
  await settle(page);
  await expectLayout(page, 'Comenzar');
  await page.screenshot({ path: info.outputPath('bienvenida.png'), scale: 'css' });

  await page.getByRole('button', { name: 'Comenzar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mesa de Partes' })).toBeVisible();
  await settle(page);
  await expectLayout(page, 'Siguiente');
  await page.screenshot({ path: info.outputPath('seleccion-area.png'), scale: 'css' });

  await page.getByRole('button', { name: 'Mesa de Partes' }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('button', { name: '5 estrellas', exact: true })).toBeVisible();
  await settle(page);
  await expectLayout(page, 'Enviar calificación');
  await page.screenshot({ path: info.outputPath('calificacion.png'), scale: 'css' });

  await page.evaluate(() => sessionStorage.setItem('calificacionEnviada', 'true'));
  await page.goto('/confirmacion');
  await expect(page.getByRole('heading', { name: '¡Gracias por tu opinión!' })).toBeVisible();
  await settle(page);
  await expectLayout(page, 'Volver al inicio');
  await page.screenshot({ path: info.outputPath('confirmacion.png'), scale: 'css' });
});

test('el rediseño conserva el flujo vertical móvil', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil', 'Validación específica para móvil.');
  await mockAreas(page);

  await page.goto('/bienvenida');
  await settle(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Comenzar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mesa de Partes' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Mesa de Partes' }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('button', { name: '5 estrellas', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await settle(page);
  await page.screenshot({ path: info.outputPath('calificacion-movil.png'), fullPage: true, scale: 'css' });
});
