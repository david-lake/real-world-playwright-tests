import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { FeedPage } from '../pages/FeedPage';

/**
 * Smoke tests for critical application paths
 * 
 * These tests verify the application is basically functional.
 * They run quickly and provide fast feedback.
 * 
 * @tag @smoke
 */

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    const feedPage = new FeedPage(page);
    await feedPage.goto();
    
    await expect(page).toHaveTitle(/conduit/i);
    await expect(feedPage.globalFeedTab).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await expect(page).toHaveTitle(/sign in/i);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('navigation elements are present', async ({ page }) => {
    const feedPage = new FeedPage(page);
    await feedPage.goto();
    
    // Check brand is visible
    await expect(page.getByRole('link', { name: /conduit/i })).toBeVisible();
    
    // Check auth links are visible for logged out user
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });
});
