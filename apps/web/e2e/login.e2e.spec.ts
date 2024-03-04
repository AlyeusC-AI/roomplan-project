import { expect, test } from '@playwright/test'

test('should be able to login', async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto('/login')
  // fill in the login form
  await page.fill('#email', 'eric@identishot.com')
  await page.fill('#password', 'pumas123')
  // click the login button
  await page.click('button')
  // wait for the page to load
  await page.waitForLoadState('networkidle')
  // assert that the page is now on the projects page
  expect(page.url()).toBe('https://www.restorationx.app/projects')
})
