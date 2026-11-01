import { test, expect } from '@playwright/test'

for (const rol of ['Administrador', 'AdministradorPrincipal']) {
test(`${rol}: batch, fallback, cache y cambio de pagina sin N+1`, async ({ page }) => {
 await page.clock.install()
 const token = ['eyJhbGciOiJIUzI1NiJ9', btoa(JSON.stringify({ sub: '42', role: rol, exp: Math.floor(Date.now() / 1000) + 3600 })), 'synthetic-test-signature'].join('.')
 await page.addInitScript(({ token, rol }) => {
  sessionStorage.setItem('adminToken', token)
  sessionStorage.setItem('adminUser', JSON.stringify({ id: 42, nombre: 'Admin de prueba', correo: 'admin@example.test', rol }))
 }, { token, rol })
 const people = [{ id: 7, nombre: 'Brian', correo: 'brian@example.test', rol: 'Cliente', estado: 'Activo' }, { id: 8, nombre: 'Cecilia', correo: 'cecilia@example.test', rol: 'Trabajador', estado: 'Activo' }, { id: 9, nombre: 'Daniel', correo: 'daniel@example.test', rol: 'Cliente', estado: 'Activo' }]
 const batches = []
 let nuevaFoto = false
 const siguiente = { id: 10, nombre: 'Elena', correo: 'elena@example.test', rol: 'Cliente', estado: 'Activo' }
 await page.route('https://photos.example.test/**', route => route.request().url().endsWith('broken.svg')
  ? route.fulfill({ status: 404, body: '' })
  : route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="teal"/></svg>' }))
 await page.route('http://127.0.0.1:8081/api/perfiles/fotos', async route => {
  expect(route.request().headers().authorization).toBe('Bearer ' + token)
  const { usuarios } = route.request().postDataJSON()
  batches.push(usuarios)
  await route.fulfill({ json: usuarios.map(u => ({ ...u, usuarioId: String(u.usuarioId), fotoUrl: u.usuarioId === 8 && !nuevaFoto ? null : 'https://photos.example.test/' + (u.usuarioId === 9 ? 'broken.svg' : 'photo.svg') })) })
 })
 await page.route('http://127.0.0.1:8080/api/admin/users?**', async route => {
  const params = new URL(route.request().url()).searchParams
  expect(params.get('pageSize')).toBe('10')
  await route.fulfill({ json: { items: params.get('page') === '2' ? [siguiente] : people, totalItems: 11 } })
 })
 await page.goto('/usuarios')
 const brian = page.getByRole('row', { name: /Brian/ })
 const cecilia = page.getByRole('row', { name: /Cecilia/ })
 const daniel = page.getByRole('row', { name: /Daniel/ })
 const image = brian.getByRole('img', { name: 'Brian', exact: true })
 await expect(image).toBeVisible()
 await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
 await expect(cecilia.getByText('C', { exact: true })).toBeVisible()
 await expect(daniel.getByText('D', { exact: true })).toBeVisible()
 await expect(daniel.getByRole('img')).toHaveCount(0)
 await expect(page.getByRole('img', { name: 'Admin de prueba', exact: true })).toBeVisible()
 expect(batches.filter(batch => batch.some(u => u.usuarioId === 7))).toHaveLength(1)
 expect(batches.flat().filter(u => [7, 8, 9].includes(u.usuarioId))).toHaveLength(3)
 expect(batches.flat().find(u => u.usuarioId === 42).rol).toBe(rol.toUpperCase())

 // A cached null must be replaced when the five-minute interval expires.
 nuevaFoto = true
 await page.clock.fastForward(300001)
 const updated = cecilia.getByRole('img', { name: 'Cecilia', exact: true })
 await expect(updated).toBeVisible()
 await expect.poll(() => updated.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
 expect(batches.filter(batch => batch.some(u => u.usuarioId === 8))).toHaveLength(2)

 const anteriores = batches.length
 await page.getByRole('button', { name: 'Página siguiente' }).click()
 await expect(page.getByRole('row', { name: /Elena/ }).getByRole('img', { name: 'Elena', exact: true })).toBeVisible()
 expect(batches.slice(anteriores)).toEqual([[{ usuarioId: 10, rol: 'CLIENTE' }]])
 await expect(brian).toHaveCount(0)
})
}
