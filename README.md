# Mozzarella Cloud

Bienvenido a **Mozzarella Cloud**, un sistema de gestión integral (ERP/POS) de código abierto, diseñado específicamente para pizzerías y restaurantes. Este proyecto nace con el objetivo de ofrecer una solución completa, moderna y personalizable para la administración de negocios gastronómicos.

Este repositorio contiene todo el código fuente y la documentación del proyecto.

## ✨ Características Principales

Mozzarella Cloud está diseñado para ser una solución todo-en-uno, cubriendo desde la toma de pedidos hasta la gestión financiera avanzada.

-   **Punto de Venta (POS)**: Interfaz ágil para crear y seguir pedidos (domicilio, para llevar, en local).
-   **Gestión de Inventario**: Control de ingredientes en tiempo real, recetas, compras, mermas y notificaciones de stock bajo.
-   **Módulo de Reparto (Delivery)**: Dashboard con mapa interactivo, actualizaciones en tiempo real, geocodificación y optimizador de rutas.
-   **Finanzas y Reportes**: Gestión de sesiones de caja, reporte de corte, costos operativos y análisis de rentabilidad.
-   **Gestión de Zonas de Preparación**: Organiza los productos en zonas (ej. Hornos, Barra Fría) para optimizar el flujo de trabajo en el KDS.
-   **Configuración Dinámica del Sistema**: Panel de Super-Admin para gestionar ajustes críticos (como la configuración de correo SMTP) sin necesidad de reiniciar el servidor.
-   **Gestión Multi-Sucursal y Multi-Tenant**: Soporte completo para cadenas de restaurantes, con datos aislados por sucursal y por negocio.
-   **Integraciones Externas**: Preparado para integrarse con plataformas de pago como Mercado Pago y sistemas de pedidos externos como chatbots de WhatsApp.
-   **Personalización**: Modo oscuro, selector de sucursal, y configuración de áreas de entrega.

Para una lista detallada de todas las funcionalidades, consulta el archivo [`FEATURES.md`](./FEATURES.md).

## 🏗️ Estructura del Proyecto

Este proyecto está organizado como un **monorepo** para facilitar la gestión y el desarrollo de sus diferentes componentes.

-   `backend/`: La API principal construida con NestJS.
-   `frontend/`: El panel de administración construido con React y Vite.

## 📚 Documentación Técnica

La documentación es una parte vital de este proyecto. Está organizada en varios archivos para cubrir diferentes aspectos del sistema:

*   **Guía de Contribución**: ¿Quieres contribuir? Empieza por aquí. Contiene las instrucciones para configurar tu entorno de desarrollo local.
*   **Documentación de la API**: La referencia completa de todos los endpoints de la API, incluyendo ejemplos de peticiones y respuestas.
*   **Arquitectura del Sistema**: Una visión general de alto nivel sobre cómo están diseñados e interconectados los componentes del sistema.
*   **Esquema de la Base de Datos**: Descripción detallada de todas las tablas, columnas y relaciones de la base de datos.
*   **Flujo de Autenticación**: Una explicación técnica de cómo funciona el login, la generación de tokens JWT y la protección de rutas.
*   **Registro de Cambios (Changelog)**: Un historial de todas las versiones y los cambios notables que se han realizado en el proyecto.

## 🚀 Cómo Empezar

Para poner en marcha el proyecto en tu máquina local, sigue las instrucciones detalladas en la **Guía de Contribución**.

# Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en Keep a Changelog,
y este proyecto se adhiere a Semantic Versioning.

## [0.7.0] - 2024-05-22
### Added
- **Gestión de Zonas de Preparación**:
  - Se añadió un módulo completo (Backend y Frontend) para crear, leer, actualizar y eliminar zonas de preparación por sucursal.
  - Se añadió una validación que impide eliminar una zona si está en uso por algún producto.
- **Configuración del Sistema desde la UI**:
  - Se creó un nuevo módulo de `Settings` que permite almacenar configuraciones (como SMTP) en la base de datos.
  - Se implementó una página en el panel de Super-Administrador para gestionar la configuración SMTP dinámicamente.
  - El sistema ahora prioriza la configuración de la base de datos sobre las variables de entorno para el envío de correos.

### Changed
- **Proceso de Creación de Tenants**: Se refactorizó para ser transaccional y más robusto, validando la existencia previa de tenants o usuarios con el mismo nombre/email y devolviendo errores claros.
- **Generación de Enlaces en Correos**: Se robusteció el sistema para que utilice una variable de entorno `FRONTEND_URL`, asegurando que los enlaces de activación y reseteo de contraseña sean siempre correctos.

### Fixed
- **Eliminación de Tenants**: Se corrigió un error crítico que impedía la eliminación completa de un tenant debido a restricciones de clave foránea. El proceso ahora elimina correctamente todas las entidades dependientes (Licencias, Configuraciones, Usuarios, Productos, etc.) en el orden correcto y dentro de una transacción segura.

