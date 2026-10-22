import assert from 'node:assert/strict'
import test from 'node:test'
import getApiErrorMessage from '../src/utils/getApiErrorMessage.js'

const http = (status, data) => ({ response: { status, data } })

test('network and timeout errors never expose Axios messages', () => {
  assert.match(getApiErrorMessage({ message: 'Network Error', code: 'ERR_NETWORK' }), /No fue posible conectar/)
  assert.match(getApiErrorMessage({ message: 'timeout of 30000ms exceeded', code: 'ECONNABORTED' }), /tardó demasiado/)
  assert.match(getApiErrorMessage({ code: 'ETIMEDOUT' }), /tardó demasiado/)
  assert.match(getApiErrorMessage(new TypeError('Cannot read properties of undefined')), /No fue posible conectar/)
})

test('Java and .NET business messages and validation errors remain readable', () => {
  assert.equal(getApiErrorMessage(http(400, { mensaje: 'Existen campos inválidos.' })), 'Existen campos inválidos.')
  assert.equal(getApiErrorMessage(http(409, { message: 'El correo ya está registrado.' })), 'El correo ya está registrado.')
  assert.equal(getApiErrorMessage(http(404, { detail: 'El plan no existe.' })), 'El plan no existe.')
  assert.equal(getApiErrorMessage(http(400, { title: 'Validation failed', errors: { nombre: ['El nombre es obligatorio.'] } })), 'El nombre es obligatorio.')
  assert.equal(getApiErrorMessage(http(500, { mensaje: 'El servicio está temporalmente en mantenimiento.' })), 'El servicio está temporalmente en mantenimiento.')
})

test('status fallbacks and authentication contexts use friendly messages', () => {
  assert.match(getApiErrorMessage(http(401)), /sesión ha expirado/)
  assert.equal(getApiErrorMessage(http(401), { unauthorized: 'Correo o contraseña incorrectos.' }), 'Correo o contraseña incorrectos.')
  assert.equal(getApiErrorMessage(http(403)), 'No tiene permisos para realizar esta acción.')
  assert.equal(getApiErrorMessage(http(404), { notFound: 'El usuario no existe.' }), 'El usuario no existe.')
  assert.equal(getApiErrorMessage(http(500)), 'Ocurrió un error en el servidor. Intente nuevamente.')
})

test('malformed bodies, serialized objects, HTML and stack traces are not rendered', () => {
  for (const data of [null, {}, { message: {} }, { mensaje: ['error'] }, '{"error":"internal"}', '<html>500</html>', { message: 'java.lang.RuntimeException at handler' }, { message: 'Request failed with status code 500' }, { message: 'ECONNRESET' }, { detail: 'Error\n at handler (app.js:1:2)' }]) {
    assert.equal(getApiErrorMessage(http(500, data)), 'Ocurrió un error en el servidor. Intente nuevamente.')
  }
})

test('intentional local validation messages survive without exposing arbitrary JS errors', () => {
  const text = 'Este reporte no tiene un servicio relacionado.'
  assert.equal(getApiErrorMessage(new Error(text)), text)
  assert.match(getApiErrorMessage(new Error('Internal failure')), /No fue posible conectar/)
})
