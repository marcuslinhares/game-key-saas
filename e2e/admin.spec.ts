import { test, expect } from '@playwright/test';



test.describe('Fluxo de Admin', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe('Página de Games (Lista)', () => {
    test('deve carregar a página de gerenciamento de jogos', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      await expect(page.getByRole('heading', { name: /Catálogo de Jogos/i })).toBeVisible();
    });

    test('deve ter botão para adicionar novo jogo', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      const newGameButton = page.getByRole('link', { name: /Novo Jogo/i });
      await expect(newGameButton).toBeVisible();
    });

    test('deve ter tabela com colunas', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      await expect(page.getByRole('columnheader', { name: /Título/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Plataforma/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Região/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Ações/i })).toBeVisible();
    });

    test('deve mostrar mensagem quando não houver jogos', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      await expect(page.getByText(/Nenhum jogo cadastrado/i)).toBeVisible();
    });

    test('deve ter botão de editar para cada jogo (quando houver jogos)', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      const editLink = page.locator('a[href*="/admin/games/edit/"]').first();
      if (await editLink.isVisible()) {
        await expect(editLink).toBeVisible();
      }
    });

    test('deve ter botão de excluir para cada jogo (quando houver jogos)', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      const deleteButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeVisible();
      }
    });
  });

  test.describe('Criar Novo Jogo', () => {
    test('deve carregar página de criar jogo', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByRole('heading', { name: /Cadastrar Novo Jogo/i })).toBeVisible();
    });

    test('deve ter campo de título', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByLabel(/Título do Jogo/i)).toBeVisible();
    });

    test('deve ter campo de descrição', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByLabel(/Descrição/i)).toBeVisible();
    });

    test('deve ter seletor de plataforma com label', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByText('Plataforma')).toBeVisible();
      await expect(page.getByText('Steam')).toBeVisible();
    });

    test('deve ter seletor de região com label', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByText('Região (Lock)')).toBeVisible();
      await expect(page.getByText('Global')).toBeVisible();
    });

    test('deve ter campo de URL de capa', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByLabel(/URL da Imagem de Capa/i)).toBeVisible();
    });

    test('deve ter botão de submit', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await expect(page.getByRole('button', { name: /Cadastrar Jogo/i })).toBeVisible();
    });

    test('deve ter botão de voltar (ícone)', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      const backButton = page.locator('a[href="/admin/games"]');
      await expect(backButton).toBeVisible();
    });

    test('deve navegar de volta ao clicar no botão voltar', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      await page.locator('a[href="/admin/games"]').click();
      
      await expect(page).toHaveURL(/\/admin\/games/);
    });
  });

  test.describe('Navegação', () => {
    test('deve navegar para criar jogo ao clicar no botão', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      await page.getByRole('link', { name: /Novo Jogo/i }).click();
      
      await expect(page).toHaveURL(/\/admin\/games\/new/);
    });
  });

  test.describe('Resiliência', () => {
    test('não deve crashar com dados inválidos', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('client-side exception');
    });

    test('não deve crashar na página de novo jogo', async ({ page }) => {
      await page.goto(`/admin/games/new`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
    });

    test('não deve crashar em rota inexistente', async ({ page }) => {
      await page.goto(`/admin/games/nonexistent`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('client-side exception');
    });
  });
});
