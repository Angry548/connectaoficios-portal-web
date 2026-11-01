import { Buffer } from 'node:buffer'
import { test, expect } from '@playwright/test'

for (const rol of ['Administrador', 'AdministradorPrincipal']) {
  test(`${rol}: edita Mi perfil y conserva fotografia y sesion`, async ({ page }) => {
    const token = ['eyJhbGciOiJIUzI1NiJ9', btoa(JSON.stringify({ sub: '42', role: rol, exp: Math.floor(Date.now() / 1000) + 3600 })), 'synthetic-test-signature'].join('.')
    let user = { id: 42, nombre: 'Brian', correo: 'brian@example.test', telefono: '77584908', rol, rolId: rol === 'Administrador' ? 3 : 4, estado: 'Activo' }
    let fotoUrl = 'https://photos.example.test/original.png'
    let saves = 0
    let uploads = 0
    let completarGuardado
    await page.addInitScript(({ token, user }) => {
      sessionStorage.setItem('adminToken', token)
      sessionStorage.setItem('adminUser', JSON.stringify(user))
    }, { token, user })
    await page.route('https://photos.example.test/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="teal"/></svg>' }))
    await page.route('http://127.0.0.1:8080/api/users/42', route => route.fulfill({ json: user }))
    await page.route('http://127.0.0.1:8081/api/perfiles/fotos', route => {
      const { usuarios } = route.request().postDataJSON()
      return route.fulfill({ json: usuarios.map(u => ({ ...u, fotoUrl })) })
    })
    await page.route('http://127.0.0.1:8081/api/perfiles-administrador/administrador/42', route => route.fulfill({ json: { fotoUrl } }))
    await page.route('http://127.0.0.1:8080/api/users/me', async route => {
      expect(route.request().method()).toBe('PUT')
      expect(route.request().headers().authorization).toBe('Bearer ' + token)
      const body = route.request().postDataJSON()
      expect(Object.keys(body).sort()).toEqual(['correo', 'nombre', 'telefono'])
      saves++
      if (body.correo === 'duplicado@example.test') {
        return route.fulfill({ status: 409, json: { message: 'El correo indicado ya está registrado.' } })
      }
      await new Promise(resolve => { completarGuardado = resolve })
      user = { ...user, ...body }
      await route.fulfill({ json: { message: 'Datos personales actualizados correctamente.', user } })
    })
    await page.route('http://127.0.0.1:8081/api/imagenes/perfil', route => {
      uploads++
      expect(route.request().headers().authorization).toBe('Bearer ' + token)
      return route.fulfill({ json: { fotoUrl: 'https://photos.example.test/nueva.png' } })
    })
    await page.route('http://127.0.0.1:8081/api/perfiles-administrador/mi-perfil', route => {
      expect(route.request().method()).toBe('PUT')
      expect(route.request().postDataJSON()).toEqual({ fotoUrl: 'https://photos.example.test/nueva.png' })
      fotoUrl = route.request().postDataJSON().fotoUrl
      return route.fulfill({ json: { fotoUrl } })
    })

    await page.goto('/mi-perfil')
    const main = page.getByRole('main')
    await expect(main.getByRole('textbox', { name: 'Nombre', exact: true })).toHaveValue('Brian')
    await expect(main.getByRole('textbox', { name: 'Nombre', exact: true })).toBeEditable()
    for (const label of ['Rol', 'Estado', 'ID de usuario']) {
      await expect(main.getByLabel(label, { exact: true })).toHaveCount(0)
      await expect(main.getByText(label, { exact: true })).toHaveCount(0)
    }
    await main.getByRole('textbox', { name: 'Nombre', exact: true }).fill(' ')
    await main.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(main.getByText('El nombre es obligatorio.')).toBeVisible()
    expect(saves).toBe(0)
    await main.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Brian Actualizado')
    await main.getByRole('textbox', { name: 'Correo electrónico', exact: true }).fill('incorrecto')
    await main.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(main.getByText('Ingrese un correo electrónico válido.')).toBeVisible()
    await main.getByRole('textbox', { name: 'Correo electrónico', exact: true }).fill('duplicado@example.test')
    await main.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(main.getByRole('alert')).toHaveText('Este correo electrónico ya está registrado.')
    await main.getByRole('textbox', { name: 'Correo electrónico', exact: true }).fill('nuevo@example.test')
    await main.getByLabel('Teléfono', { exact: true }).fill('1'.repeat(26))
    await main.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(main.getByText('El teléfono no puede superar los 25 caracteres.')).toBeVisible()
    expect(saves).toBe(1)
    await main.getByLabel('Teléfono', { exact: true }).fill(' 77584909 ')
    await main.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(main.getByRole('button', { name: 'Guardando…', exact: true })).toBeDisabled()
    await expect(main.getByRole('textbox', { name: 'Nombre', exact: true })).toBeDisabled()
    await expect.poll(() => typeof completarGuardado).toBe('function')
    completarGuardado()
    await expect(page.getByRole('alert').filter({ hasText: 'Perfil actualizado correctamente.' })).toBeVisible()
    await expect(page.getByRole('banner').getByText('Brian Actualizado', { exact: true })).toBeVisible()
    await expect(page.getByRole('navigation').getByText('nuevo@example.test', { exact: true })).toBeVisible()
    const session = await page.evaluate(() => ({ user: JSON.parse(sessionStorage.getItem('adminUser')), token: sessionStorage.getItem('adminToken') }))
    expect(session.user).toEqual(user)
    expect(session.token).toBe(token)
    expect(saves).toBe(2)

    const input = main.locator('input[type=file]')
    await input.setInputFiles({ name: 'invalida.gif', mimeType: 'image/gif', buffer: Buffer.from('invalid') })
    await expect(main.getByText('Selecciona una imagen JPEG, PNG o WEBP de hasta 5 MB.')).toBeVisible()
    expect(uploads).toBe(0)
    await input.setInputFiles({ name: 'grande.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) })
    expect(uploads).toBe(0)
    await input.setInputFiles({ name: 'perfil.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4WQAAAAASUVORK5CYII=', 'base64') })
    await main.getByRole('button', { name: 'Guardar fotografía' }).click()
    await expect(main.getByText('Fotografía guardada correctamente.')).toBeVisible()
    expect(uploads).toBe(1)
    await expect(page.getByRole('banner').getByRole('img', { name: 'Brian Actualizado', exact: true })).toHaveAttribute('src', fotoUrl)
    await expect(main.getByRole('img', { name: 'Brian Actualizado', exact: true })).toHaveAttribute('src', fotoUrl)
    for (const width of [768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(main.getByRole('button', { name: 'Guardar cambios' })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
  })
}