## [0.6.0] - 2024-05-22
### Added
- **Backend**: Se implementó la lógica completa del `ProductsService`, añadiendo funcionalidades para:
  - Subida y gestión de imágenes de productos.
  - Asignación de recetas (ingredientes) a los productos.
  - Importación y exportación masiva de productos mediante archivos CSV.
- **Frontend**: Se implementaron los servicios de frontend para conectar con la API en las siguientes áreas:
  - Gestión de Sucursales (CRUD completo).
  - Reportes del Dashboard, Rentabilidad y Sesiones de Caja.
  - Historial de sesiones de caja.

### Fixed
- **Backend**: Se resolvieron todos los errores de compilación de TypeScript, incluyendo:
  - Inconsistencias en las relaciones de entidades (`RecipeItem`, `Product`, `Ingredient`).
  - Propiedades faltantes en DTOs (`UpdateProductDto`).
  - Tipado incorrecto en el procesamiento de archivos CSV.
- **Frontend**: Se resolvieron todos los errores de compilación de React, eliminando los fallos por importaciones de funciones no existentes en los servicios de `api`, `locations` y `reports`. Se estabilizaron las páginas de reportes que usaban nombres de funciones conflictivos.

## [Unreleased]
## [0.5.0] - 2024-05-21
### Added
- **Integración de Pagos con Mercado Pago**:
  - Se añadió el SDK de Mercado Pago para procesar pagos en línea.
  - Se creó un `PaymentsModule` para encapsular la lógica de pagos.
  - El sistema ahora puede generar links de pago (Checkout Pro) para los pedidos.
  - Se implementó un endpoint de webhook (`/payments/mercado-pago/webhook`) para recibir notificaciones de pago.
  - La confirmación de un pago a través del webhook cambia automáticamente el estado del pedido a `Confirmed`, descuenta el inventario y notifica a la cocina.
- **Integración con Chatbot de WhatsApp**:
  - Se creó un `WhatsappIntegrationModule` para recibir pedidos desde sistemas externos como chatbots.
  - El endpoint (`/whatsapp-integration/order`) procesa los datos del pedido, crea o busca al cliente por su número de teléfono y genera la orden.
  - El flujo de creación de pedidos ahora soporta un estado intermedio `PendingPayment` para órdenes que requieren un pago en línea.
- **Tareas Programadas (Cron Jobs)**:
  - Se añadió un `TasksModule` para ejecutar tareas periódicas.
  - Se implementó una tarea que se ejecuta cada 5 minutos para buscar pedidos con pago pendiente y (en el futuro) enviar recordatorios.
- **Configuración de Pagos en Frontend**:
  - Se añadió una sección en la página de "Configuración del Negocio" para que los administradores puedan ingresar su `accessToken` de Mercado Pago.
  - Se permite seleccionar los métodos de pago habilitados para el negocio (Ej. Efectivo, Mercado Pago).
- **Gestión de Categorías en Frontend**:
  - Se creó una nueva página para administrar las categorías de productos (CRUD).
  - Se añadió una opción para ver las categorías eliminadas (borrado lógico).
  - Se implementó un botón y la lógica para restaurar categorías que fueron eliminadas.
  - Se implementó la funcionalidad de reordenar categorías mediante arrastrar y soltar (Drag and Drop).
  - Se añadió la página de "Gestión de Categorías" al menú de navegación principal del frontend.
- **Gestión de Productos en Frontend**:
  - Se implementó la página de "Gestión de Productos" para listar, crear, editar y habilitar/deshabilitar productos.
- **Menú de Navegación Responsivo**:
  - Se añadió lógica al layout principal para que el menú lateral se oculte automáticamente en dispositivos móviles.
  - Se agregó un botón de tipo "hamburguesa" en la cabecera para mostrar/ocultar el menú en cualquier tamaño de pantalla.
- **Selector de Sucursal**:
  - Se añadió un componente selector en la cabecera del frontend para que los administradores puedan cambiar entre sus sucursales.
  - Se creó un endpoint en el backend (`PATCH /auth/switch-location`) que emite un nuevo token JWT con la sucursal seleccionada.
- **Modo Oscuro (Dark Mode)**:
  - Se implementó un `ThemeContext` para gestionar el estado del tema (claro/oscuro).
  - Se añadió un interruptor en la cabecera para que el usuario pueda cambiar de tema.
  - El tema seleccionado se guarda en `localStorage` para persistir entre sesiones.
- **Perfil de Usuario en Cabecera**:
  - Se añadió un componente en la cabecera que muestra el nombre del usuario.
  - El componente incluye un menú desplegable con la opción para "Cerrar Sesión".
- **Importación/Exportación Masiva (CSV)**:
  - Se implementaron endpoints en el backend para importar y exportar Productos, Categorías e Ingredientes.
  - Se añadieron botones y modales en el frontend para utilizar estas funciones, facilitando la gestión masiva de datos.
- **Gestión de Recetas en Frontend**:
  - Se añadió un botón "Receta" en la página de gestión de productos.
  - Se implementó un modal que permite asignar ingredientes y sus cantidades a cada producto, lo que habilita el descuento automático de inventario con cada venta.
