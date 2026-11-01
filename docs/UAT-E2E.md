# Preparación E2E y UAT

Infraestructura: tests/e2e, Chromium, reporte HTML en playwright-report. Los dos smoke tests cubren ruta protegida e inicio de sesión inválido con respuesta simulada. No son evidencia de integración backend.

## Casos pendientes para vincular a Jira

| Caso | Ruta | Validación y evidencia |
| --- | --- | --- |
| Login correcto | /login | Cuenta local administrativa, dashboard y nombre correctos |
| Credenciales inválidas | /login | Mensaje legible, sin sesión |
| Ruta protegida | /usuarios | Sin sesión vuelve a login |
| Logout | Menú del header | Sesión eliminada, ruta protegida inaccesible |
| Listar y filtrar usuarios | /usuarios | 10 iniciales, total, filtros vuelven a primera página |
| Activar/desactivar | /usuarios | Confirmación, estado y aviso; restaurar datos |
| Crear/actualizar administrador | /administradores | Solo principal, validación y persistencia |
| Desactivar/eliminar administrador | /administradores | Restricciones backend, proteger último principal |
| Gestionar servicio | /servicios | Filtros, detalle y acción autorizada |
| Planes | /promociones/planes | Crear/editar/estado, validación |
| Promociones | /promociones/contratadas | Filtros, detalle y estados |
| Reportes | /reportes | Relaciones, filtros y acción autorizada |
| Estadísticas | /estadisticas | Totales comparados con datos semilla |
| Fotografía | /mi-perfil | Ambos roles admin, archivo inválido, guardar, header actualizado |

Ejecutar UAT con APIs locales, cuentas Cliente/Trabajador/Administrador/AdministradorPrincipal y datos semilla conocidos. Registrar resultado, fecha, rol, esperado/obtenido y evidencia por caso en Jira; no usar cuentas de producción. Verificar fallback sin foto y URL rota, paginación, filtros y una llamada batch por conjunto visible pendiente. Repetir navegación a 768, 1366 y 1920 px; revisar teclado y diálogos. No ejecutar acciones destructivas sin datos descartables.

El líder ejecuta la suite y UAT, genera reporte y evidencias finales. Los escenarios de negocio de la tabla están documentados para su futura automatización, no implementados como pruebas vacías.
