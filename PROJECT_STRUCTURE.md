# Estructura del Proyecto (Monorepo)

Este proyecto está organizado como un **monorepo**, lo que significa que un solo repositorio de Git contiene múltiples proyectos o aplicaciones relacionadas. Este enfoque facilita la gestión de dependencias y el uso compartido de código.

## Estructura de Carpetas Principal

Mozzarella_Cloud/ ├── .git/ ├── backend/ # Aplicación de la API con NestJS ├── frontend/ # Panel de administración con React + Vite ├── mobile/ # (Futuro) App móvil para repartidores con React Native ├── ARCHITECTURE.md ├── docker-compose.yml ├── README.md └── ... (otros archivos de documentación y configuración global)


### Descripción de las Carpetas

*   **`/` (Raíz)**
    *   Contiene toda la documentación global del proyecto (`ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, etc.).
    *   Alberga configuraciones que afectan a todo el ecosistema, como el `docker-compose.yml` para levantar la base de datos.

*   **`backend/`**
    *   Es un proyecto independiente de **NestJS** que funciona como nuestra API principal.
    *   Gestiona toda la lógica de negocio, la autenticación, y la comunicación con la base de datos.
    *   **Módulos Notables**:
        *   `ApiKeysModule`: Gestiona de forma segura (con cifrado) las credenciales para conectarse a APIs externas.
        *   `WebhooksModule`: Proporciona endpoints seguros para recibir notificaciones de servicios externos, validando las peticiones con firmas HMAC.

*   **`frontend/`**
    *   Es un proyecto independiente de **React** (usando Vite y TypeScript).
    *   Constituirá la interfaz de usuario para el panel de administración, el CRM y el KDS.
    *   Se comunicará con la API del `backend` para mostrar y manipular datos.
