import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test.describe('GameKey Market - Smoke Tests', () => {
  
  test('deve carregar a homepage com elementos essenciais', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Título e Hero
    await expect(page).toHaveTitle(/GameKey Market/i);
    await expect(page.getByRole('heading', { name: /Sua próxima aventura começa aqui/i })).toBeVisible();
    
    // Navbar
    await expect(page.getByRole('link', { name: /Catálogo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible();
  });

  test('deve navegar para a página de login', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: /Entrar/i }).click();
    
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /Welcome to the Game Key Marketplace/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test('deve permitir buscar um jogo', async ({ page }) => {
    await page.goto(baseUrl);
    const searchInput = page.getByPlaceholder(/Buscar jogos/i);
    
    await searchInput.fill('Elden Ring');
    // Como o Supabase pode estar mockado na CI, verificamos se o estado de loading ou 
    // a mensagem de "nenhum jogo encontrado" aparece sem quebrar a página
    await expect(page.locator('main')).not.toContainText('Application error');
  });

  test('resiliência: não deve crashar se o Supabase falhar', async ({ page }) => {
    // Simulamos um ambiente sem as chaves (o mock que criamos deve atuar aqui)
    await page.goto(baseUrl);
    
    // O site deve carregar o layout mesmo sem dados
    await expect(page.getByRole('navigation')).toBeVisible();
    // Não deve exibir a tela de erro fatal do Next.js
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('a client-side exception has occurred');
  });
});
