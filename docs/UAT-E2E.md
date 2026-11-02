# E2E local con Playwright

Ejecutar exclusivamente con backends locales y datos QA. Los archivos originales
`auth.spec.js`, `avatars.spec.js` y `profile.spec.js` se conservan intactos.
Los casos de Angel usan HTTP real, sin interceptar peticiones ni fabricar sesiones.
CON-285 reutiliza la prueba existente de acceso protegido; los otros casos del Portal
se identifican en los nombres de `angel-*.spec.js`.

## Preparacion local

Requisitos: SQL Server Express local con autenticacion integrada, backends vecinos
compilados y dependencias Maven de testing disponibles (incluido H2), Node y Chromium.
Desde la raiz del Portal, en PowerShell con acceso a SQL Server local:

~~~powershell
./tests/e2e/prepare-local.ps1
./tests/e2e/start-java-local.ps1
npm run test:e2e
npm run test:e2e
Test-Path ./playwright-report/index.html
~~~

Los puertos 8080 y 8081 deben estar libres antes de iniciar los backends E2E.
.NET usa el seeder oficial y la base exclusiva `ConnectaOficiosE2E`; Java usa H2
en memoria en modo MySQL, con controladores, seguridad y repositorios reales.
Esto acredita los flujos integrados locales; no valida compatibilidad con MySQL productivo.
El Portal usa 127.0.0.1:5173. No reutilizar un Preview de otra compilacion/configuracion.

Las credenciales y logs quedan ignorados en `tests/e2e/local.secrets.json` y
`tests/e2e/.local/`. No mostrarlos ni versionarlos. Los IDs se obtienen de las
respuestas de creacion; los nombres y correos son unicos. El cleanup utiliza solo
IDs creados por el worker: finaliza promociones, elimina servicios QA y desactiva
usuarios, catalogos y planes referenciados. Los administradores y planes del ciclo
CRUD se eliminan. CON-501 prepara y restaura solo el rol del principal QA en la base
E2E; conserva un JWT emitido realmente para comprobar la proteccion del ultimo
principal distinto de la cuenta autenticada. Requiere autenticacion SQL integrada.

Reporte de la ultima suite: `playwright-report/index.html`, generado por Playwright.
Los reportes y resultados permanecen ignorados por Git.

## CON-517: incompatibilidad de plataforma

El Portal solo admite roles administrativos y no incluye registro ni funcionalidades
Cliente. El flujo corresponde a `connectaoficios-app-mobile/connectaoficios-mobile`:
`screens/auth/RegisterScreen.js`, autenticacion de la app y
`navigation/ClienteNavigator.js` (busqueda, solicitudes, mensajes y perfil).

La app es React Native/Expo. Aunque declara `expo start --web`, actualmente no tiene
instalados ni declarados `react-native-web` y `react-dom`. No se ejecuto ese flujo
con Playwright ni se acredita con el registro API usado para preparar datos.
Corresponde automatizarlo en la app nativa con Maestro/Detox, o preparar y validar
por separado una version Expo Web. No se agregan funciones Cliente al Portal ni un
test vacio para aparentar cobertura. CON-517 queda bloqueado en esta entrega Web.
