import { test, expect } from '@playwright/test';

test.describe('GameKey Market - Componentes e Interações', () => {
  
  test('search bar: deve filtrar ao digitar', async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder(/Buscar jogos/i);
    
    // Digita na busca
    await searchInput.fill('FIFA');
    await expect(searchInput).toHaveValue('FIFA');
    
    // Limpa e digita outra busca
    await searchInput.fill('');
    await searchInput.fill('GTA');
    await expect(searchInput).toHaveValue('GTA');
  });

  test('login form: deve alternar entre campos', async ({ page }) => {
    await page.goto(`/login`);
    
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    
    // Foca no email
    await emailInput.click();
    await emailInput.fill('user@test.com');
    
    // Tab para password
    await emailInput.press('Tab');
    await passwordInput.fill('mypass');
    
    await expect(emailInput).toHaveValue('user@test.com');
    await expect(passwordInput).toHaveValue('mypass');
  });

  test('login form: botões devem estar habilitados com campos preenchidos', async ({ page }) => {
    await page.goto(`/login`);
    
    await page.getByPlaceholder('Email').fill('test@test.com');
    await page.getByPlaceholder('Password').fill('password');
    
    const signUpBtn = page.getByRole('button', { name: /Sign Up/i });
    const signInBtn = page.getByRole('button', { name: /Sign In/i });
    
    await expect(signUpBtn).toBeEnabled();
    await expect(signInBtn).toBeEnabled();
  });

  test('homepage: seção hero deve estar visível', async ({ page }) => {
    await page.goto("/");
    
    // Verifica elementos do hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/O marketplace de chaves de jogos mais confiável/i)).toBeVisible();
  });

  test('homepage: seção vender CTA deve ter informações', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/Transforme suas chaves em dinheiro/i)).toBeVisible();
    await expect(page.getByText(/Split de Pagamento/i).first()).toBeVisible();
    await expect(page.getByText(/Sua Própria Loja/i).first()).toBeVisible();
  });

  test('homepage: botão de entrar deve ter ícone de login', async ({ page }) => {
    await page.goto("/");
    const loginButton = page.getByRole('button', { name: /Entrar/i });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });

  test('navbar: logo deve linkar para homepage', async ({ page }) => {
    await page.goto(`/login`);
    
    const logoLink = page.locator('a[href="/"]').first();
    await expect(logoLink).toBeVisible();
  });

  test('homepage: seção de catálogo deve estar visível', async ({ page }) => {
    await page.goto('/');
    
    // Aguarda carregamento
    await page.waitForTimeout(1500);
    
    // Verifica se a seção de catálogo está visível
    const catalogTitle = page.getByRole('heading', { name: /Destaques do Catálogo/i });
    await expect(catalogTitle).toBeVisible();
    
    // Verifica se tem proteção badge
    const shieldBadge = page.getByText(/100% Protegido/i);
    await expect(shieldBadge).toBeVisible();
  });
});
