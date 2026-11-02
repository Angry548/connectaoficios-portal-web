import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'

// Angel Mate. Real local API: no route interception or synthetic session.
// CON-285 is already covered by auth.spec.js; preserve that test unchanged.
test('CON-284 - rechaza credenciales invalidas sin establecer una sesion', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  await page.getByLabel('Correo electrónico').fill(`e2e.${randomUUID()}@example.test`)
  await page.getByLabel('Contraseña', { exact: true }).fill(randomUUID())

  const rejected = page.waitForResponse(response =>
    response.url() === 'http://127.0.0.1:8080/api/users/login' &&
    response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  expect((await rejected).status()).toBe(401)
  await expect(page.getByRole('alert')).toHaveText('Correo o contraseña incorrectos.')
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => ({
    token: sessionStorage.getItem('adminToken'),
    user: sessionStorage.getItem('adminUser'),
  }))).toEqual({ token: null, user: null })
  await expect(page.getByRole('main')).toHaveCount(0)

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
})
