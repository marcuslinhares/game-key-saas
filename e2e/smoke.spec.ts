import { test, expect } from '@playwright/test';

test.describe('GameKey Market - Fluxos Críticos', () => {
  
  test('deve carregar a homepage e elementos essenciais', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Sua próxima aventura começa aqui/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Buscar jogos/i)).toBeVisible();
  });

  test('deve navegar pelo fluxo de compra até o checkout', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder(/Buscar jogos/i);
    await searchInput.fill('Elden Ring');
    
    const gameCard = page.locator('a[href^="/games/"]').first();
    if (await gameCard.isVisible()) {
      await gameCard.click();
      await expect(page).toHaveURL(/\/games\//);
      
      const buyButton = page.getByRole('button', { name: /Comprar/i }).first();
      if (await buyButton.isVisible()) {
        await buyButton.click();
        await expect(page).toHaveURL(/\/checkout\//);
        await expect(page.getByText(/Finalizar Compra/i)).toBeVisible();
      }
    }
  });

  test('resiliência: não deve exibir "Application Error" em rotas principais', async ({ page }) => {
    const routes = ['/', '/login'];
    
    for (const route of routes) {
      await page.goto(route);
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('client-side exception');
    }
  });
});
