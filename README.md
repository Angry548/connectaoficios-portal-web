# Portal Web ConnectaOficios

Portal administrativo para usuarios, servicios, promociones, reportes y estadisticas. Identidad, roles, JWT y cuentas pertenecen a .NET; perfiles, fotografias y operaciones de dominio pertenecen a Java. No se almacenan fotos en .NET.

## Stack y requisitos

React 19, JavaScript JSX, Vite 8, MUI 9, React Router 7, Axios y Recharts. Node 24 LTS y npm 11; Docker opcional. Mantener package-lock.json y usar npm ci.

## Inicio local

Ejecutar desde esta carpeta (connectaoficios-portal-web-merge):

~~~bash
npm ci
cp .env.example .env
npm run dev -- --host 0.0.0.0
~~~

PowerShell: Copy-Item .env.example .env. Abrir http://localhost:5173.

VITE_DOTNET_API_URL=http://localhost:8080 y VITE_JAVA_API_URL=http://localhost:8081 son valores iniciales configurables, no una garantia de los puertos de tus backends. Levantar ambos repositorios por separado, confirmar sus puertos y permitir el origen del Portal mediante CORS. El navegador debe poder acceder a ambas URLs. Las variables VITE son publicas y se incorporan durante el build; nunca incluir secretos.

Produccion conocida, solo al configurar explicitamente ese entorno: .NET https://connectaoficios-api.somee.com y Java https://connectaoficios-api-java.onrender.com. La configuracion predeterminada y E2E usan localhost.

## Comandos

~~~bash
npm run lint
npm test
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e:list
npm run test:e2e
npm run test:e2e:report
~~~

Playwright inicia automaticamente un build y Vite Preview en http://127.0.0.1:5173 (puerto estricto), con APIs E2E locales en 127.0.0.1:8080 y 8081. Reutiliza un servidor existente en ese puerto: asegurese de que sea el mismo Portal con esa configuracion; para una corrida aislada, cierre el servidor previo. La compilacion ocurre antes del presupuesto de cada test para evitar que la carga fria de modulos del servidor dev consuma los 30 segundos.

Las pruebas Node cubren errores, cache de entidades y contrato batch/fallback de avatares. Playwright tiene dos smoke tests independientes de APIs (ruta protegida y login invalido simulado). Los casos de negocio y UAT estan en docs/UAT-E2E.md. Reporte HTML: playwright-report/index.html. El lider genera el reporte final; no se versionan reportes ni credenciales.

## Docker

~~~bash
docker compose up --build -d
docker compose down
~~~

Abrir http://localhost:4173. Build multi-stage Node + Nginx con fallback para rutas SPA. Compose levanta solo el Portal: las APIs locales se ejecutan aparte. Las URLs son las que usa el navegador, no nombres DNS internos de Docker. Cambiar .env y reconstruir cuando cambien. No pasar secretos al build.

## Codespaces

Abrir este repositorio con .devcontainer/devcontainer.json; postCreateCommand ejecuta npm ci. Copiar .env.example, configurar URLs accesibles de las APIs y ejecutar npm run dev -- --host 0.0.0.0. Abrir el puerto 5173. Si las APIs viven en otro Codespace, usar sus URLs HTTPS reenviadas y configurar CORS; localhost del navegador no apunta al Codespace. No hacer publicos servicios con datos sensibles.

## Estructura

- src/pages: login, cambio de clave, dashboard, usuarios, administradores, servicios, reportes, estadisticas, promociones y mi perfil.
- src/components: layout, tablas, filtros, dialogos, acciones y componentes compartidos.
- src/context: sesion y autenticacion; rutas protegidas conservan permisos.
- src/services: dos clientes Axios con JWT y servicios por dominio.
- src/config/apiConfig.js: variables Vite y timeout de 30 segundos.
- src/hooks/useUserAvatars.js: carga batch y actualizacion visual.
- src/utils: errores amigables, cache de entidades y contrato de avatares.
- tests: pruebas Node; tests/e2e: Playwright.

## Marca oficial

src/assets/brand/logo.svg y symbol.svg, public/favicon.png: copias exactas de assets/brand del Mobile local, sin cambios ni imports entre repositorios. Sidebar usa logo completo; login usa simbolo oficial. BrandLogo admite variante compacta. El sidebar actual es permanente en desktop y drawer en tablet; no se incorpora otra navegacion colapsable.

## Fotografias

.NET ID + rol -> POST Java /api/perfiles/fotos. Request: { usuarios: [{ usuarioId: 1, rol: 'CLIENTE' }] }; response: [{ usuarioId: 1, rol: 'CLIENTE', fotoUrl: null }]. Contrato contrastado con UsuarioAvatarController y DTOs del Java vecino. Maximo 200 por lote; no hay peticion por fila. Se consultan personas del conjunto cargado y detalles abiertos. Cache en memoria de cinco minutos, separada por sesion, con deduplicacion de solicitudes identicas y invalidacion al guardar foto.

Roles: Cliente, Trabajador, Administrador y AdministradorPrincipal; Java comparte PerfilAdministrador para ambos roles administrativos. UserAvatar usa fotografia, primera inicial y finalmente icono local. MUI vuelve al contenido fallback si la imagen falla.

Mi perfil obtiene identidad .NET y PerfilAdministrador Java. Subida multipart archivo a /api/imagenes/perfil, respuesta fotoUrl, seguida de POST /api/perfiles-administrador o PUT /api/perfiles-administrador/mi-perfil. JPEG/PNG/WEBP no vacios, hasta 5 MB, segun Java. Actualiza header sin recargar; si falla guardar tras subir, reintenta con la URL ya obtenida.

## Consistencia y UX

Listados de usuarios, administradores, servicios, reportes, planes y promociones contratadas empiezan en 10. Se conservan las opciones existentes de otros tamanos y los resets de pagina al aplicar filtros. Paginadores, botones, chips y headers de tabla comparten valores del tema. Dashboard y estadisticas conservan sus calculos.

getApiErrorMessage centraliza errores legibles, timeout, red y permisos; conserva mensajes de validacion y oculta trazas/JSON. Las pantallas utilizan Alert, Snackbar MUI y dialogos compartidos; no window.confirm ni alert del navegador. Los estados vacios y loading existentes se conservan.

## Flujo de integrantes (trabajo futuro)

1. Abrir la rama asignada futura segun coordinacion del equipo.
2. npm ci y configurar .env.
3. Ejecutar app y modificar solo los archivos asignados.
4. Probar el flujo, npm run lint, npm test y npm run build.
5. Commit y push segun el proceso del equipo; no generar reportes finales.

## Flujo del lider (trabajo futuro)

Integrar ramas, npm ci, lint, pruebas Node, build, E2E con APIs locales y datos semilla, reporte Playwright, UAT y evidencias. La preparacion actual permanece en master sin crear ramas, commits, merges ni push.

## Limites de validacion

La revision de codigo y smoke tests no sustituyen un recorrido visual autenticado con las APIs locales y todos los roles. Docker requiere motor instalado. Consultar docs/UAT-E2E.md antes de dar por aprobada la entrega.
