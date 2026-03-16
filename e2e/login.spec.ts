import { test, expect } from '@playwright/test';

test.describe('GameKey Market - Login/Auth', () => {
  
  test('deve carregar a página de login', async ({ page }) => {
    await page.goto(`/login`);
    await expect(page.getByRole('heading', { name: /Welcome to the Game Key Marketplace/i })).toBeVisible();
    await expect(page.getByText(/Sign in to start buying and selling game keys/i)).toBeVisible();
  });

  test('deve exibir formulário de autenticação', async ({ page }) => {
    await page.goto(`/login`);
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('deve permitir digitar email e senha', async ({ page }) => {
    await page.goto(`/login`);
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('deve tentar fazer login com credenciais', async ({ page }) => {
    await page.goto(`/login`);
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    // Aguarda resposta (pode ser erro ou sucesso, dependendo do Supabase)
    await page.waitForTimeout(2000);
    
    // Não deve crashar a aplicação
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('deve tentar fazer signup com credenciais', async ({ page }) => {
    await page.goto(`/login`);
    await page.getByPlaceholder('Email').fill('newuser@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /Sign Up/i }).click();
    
    await page.waitForTimeout(2000);
    
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('client-side exception');
  });

  test('não deve crashar com email inválido', async ({ page }) => {
    await page.goto(`/login`);
    await page.getByPlaceholder('Email').fill('not-an-email');
    await page.getByPlaceholder('Password').fill('pass');
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    await page.waitForTimeout(2000);
    
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Application error');
  });
});