- **Gestión de Mermas en Frontend**:
  - Se añadió un botón "Registrar Merma" en la página de gestión de ingredientes.
  - Se implementó un modal para registrar la pérdida de múltiples ingredientes a la vez, especificando cantidad y motivo.
- **Ajuste de Stock en Frontend**:
  - Se añadió un botón "Ajustar Stock" en la página de gestión de ingredientes.
  - Se implementó un modal para realizar ajustes de inventario (ej. por conteo físico), permitiendo establecer la nueva cantidad y un motivo para la trazabilidad.
- **Historial de Movimientos de Ingredientes**:
  - Se añadió un endpoint en el backend para obtener el historial de movimientos de un ingrediente.
  - Se implementó un botón "Historial" en la página de ingredientes que abre un modal con la trazabilidad completa de cada insumo (compras, ventas, mermas, ajustes).
- **Dashboard de Inicio con Gráficos**:
  - Se implementó una nueva página de inicio (Dashboard) que muestra estadísticas clave del negocio.
  - Se añadieron gráficos para visualizar las ventas de la última semana y la distribución de pedidos por estado, utilizando `@ant-design/charts`.
- **Gestión de Cierre de Caja**:
  - Se creó una nueva página en "Reportes" para la gestión de sesiones de caja.
  - La interfaz permite "Abrir Caja" con un saldo inicial y "Cerrar Caja" con el saldo final y notas.
  - Muestra información de la sesión activa, como el cajero de apertura, la hora y el total de ventas calculado.

### Changed
- **Entidad `TenantConfiguration`**: Se extendió para almacenar el `mercadoPagoAccessToken` y un array de `enabledPaymentMethods`.
- **Entidad `Order`**: Se añadieron los campos `paymentGatewayId` y `paymentLink` para guardar la información de la transacción.
- **Enums**: Se añadió `PaymentMethod.MercadoPago` y `OrderStatus.PendingPayment` para soportar el nuevo flujo.
- **Servicio de Clientes**: Se añadió el método `findOrCreateByPhone` para facilitar la creación de clientes desde el flujo de WhatsApp.
- **Soft Delete para Categorías**: Se implementó el borrado lógico (soft delete) para las categorías de productos.
  - La entidad `ProductCategory` ahora tiene un campo `deletedAt`.
  - El método `remove` ahora realiza un `softDelete`.
  - Se añadió un método `restore` para recuperar categorías eliminadas.
  - El endpoint `GET /product-categories` ahora acepta un parámetro `includeDeleted`.
## [0.4.0] - 2023-10-30

### Added
- **Arquitectura Multi-Sucursal (Multi-Location)**: Se refactorizó el núcleo del backend para soportar operaciones en múltiples sucursales. Ahora, cada producto, pedido, empleado y reporte está vinculado a una sucursal específica (`locationId`).
- **Módulo Centralizado de Reportes**: Se creó un nuevo `ReportsModule` y `ReportsController` (`/reports`) para unificar todos los endpoints de reportes de negocio, incluyendo:
  - Reporte de Ventas (`/sales`)
  - Reporte de Consumo de Ingredientes (`/ingredient-consumption`)
  - Reporte de Rentabilidad de Productos (`/product-profitability`)
  - Reporte de Mermas (`/waste`)
  - Reporte de Desempeño de Repartidores (`/driver-performance`)

### Changed
- **Seguridad y Aislamiento de Datos (Data Isolation)**: Todos los servicios y controladores (`Products`, `Orders`, `HR`, `Financials`, `Reports`) ahora filtran estrictamente por `tenantId` y `locationId`. Esto garantiza que un `Manager` solo pueda ver y gestionar los datos de su propia sucursal, mientras que un `Admin` (del tenant) puede supervisar todas sus ubicaciones.
- **Lógica de Inventario**: Se corrigió la lógica de creación de pedidos para que el stock de ingredientes se descuente del inventario de la sucursal correcta, en lugar de un stock global.

## [0.1.0] - 2023-10-27

### Added
- **Estructura Inicial del Proyecto**: Configuración de NestJS, TypeORM, PostgreSQL y variables de entorno.
- **Módulo de Autenticación**:
  - Login de usuarios con email y password (`/auth/login`).
  - Generación de JSON Web Tokens (JWT) para sesiones.
  - Guardia `JwtAuthGuard` para proteger rutas.
- **Módulo de Usuarios**:
  - CRUD básico para usuarios.
  - Endpoint protegido (`/users/profile`) para obtener el perfil del usuario autenticado.
- **Módulo de Productos**:
  - CRUD completo para Productos (`/products`).
  - CRUD completo para Categorías de Productos (`/product-categories`).
- **Autorización por Roles**:
  - Implementación de `RolesGuard` y decorador `@Roles`.
  - Protección de endpoints de escritura (POST, PATCH, DELETE) para que solo sean accesibles por usuarios con rol `admin`.
- **Documentación**:
  - Creación de `API_DOCUMENTATION.md` con la descripción de todos los endpoints.
  - Creación de `README.md` principal y `AUTHENTICATION.md` técnico.
