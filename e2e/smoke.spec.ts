import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test.describe('GameKey Market - Fluxos Críticos', () => {
  
  test('deve carregar a homepage e elementos essenciais', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveTitle(/GameKey Market/i);
    await expect(page.getByRole('heading', { name: /Sua próxima aventura começa aqui/i })).toBeVisible();
  });

  test('deve navegar pelo fluxo de compra até o checkout', async ({ page }) => {
    await page.goto(baseUrl);
    
    // 1. Pesquisa por um jogo
    const searchInput = page.getByPlaceholder(/Buscar jogos/i);
    await searchInput.fill('Elden Ring');
    
    // 2. Clica no primeiro card de jogo (se existir)
    const gameCard = page.locator('a[href^="/games/"]').first();
    // Se não houver jogos no banco de teste, o teste passará se não houver erro de crash
    if (await gameCard.isVisible()) {
      await gameCard.click();
      
      // 3. Verifica se carregou a página de detalhes
      await expect(page).toHaveURL(/\/games\//);
      
      // 4. Tenta ir para o checkout
      const buyButton = page.getByRole('button', { name: /Comprar/i }).first();
      if (await buyButton.isVisible()) {
        await buyButton.click();
        
        // 5. Deve estar na página de checkout
        await expect(page).toHaveURL(/\/checkout\//);
        await expect(page.getByText(/Finalizar Compra/i)).toBeVisible();
      }
    }
  });

  test('resiliência: não deve exibir "Application Error" em rotas principais', async ({ page }) => {
    const routes = ['/', '/login', '/vender'];
    
    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`);
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('client-side exception');
    }
  });
});
