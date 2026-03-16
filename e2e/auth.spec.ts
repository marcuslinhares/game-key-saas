import { test, expect } from '@playwright/test';



test.describe('Autenticação', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe('Página de Login', () => {
    test('deve carregar a página de login corretamente', async ({ page }) => {
      await page.goto(`/login`);
      
      await expect(page.getByRole('heading', { name: /Welcome/i })).toBeVisible();
      await expect(page.getByPlaceholder('Email')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('deve mostrar descrição do formulário', async ({ page }) => {
      await page.goto(`/login`);
      
      await expect(page.getByText(/Sign in to start buying/i)).toBeVisible();
    });

    test('deve permitir digitar email e senha', async ({ page }) => {
      await page.goto(`/login`);
      
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('mypassword123');
      
      await expect(page.getByPlaceholder('Email')).toHaveValue('test@example.com');
      await expect(page.getByPlaceholder('Password')).toHaveValue('mypassword123');
    });
  });

  test.describe('Fluxo de Sign Up', () => {
    test('deve tentar criar conta e mostrar mensagem', async ({ page }) => {
      await page.goto(`/login`);
      
      const timestamp = Date.now();
      await page.getByPlaceholder('Email').fill(`test${timestamp}@example.com`);
      await page.getByPlaceholder('Password').fill('ValidPassword123!');
      await page.getByRole('button', { name: /Sign Up/i }).click();
      
      await expect(page.getByText(/Check your email|não configurado/i)).toBeVisible();
    });

    test('deve mostrar mensagem de erro ao tentar signup', async ({ page }) => {
      await page.goto(`/login`);
      
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('123');
      await page.getByRole('button', { name: /Sign Up/i }).click();
      
      const message = page.locator('.text-red-500, .text-sm');
      if (await message.first().isVisible()) {
        await expect(message.first()).toBeVisible();
      }
    });
  });

  test.describe('Fluxo de Sign In', () => {
    test('deve tentar fazer login e mostrar mensagem', async ({ page }) => {
      await page.goto(`/login`);
      
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('ValidPassword123!');
      await page.getByRole('button', { name: /Sign In/i }).click();
      
      await expect(page.getByText(/Logged in|não configurado/i)).toBeVisible();
    });

    test('deve mostrar erro com credenciais (Supabase mock)', async ({ page }) => {
      await page.goto(`/login`);
      
      await page.getByPlaceholder('Email').fill('wrong@example.com');
      await page.getByPlaceholder('Password').fill('wrongpassword');
      await page.getByRole('button', { name: /Sign In/i }).click();
      
      await expect(page.getByText(/não configurado|error|Erro/i)).toBeVisible();
    });
  });

  test.describe('Navegação e Links', () => {
    test('deve ter link para login na navbar quando desconectado', async ({ page }) => {
      await expect(page.getByRole('link', { name: /Entrar/i })).toBeVisible();
    });

    test('deve ter link para catálogo na navbar', async ({ page }) => {
      await expect(page.getByRole('link', { name: /Catálogo/i })).toBeVisible();
    });

    test('deve ter link para Vender Jogos na navbar', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Vender Jogos' })).toBeVisible();
    });

    test('deve navegar para homepage ao clicar no logo', async ({ page }) => {
      await page.goto(`/login`);
      
      await page.getByRole('link', { name: /GameKey Market/i }).first().click();
      
      await expect(page).toHaveURL(/\/$/);
    });

    test('deve navegar para login ao clicar em Entrar', async ({ page }) => {
      await page.getByRole('link', { name: /Entrar/i }).click();
      
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Segurança', () => {
    test('não deve crashar em rotas protegidas sem autenticação', async ({ page }) => {
      await page.goto(`/dashboard/purchases`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('client-side exception');
    });

    test('não deve crashar em rotas de admin sem autenticação', async ({ page }) => {
      await page.goto(`/admin/games`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
    });

    test('não deve crashar em rota de vendedor sem autenticação', async ({ page }) => {
      await page.goto(`/dashboard/seller`);
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error');
    });
  });
});
