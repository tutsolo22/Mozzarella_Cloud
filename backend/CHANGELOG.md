# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2023-10-28

### Added
- **Gestión de Inventario en Frontend**:
  - Se implementaron modales interactivos para "Registrar Compra", "Registrar Merma" y "Ajustar Stock" en la página de inventario.
  - Los modales permiten añadir y gestionar múltiples ingredientes en una sola operación.
- **Dashboard de Super Administrador Mejorado**:
  - Se añadieron gráficos de pastel para visualizar la distribución de tenants y licencias por estado (Activo, Suspendido, etc.).
  - Se reorganizó el layout para una mejor presentación de las estadísticas y la tabla de licencias por expirar.

### Fixed
- **Error en `IngredientsController`**: Se corrigió un error de TypeScript donde se intentaba acceder a `user.sub` en lugar de `user.userId` para obtener el ID del usuario, causando fallos en las operaciones de inventario.

### Changed
- **Documentación de Autenticación**: Se actualizó `AUTHENTICATION.md` para clarificar que el payload del JWT utiliza `userId` como el identificador del usuario, mapeado desde el campo `sub` estándar.

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