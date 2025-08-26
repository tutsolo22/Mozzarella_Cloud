# Backend (NestJS)

Esta es la aplicación backend construida con NestJS.

## Estructura de Carpetas

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/              # Lógica de autenticación (login, JWT, etc.)
├── users/             # Gestión de usuarios del sistema (admin, cocinero...)
│   └── entities/
├── customers/         # Gestión de clientes finales
│   └── entities/
├── products/          # Gestión de productos y categorías
│   └── entities/
├── inventory/         # Gestión de ingredientes y stock
│   └── entities/
├── orders/            # Gestión de pedidos
│   └── entities/
├── common/            # Código compartido en toda la app
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # Guards para proteger rutas (ej. AuthGuard)
│   ├── decorators/    # Decoradores personalizados
│   └── database/      # Configuración de la base de datos
└── config/            # Gestión de configuración y variables de entorno
```

*   **Modularidad**: Cada "módulo" de negocio (users, orders, etc.) tiene su propia carpeta. Dentro de cada una, se crearán los archivos `*.module.ts`, `*.controller.ts`, `*.service.ts` y `*.resolver.ts` (si se usa GraphQL).
*   **Entidades**: La carpeta `entities` dentro de cada módulo contendrá las definiciones de las tablas de la base de datos (usando TypeORM).
*   **Common**: Es un lugar para todo lo que es reutilizable, como los DTOs para validación de datos o los Guards para la seguridad.
*   **Config**: Gestiona las variables de entorno y la configuración de la aplicación.