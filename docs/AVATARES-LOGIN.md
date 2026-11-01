# Labels de login y fotografias

## Login

El archivo actual tiene un solo Typography externo por campo, como label htmlFor con IDs estables en los inputs. Los TextField no tienen label interno y los placeholders son distintos. La revision del 2026-11-01 no reproduce texto duplicado: tampoco el Login de HEAD contiene TextField label. Por tanto, no se puede atribuir el problema original a esa combinacion con la evidencia disponible. No cambia autenticacion, validacion, submit ni navegacion.

## Diagnostico real local

Los payloads, respuestas y consultas MySQL siguientes son el registro previo encontrado en este documento, no respuestas obtenidas nuevamente en la revision del 2026-11-01. En esta revision se confirma el contrato leyendo controlador, DTOs y servicio Java locales. Las comprobaciones nuevas de interfaz usan mocks; Brian en E2E es un dato sintetico. No se dispone de una sesion autenticada proporcionada para repetir la consulta real o verificar una foto existente de Mobile.

Consulta de solo lectura a MySQL: perfiles_cliente=0, perfiles_trabajador=0, perfiles_administrador=0; fotos=0 en las tres tablas. Las fotografias que puedan existir en otro entorno no estan en esta base local. No se importaron ni inventaron perfiles.

Se probo el batch real con un JWT diagnostico HS256 local de corta duracion mantenido en memoria (no un login con password). Primero se consulto .NET /api/admin/users?page=1&pageSize=10 y se uso ese conjunto para una sola llamada a Java. No se imprimieron token ni claves.

Payload enviado:

~~~json
{"usuarios":[{"usuarioId":6,"rol":"CLIENTE"},{"usuarioId":8,"rol":"TRABAJADOR"},{"usuarioId":10,"rol":"CLIENTE"},{"usuarioId":18,"rol":"TRABAJADOR"},{"usuarioId":9,"rol":"TRABAJADOR"},{"usuarioId":16,"rol":"CLIENTE"},{"usuarioId":17,"rol":"TRABAJADOR"},{"usuarioId":7,"rol":"TRABAJADOR"},{"usuarioId":19,"rol":"CLIENTE"},{"usuarioId":1,"rol":"CLIENTE"}]}
~~~

HTTP Java: 200. Respuesta real:

~~~json
[{"usuarioId":6,"rol":"CLIENTE","fotoUrl":null},{"usuarioId":8,"rol":"TRABAJADOR","fotoUrl":null},{"usuarioId":10,"rol":"CLIENTE","fotoUrl":null},{"usuarioId":18,"rol":"TRABAJADOR","fotoUrl":null},{"usuarioId":9,"rol":"TRABAJADOR","fotoUrl":null},{"usuarioId":16,"rol":"CLIENTE","fotoUrl":null},{"usuarioId":17,"rol":"TRABAJADOR","fotoUrl":null},{"usuarioId":7,"rol":"TRABAJADOR","fotoUrl":null},{"usuarioId":19,"rol":"CLIENTE","fotoUrl":null},{"usuarioId":1,"rol":"CLIENTE","fotoUrl":null}]
~~~

## Contrato y mapeo

POST /api/perfiles/fotos acepta {usuarios:[{usuarioId,rol}]}, maximo 200. Rol case-insensitive CLIENTE/TRABAJADOR/ADMINISTRADOR/ADMINISTRADORPRINCIPAL, segun DTO y servicio Java; devuelve arreglo con usuarioId, rol en mayusculas y fotoUrl nullable. Ambos roles admin comparten PerfilAdministrador.

apiJava adjunta Authorization Bearer desde la sesion. Se conserva su correccion para no destruir la sesion ante fallos Java. No hubo error de rol ni de token en la prueba real; tampoco habia fotografia real que el Map estuviera descartando.

La clave compartida es ROL:ID numerico; se refuerza normalizacion de IDs string/number, incluso ceros iniciales. UserAvatar muestra foto y vuelve explicitamente a inicial/icono en onError. Todos los usos existentes de UserAvatar/UserIdentity heredan este comportamiento: usuarios y administradores (tabla/detalle), header, perfil, servicios, promociones, reportes y selectores de personas.

## Cache

Se mantienen cinco minutos y se invalidan las personas consultadas al reintentar; una vista abierta vuelve a resolver ese conjunto cada cinco minutos. Guardar foto administrativa sigue invalidando cache y notificando a las vistas. Antes, el vencimiento del servicio por si solo no provocaba otro efecto del hook en una vista que permanecia abierta. No fue la causa de las fotos ausentes en la base local vacia.

Pagina inicial 10 preservada. Se consultan registros de pagina, opciones cargadas y detalles abiertos; no todos los usuarios. No hay llamadas por fila. La suite simula foto valida, null y rota, verifica Bearer, pageSize=10 y una consulta batch para los tres usuarios simulados; estos datos no se escriben en las bases.

## Validacion final

Revision 2026-11-01: lint aprobado, 17 pruebas Node aprobadas, build aprobado con aviso de bundle mayor a 500 kB. Playwright: los cinco casos Chromium aprobados, incluidos Administrador y AdministradorPrincipal. Se amplio tests/e2e/avatars.spec.js para verificar reemplazo de null por foto tras cinco minutos y batch exclusivo de la pagina siguiente con pageSize=10. La primera ejecucion tuvo interferencia de dos builds concurrentes sobre dist; se repitio sin un build externo concurrente. Esta revision modifica solamente ese archivo de pruebas y este informe; conserva las correcciones funcionales preexistentes.

Registro anterior: lint aprobado; 17 pruebas Node aprobadas; build aprobado (advertencia existente de tamano); Playwright 4 aprobadas, 0 fallidas. Las comprobaciones de foto valida y rota usan respuestas simuladas y comprueban carga real del elemento img en Chromium. Segun ese registro, no fue posible una comprobacion manual con fotografia local existente porque las tres tablas de perfiles estaban vacias.

Archivos de esta tarea: src/pages/LoginPage.jsx, src/components/UserAvatar.jsx, src/utils/avatars.js, src/services/avatarService.js, src/hooks/useUserAvatars.js, tests/avatars.test.js, tests/e2e/auth.spec.js, tests/e2e/avatars.spec.js y este documento. git diff --check sin errores de whitespace; git status --short conserva cambios anteriores y nuevos sin commit. Rama master, sin push ni merge.
