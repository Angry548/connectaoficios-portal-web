import { test, expect } from '@playwright/test'
test('una ruta protegida requiere iniciar sesión', async ({ page }) => {
 await page.goto('/usuarios')
 await expect(page).toHaveURL(/\/login$/)
 await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
 await expect(page.getByText('Correo electrónico', { exact: true })).toHaveCount(1)
 await expect(page.getByText('Contraseña', { exact: true })).toHaveCount(1)
})
test('credenciales inválidas muestran un mensaje amigable', async ({ page }) => {
 await page.route('http://127.0.0.1:8080/api/users/login', async route => {
  if (route.request().method() === 'POST') {
   await route.fulfill({ status: 401, json: { message: 'Unauthorized' } })
  } else {
   await route.continue()
  }
 })
 await page.goto('/login')
 await page.getByLabel('Correo electrónico').fill('invalid@example.test')
 await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta')
 await page.getByRole('button', { name: 'Iniciar sesión' }).click()
 await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos.')
})


test('un 401 de avatar Java conserva la sesion .NET y permite navegar', async ({ page }) => {
 const token = ['eyJhbGciOiJIUzI1NiJ9', btoa(JSON.stringify({ sub: '42', role: 'Administrador', exp: Math.floor(Date.now() / 1000) + 3600 })), 'synthetic-test-signature'].join('.')
 await page.addInitScript(({ token }) => {
  sessionStorage.setItem('adminToken', token)
  sessionStorage.setItem('adminUser', JSON.stringify({ id: 42, nombre: 'Admin de prueba', correo: 'admin@example.test', rol: 'Administrador' }))
 }, { token })
 let avatarRequests = 0
 await page.route('http://127.0.0.1:8081/api/perfiles/fotos', async route => {
  avatarRequests++
  await route.fulfill({ status: 401, json: { message: 'Unauthorized' } })
 })
 await page.route('http://127.0.0.1:8080/api/admin/users?**', route => route.fulfill({ json: { items: [], totalItems: 0 } }))
 await page.goto('/dashboard')
 await expect(page.getByRole('heading', { name: 'Bienvenido, Admin de prueba' })).toBeVisible()
 await expect.poll(() => avatarRequests).toBe(1)
 await page.getByRole('link', { name: 'Usuarios', exact: true }).click()
 await expect(page).toHaveURL(/\/usuarios$/)
 await expect(page.getByRole('heading', { name: 'Gestión de usuarios', exact: true })).toBeVisible()
 expect(await page.evaluate(() => sessionStorage.getItem('adminToken'))).toBe(token)
 expect(avatarRequests).toBe(1)
})
