import { test, expect } from '@playwright/test';

test('homepage smoke test', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  await page.goto(baseUrl);
  
  // Verifica se o título da página ou algum elemento principal existe
  await expect(page).toHaveTitle(/GameKey Market/i);
  
  // Verifica se o catálogo de jogos está visível
  const heading = page.getByRole('heading', { name: /Sua próxima aventura começa aqui/i });
  await expect(heading).toBeVisible();
});
