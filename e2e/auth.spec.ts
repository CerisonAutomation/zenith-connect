import { test, expect } from '@playwright/test'

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /zenith connect/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('register page loads', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
})

test('unauthenticated redirects to login', async ({ page }) => {
  await page.goto('/discover')
  await expect(page).toHaveURL(/\/login/)
})
