import { test, expect } from '@playwright/test';

test.describe('GameKey Market - Admin e Dashboard', () => {
  
  test('admin games: deve exibir título e botão de novo jogo', async ({ page }) => {
    await page.goto(`/admin/games`);
    
    await expect(page.getByRole('heading', { name: /Catálogo de Jogos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Novo Jogo/i })).toBeVisible();
  });

  test('admin games: deve navegar para criar novo jogo', async ({ page }) => {
    await page.goto(`/admin/games`);
    await page.getByRole('link', { name: /Novo Jogo/i }).click();
    await expect(page).toHaveURL(/\/admin\/games\/new/);
  });

  test('admin new game: deve exibir formulário', async ({ page }) => {
    await page.goto(`/admin/games/new`);
    
    await expect(page.getByRole('heading', { name: /Cadastrar Novo Jogo/i })).toBeVisible();
    await expect(page.getByLabel(/Título do Jogo/i)).toBeVisible();
    await expect(page.getByLabel(/Descrição/i)).toBeVisible();
  });

  test('admin new game: formulário deve aceitar entrada', async ({ page }) => {
    await page.goto(`/admin/games/new`);
    
    await page.getByLabel(/Título do Jogo/i).fill('Elden Ring');
    await page.getByLabel(/Descrição/i).fill('Um RPG épico');
    
    await expect(page.getByLabel(/Título do Jogo/i)).toHaveValue('Elden Ring');
    await expect(page.getByLabel(/Descrição/i)).toHaveValue('Um RPG épico');
  });

  test('seller dashboard: deve exibir título e botão de anunciar', async ({ page }) => {
    await page.goto(`/dashboard/seller`);
    
    await expect(page.getByRole('heading', { name: /Painel do Vendedor/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Anunciar Jogo/i })).toBeVisible();
  });

  test('seller dashboard: deve navegar para criar listing', async ({ page }) => {
    await page.goto(`/dashboard/seller`);
    await page.getByRole('link', { name: /Anunciar Jogo/i }).click();
    await expect(page).toHaveURL(/\/listings\/create/);
  });

  test('purchases: deve exibir título', async ({ page }) => {
    await page.goto(`/dashboard/purchases`);
    
    await expect(page.getByRole('heading', { name: /Minhas Compras/i })).toBeVisible();
  });

  test('listings create: deve exibir formulário de listing', async ({ page }) => {
    await page.goto(`/listings/create`);
    
    await expect(page.getByRole('heading', { name: /Anunciar Jogo/i })).toBeVisible();
    await expect(page.getByLabel(/Preço/i)).toBeVisible();
    await expect(page.getByLabel(/Estoque/i)).toBeVisible();
  });

  test('listings create: formulário deve aceitar preço e estoque', async ({ page }) => {
    await page.goto(`/listings/create`);
    
    await page.getByLabel(/Preço/i).fill('49.99');
    await page.getByLabel(/Estoque/i).fill('5');
    
    await expect(page.getByLabel(/Preço/i)).toHaveValue('49.99');
    await expect(page.getByLabel(/Estoque/i)).toHaveValue('5');
  });

  test('admin new game: deve ter label de plataforma', async ({ page }) => {
    await page.goto(`/admin/games/new`);
    
    await expect(page.getByText('Plataforma')).toBeVisible();
    await expect(page.getByText('Steam')).toBeVisible();
  });

  test('admin new game: deve ter label de região', async ({ page }) => {
    await page.goto(`/admin/games/new`);
    
    await expect(page.getByText('Região (Lock)')).toBeVisible();
    await expect(page.getByText('Global')).toBeVisible();
  });
});
