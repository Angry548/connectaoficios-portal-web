# Auditoria de cierre del Portal

Rama comprobada: master. Repositorio: connectaoficios-portal-web-merge. Se preservaron modificaciones de avatares/perfil encontradas al iniciar. No se modificaron los repositorios Mobile, Java ni .NET.

## Pantallas: revision estatica

| Pantalla | Clasificacion | Revision/cambio |
| --- | --- | --- |
| Login | Corregida | Simbolo oficial, labels, favicon global |
| Dashboard | No necesita cambio funcional | Conserva cards, calculos y navegacion; hereda tema |
| Usuarios | Corregida | Avatares en lista y detalle, batch del conjunto cargado |
| Administradores | Corregida | Avatares de ambos roles, detalle y flujo existente |
| Servicios | Corregida | Trabajador en tabla, detalle y selector |
| Reportes | Corregida | Personas en tabla, detalle y selectores |
| Estadisticas | No necesita cambio funcional | Vista numerica sin fotos forzadas; conserva calculos |
| Promociones (contenedor) | Consistente en codigo | Conserva rutas y tabs |
| Planes de promocion | Consistente en codigo | Componentes comunes y paginacion inicial 10 |
| Promociones contratadas | Corregida | Trabajador en tabla, detalle y buscador |
| Mi perfil | Integracion revisada | Identidad .NET, perfil y subida Java, actualizacion sin recarga |
| Cambiar contrasena | Consistente en codigo | Conserva logica; hereda tema |

Esta clasificacion es de codigo, no una aprobacion visual. Falta recorrer todas las pantallas autenticadas con APIs locales, validar permisos y probar responsive/teclado segun UAT-E2E.md.

## Componentes y contratos

Layout mantiene drawer responsive y navegacion por rol. Header conserva nombre/rol y resuelve avatar Java. BrandLogo usa copias exactas de Mobile; no se genero marca nueva. Tema comun para botones, chips, tablas y paginadores. Se conservan loading, vacios, Snackbar y dialogos MUI existentes. Sin window.confirm ni alert del navegador en src.

Batch y perfil contrastados con controladores, DTOs, UsuarioAvatarService e ImagenService del Java vecino. No se agregan peticiones por fila. Cache de cinco minutos por sesion; un conjunto pendiente hace una consulta batch, los conjuntos mayores de 200 se dividen por limite backend. Opciones y detalles se resuelven al estar cargados. No se consultan miles de usuarios para obtener fotos.

Usuarios, administradores, servicios, reportes, planes y promociones contratadas tienen estado inicial 10 y reinicio de pagina al aplicar filtros. Se preserva seleccion existente de otros tamanos. .NET usa paginas desde 1, Java desde 0.

## Validacion

- npm run lint: aprobado.
- npm test: 16 aprobadas.
- npm run build: aprobado; advertencia de bundle mayor de 500 kB.
- npm run test:e2e:list: 2 casos descubiertos.
- Ejecucion E2E: no aprobada; falta ejecutable Chromium de Playwright. Instalar con npx playwright install chromium y repetir.
- Docker: archivos preparados; motor no disponible en esta maquina.
- UAT/integracion real: pendientes de APIs locales y cuentas semilla.
- npm install informo 9 vulnerabilidades (6 moderadas, 3 altas); no se aplico audit fix forzado ni se cambiaron versiones principales.
- git diff --check: sin errores de whitespace; avisos de conversion LF/CRLF del entorno.

README contiene arquitectura, variables, comandos, Docker, Codespaces, avatares y flujos futuros de integrantes/lider. No se crearon commits, ramas, merges ni push.
