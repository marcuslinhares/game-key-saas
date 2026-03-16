import { test, expect } from '@playwright/test';



test.describe('Fluxo de Vendedor', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe('Dashboard do Vendedor', () => {
    test('deve carregar a página do painel do vendedor', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      await expect(page.getByRole('heading', { name: /Painel do Vendedor/i })).toBeVisible();
    });

    test('deve mostrar mensagem para usuário sem anúncios', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      await expect(page.getByText(/Você ainda não tem anúncios|Comece a vender/i)).toBeVisible();
    });

    test('deve ter botão para criar novo anúncio', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      const newListingButton = page.getByRole('link', { name: /Anunciar Jogo/i });
      await expect(newListingButton).toBeVisible();
    });

    test('deve ter cards de estatísticas', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      await expect(page.getByText(/Saldo Disponível/i)).toBeVisible();
      await expect(page.getByText(/Saldo Pendente/i)).toBeVisible();
      await expect(page.getByText(/Vendas Totais/i)).toBeVisible();
      await expect(page.getByText(/Anúncios Ativos/i)).toBeVisible();
    });

    test('deve ter tabela de anúncios', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      await expect(page.getByRole('columnheader', { name: /Jogo/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Plataforma/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Preço/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Estoque/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Status/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Ações/i })).toBeVisible();
    });

    test('deve ter descrição do painel', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      await expect(page.getByText(/Gerencie seus lucros e anúncios/i)).toBeVisible();
    });
  });

  test.describe('Criar Anúncio', () => {
    test('deve carregar página de criar anúncio', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      await expect(page.getByRole('heading', { name: /Anunciar Jogo/i })).toBeVisible();
    });

    test('deve ter seletor de jogo', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      await expect(page.getByText('Selecionar Jogo')).toBeVisible();
    });

    test('deve ter campo de preço', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      await expect(page.getByLabel(/Preço/i)).toBeVisible();
    });

    test('deve ter campo de estoque', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      await expect(page.getByLabel(/Estoque/i)).toBeVisible();
    });

    test('deve ter botão de submit', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      await expect(page.getByRole('button', { name: /Publicar Anúncio/i })).toBeVisible();
    });

    test('deve ter botão de voltar (ícone)', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      const backButton = page.locator('a[href="/dashboard/seller"]');
      await expect(backButton).toBeVisible();
    });

    test('deve navegar de volta ao clicar no botão voltar', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      await page.locator('a[href="/dashboard/seller"]').click();
      
      await expect(page).toHaveURL(/\/dashboard\/seller/);
    });
  });

  test.describe('Navegação', () => {
    test('deve navegar para criar anúncio ao clicar no botão', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      await page.getByRole('link', { name: /Anunciar Jogo/i }).click();
      
      await expect(page).toHaveURL(/\/listings\/create/);
    });

    test('deve ter link para catálogo na navbar', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      const catalogLink = page.getByRole('link', { name: /Catálogo/i });
      await expect(catalogLink).toBeVisible();
    });
  });

  test.describe('Resiliência', () => {
    test('não deve crashar com dados de vendedor inválidos', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('client-side exception');
    });

    test('não deve crashar na página de criar listing', async ({ page }) => {
      await page.goto(`/listings/create`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
    });
  });
});
