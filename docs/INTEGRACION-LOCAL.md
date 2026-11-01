# Diagnostico de integracion local

Se verificaron las APIs realmente ejecutadas en Docker: .NET desde C:/Dev/ConnectaOficios-main (rama main), Java desde el repositorio vecino connectaoficios-api-java (master). Portal permanece en master. No se cambiaron ramas.

## Causa

Las claves de firma JWT de los contenedores eran distintas. Fingerprints SHA-256 iniciales: .NET FD01E398, Java 81B1530A. Issuer y audience ya coincidian; ambos codigos usan HS256. Java rechazaba la firma y el interceptor apiJava borraba adminToken/adminUser ante cualquier 401, disparando admin-session-expired y el retorno al login.

## Correccion

Solo JWT_SECRET en .env local ignorado de Java se alineo con Jwt__Key del contenedor .NET. Se recreo exclusivamente connectaoficios-java-api mediante compose up -d --no-deps --force-recreate; sin borrar volumenes ni tocar produccion. Java tardo unos 228 segundos en arrancar. Tras el arranque, ambos health dieron HTTP 200 y las tres variables JWT coincidieron.

apiJava conserva la autenticacion de .NET ante errores secundarios; propaga el error para que useUserAvatars muestre fallback y permita reintento. Se conserva el interceptor de .NET y la restauracion de sesion existente.

## Cuenta importada

Consulta SQL de solo lectura: ID 20, RolId 3, Estado 1 (Activo), hash presente. No se imprimio ni modifico el hash. El usuario introdujo su password original de forma oculta en scripts/Test-LocalIntegration.ps1 y comunico estos resultados:

- .NET POST /api/users/login: 200; autenticado; Administrador; Activo.
- sub y nameidentifier: 20; rol: Administrador.
- iss: ConnectaOficios.Api; aud: ConnectaOficios.Clients.
- exp reportado en la prueba final: 1793517911.
- Java POST /api/perfiles/fotos con el JWT de esa misma sesion: 200, JWT aceptado.

La prueba mantiene password y token solo en memoria, sin archivos, variables de entorno, reportes ni logs con credenciales. El script no almacena los resultados. No fue necesario importar usuarios ni resetear passwords.

## Regresion

Se agrega un E2E con token sintetico y respuestas simuladas que comprueba que un 401 de avatar no borra la sesion y permite navegar de dashboard a gestion de usuarios, sin repetir la peticion batch. Esta prueba no sustituye la comprobacion real .NET -> Java anterior ni un recorrido manual autenticado por todas las pantallas.

Los cuatro roles se mantienen en el conversor Java; el Portal admite Administrador y AdministradorPrincipal. El endpoint batch es administrativo: Cliente/Trabajador no deben recibir acceso administrativo por aceptar su firma JWT.

## Validacion final automatizada

- npm run lint: aprobado.
- npm test: 16 aprobadas.
- npm run build: aprobado, advertencia existente de bundle mayor a 500 kB.
- npx playwright test: 3 aprobadas, 0 fallidas, codigo de salida 0.
- git diff --check: sin errores; avisos LF/CRLF.
- git status --short: cambios previos conservados; nuevo script y documentacion sin agregar al indice; reportes ignorados.

Archivos de esta correccion: src/services/apiJava.js, tests/e2e/auth.spec.js, scripts/Test-LocalIntegration.ps1, docs/INTEGRACION-LOCAL.md y .env local ignorado del backend Java. No se modifico apiDotNet, AuthContext ni el backend .NET. No se hicieron commits, push, merge, migraciones ni cambios de password.
