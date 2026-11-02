import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { expect } from '@playwright/test'

export const unique = label => `${label} ${Date.now()} ${randomUUID().slice(0, 6)}`
export const secrets = () => JSON.parse(readFileSync(new URL('./local.secrets.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''))
const dotnet = 'http://127.0.0.1:8080'
const java = 'http://127.0.0.1:8081'
const owned = []
const disposablePaths = new Set(['/api/users/register', '/api/servicios', '/api/promociones', '/api/planes-promocion', '/api/categorias', '/api/zonas-cobertura'])

// Fixed loopback destinations only. No production fallbacks, mocks or stored JWTs.
export async function api(system, path, { token, method = 'GET', data, status } = {}) {
  if (!path.startsWith('/api/')) throw new Error('Only official API paths are allowed')
  const response = await fetch((system === 'dotnet' ? dotnet : java) + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(15000),
  })
  const text = await response.text()
  if (status !== undefined) expect(response.status, `${method} ${path}`).toBe(status)
  else if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}: ${text.slice(0, 300)}`)
  const result = text ? JSON.parse(text) : null
  if (response.ok && method === 'POST' && disposablePaths.has(path)) {
    if (!Number.isInteger(result?.id)) throw new Error(`Missing QA entity ID: ${path}`)
    owned.push({ system, path: path === '/api/users/register' ? '/api/admin/users' : path, id: result.id, token })
  }
  if (response.ok && method === 'DELETE') {
    const index = owned.findIndex(item => item.system === system && `${item.path}/${item.id}` === path)
    if (index !== -1) owned.splice(index, 1)
  }
  return result
}

// Only IDs returned by this worker's own successful POST requests are eligible.
// Referenced plans cannot be deleted: deactivate them and retain audit relations.
export async function cleanupOwned() {
  if (!owned.length) return
  const { token } = await principal()
  const records = owned.splice(0).reverse()
  const errors = []
  for (const record of records) {
    const path = `${record.path}/${record.id}`
    try {
      if (record.path === '/api/admin/users') await api('dotnet', `${path}/status`, { token, method: 'PATCH', data: { estado: 2 } })
      else if (record.path === '/api/promociones') {
        const promotion = await api('java', path, { token })
        if (promotion.estado === 'ACTIVA') await api('java', `${path}/finalizar`, { token, method: 'PUT' })
      } else if (record.path === '/api/planes-promocion') await api('java', `${path}/desactivar`, { token, method: 'PUT' })
      else await api('java', path, { token: record.path === '/api/servicios' ? record.token : token, method: 'DELETE' })
    } catch (error) { errors.push(error) }
  }
  if (errors.length) throw new AggregateError(errors, 'QA cleanup failed')
}

export async function principal() {
  const { correo, password } = secrets()
  const session = await api('dotnet', '/api/users/login', { method: 'POST', data: { correo, password } })
  expect(session.usuario.rol).toBe('AdministradorPrincipal')
  return session
}

export async function login(page) {
  const { correo, password } = secrets()
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByLabel('Correo electrónico')).toBeVisible()
  await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible()
  await page.getByLabel('Correo electrónico').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Bienvenido, E2E Principal' })).toBeVisible()
  expect(await page.evaluate(() => Boolean(sessionStorage.getItem('adminToken') && JSON.parse(sessionStorage.getItem('adminUser')).rol === 'AdministradorPrincipal'))).toBe(true)
}

export async function register(rolId, name = unique('Usuario E2E')) {
  const password = randomUUID() + '!Qa9'
  const correo = `e2e.${randomUUID()}@example.test`
  const user = await api('dotnet', '/api/users/register', { method: 'POST', data: { nombre: name, correo, password, telefono: '70000000', rolId } })
  const session = await api('dotnet', '/api/users/login', { method: 'POST', data: { correo, password } })
  return { ...user, token: session.token }
}

export async function action(page, row, label) {
  await row.getByRole('button', { name: /Acciones/ }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()
}

export async function confirm(page, label) {
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: label, exact: true }).click()
  await expect(dialog).toHaveCount(0)
}

export async function filter(page, label, value) {
  await page.getByLabel(label, { exact: true }).fill(value)
  await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click()
}

export async function autocomplete(page, label, text) {
  await page.getByRole('combobox', { name: label, exact: true }).fill(text)
  await page.getByRole('option').filter({ hasText: text }).click()
}

export async function domainData(token) {
  const worker = await register(2, unique('Trabajador E2E'))
  const other = await register(2, unique('Otro E2E'))
  const categoria = await api('java', '/api/categorias', { token, method: 'POST', data: { nombre: unique('Categoria E2E'), descripcion: 'Datos exclusivos de testing local' } })
  const zona = await api('java', '/api/zonas-cobertura', { token, method: 'POST', data: { departamento: 'E2E Local', municipio: unique('Municipio E2E'), localidad: unique('Zona E2E') } })
  const profiles = new Map()
  async function service(person, suffix, category = categoria) {
    if (!profiles.has(person.id)) profiles.set(person.id, await api('java', '/api/perfiles-trabajador', { token: person.token, method: 'POST', data: { oficioPrincipal: 'Testing E2E', descripcionProfesional: 'QA local', zonaPrincipalId: zona.id } }))
    return api('java', '/api/servicios', { token: person.token, method: 'POST', data: { perfilTrabajadorId: profiles.get(person.id).id, categoriaId: category.id, titulo: unique(`Servicio E2E ${suffix}`), descripcion: 'Servicio desechable de testing local', tarifaMinima: 10, tarifaMaxima: 20, zonasCoberturaIds: [zona.id] } })
  }
  const servicio = await service(worker, 'A')
  const otroServicio = await service(other, 'B')
  const otraCategoria = await api('java', '/api/categorias', { token, method: 'POST', data: { nombre: unique('Categoria Control E2E'), descripcion: 'Control de filtro' } })
  await service(worker, 'Categoria Control', otraCategoria)
  const inactive = await service(worker, 'Estado Control')
  await api('java', `/api/admin/servicios/${inactive.id}/estado`, { token, method: 'PATCH', data: { estado: 'INACTIVO' } })
  return { worker, other, categoria, zona, servicio, otroServicio }
}

// CON-501 only: change the role of our exact QA account in the isolated database.
// The issued JWT keeps its real Principal claim while only the target QA principal
// remains active. This exercises LAST_ACTIVE_PRINCIPAL rather than self-deletion.
export function principalRole(id, rolId) {
  if (!Number.isInteger(id) || ![3, 4].includes(rolId)) throw new Error('Invalid QA role preparation')
  const correo = secrets().correo
  if (!/^e2e\.principal\.\d+@example\.test$/.test(correo)) throw new Error('Not an E2E account')
  execFileSync('sqlcmd', ['-S', '.\\SQLEXPRESS', '-E', '-C', '-b', '-d', 'ConnectaOficiosE2E', '-Q', `SET NOCOUNT ON; IF DB_NAME() <> 'ConnectaOficiosE2E' THROW 50001, 'Not E2E database', 1; UPDATE Usuarios SET RolId=${rolId} WHERE Id=${id} AND Correo='${correo}'; IF @@ROWCOUNT <> 1 THROW 50002, 'QA principal missing', 1;`], { stdio: 'pipe' })
}
