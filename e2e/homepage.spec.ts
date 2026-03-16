import { test, expect } from '@playwright/test';



test.describe('GameKey Market - Homepage', () => {
  
  test('deve carregar a homepage com heading principal', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole('heading', { name: /Sua próxima aventura começa aqui/i })).toBeVisible();
  });

  test('deve exibir barra de pesquisa funcional', async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder(/Buscar jogos/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
  });

  test('deve exibir navbar com links de navegação', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole('link', { name: /Catálogo/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Vender Jogos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Suporte/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible();
  });

  test('deve exibir seção de vender com CTA', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Transforme suas chaves em dinheiro/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Começar a Vender/i })).toBeVisible();
  });

  test('deve exibir seção de destaques do catálogo', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole('heading', { name: /Destaques do Catálogo/i })).toBeVisible();
  });

  test('deve exibir footer com links', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole('link', { name: /Termos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Privacidade/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Contato/i })).toBeVisible();
    await expect(page.getByText(/© 2026 GameKey Market/i)).toBeVisible();
  });

  test('deve navegar para login ao clicar em Entrar', async ({ page }) => {
    await page.goto("/");
    await page.getByRole('button', { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve navegar para vender ao clicar no CTA', async ({ page }) => {
    await page.goto("/");
    await page.getByRole('link', { name: /Começar a Vender/i }).click();
    await expect(page).toHaveURL(/\/vender/);
  });
});
