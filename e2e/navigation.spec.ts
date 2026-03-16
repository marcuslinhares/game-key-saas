import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3005';

test.describe('GameKey Market - Navegação e Rotas', () => {
  
  test('deve carregar a página de login sem erros', async ({ page }) => {
    await page.goto(`/login`);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('deve carregar a página de vender', async ({ page }) => {
    await page.goto('/vender');
    const bodyText = await page.innerText('body');
    expect(bodyText).toContain('Venda suas chaves');
    expect(bodyText).not.toContain('Application error');
  });

  test('deve navegar entre páginas via navbar', async ({ page }) => {
    await page.goto('/');
    
    // Clica em Catálogo (já está na home, mas verifica o link)
    await page.getByRole('link', { name: /Catálogo/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
    
    // Clica em Vender Jogos
    await page.getByRole('link', { name: /Vender Jogos/i }).click();
    await expect(page).toHaveURL(/\/vender/);
  });

  test('deve navegar para login via navbar', async ({ page }) => {
    await page.goto("/");
    await page.getByRole('button', { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve exibir 404 em rota inexistente', async ({ page }) => {
    const response = await page.goto(`/rota-inexistente-12345`);
    expect(response?.status()).toBe(404);
  });

  test('deve carregar a página de criar listing', async ({ page }) => {
    await page.goto(`/listings/create`);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('deve carregar dashboard do vendedor', async ({ page }) => {
    await page.goto(`/dashboard/seller`);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('deve carregar página de compras', async ({ page }) => {
    await page.goto(`/dashboard/purchases`);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('deve carregar admin games page', async ({ page }) => {
    await page.goto(`/admin/games`);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('deve carregar admin new game page', async ({ page }) => {
    await page.goto(`/admin/games/new`);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });
});
