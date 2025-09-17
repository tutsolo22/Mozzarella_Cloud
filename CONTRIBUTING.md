# Guía de Contribución y Flujo de Trabajo

¡Gracias por tu interés en contribuir a **Mozzarella Cloud**! Este documento te guiará a través del proceso de configuración del entorno de desarrollo y el flujo de trabajo que seguimos para garantizar la calidad y coherencia del código.

## 1. Flujo de Trabajo con Git

Para mantener el repositorio organizado, seguimos un flujo de trabajo basado en ramas y Pull Requests.

### 1.1. Ramas (Branches)

*   **Rama Principal**: La rama `main` es la única fuente de verdad y refleja el código que está en producción. **No se debe hacer push directamente a `main`**.
*   **Ramas de Trabajo**: Todo el trabajo nuevo (características, corrección de bugs, documentación) se debe realizar en una rama separada creada a partir de `main`.

#### Nomenclatura de Ramas

Usa un prefijo descriptivo para nombrar tu rama, seguido de un resumen corto de la tarea.

*   **Nuevas Características**: `feature/nombre-de-la-caracteristica` (ej. `feature/user-login`)
*   **Corrección de Bugs**: `fix/descripcion-del-bug` (ej. `fix/order-status-error`)
*   **Documentación**: `docs/tema-documentado` (ej. `docs/update-api-documentation`)
*   **Tareas y Refactorización**: `chore/descripcion-de-la-tarea` (ej. `chore/refactor-auth-service`)

### 1.2. Commits

Intenta que tus commits sean atómicos (que representen un solo cambio lógico) y escribe mensajes claros. Recomendamos seguir el estándar de Conventional Commits.

**Formato**: `<tipo>(<ámbito opcional>): <descripción>`

*   **Ejemplos**:
    *   `feat(auth): add password recovery endpoint`
    *   `fix(kds): prevent duplicate order rendering`
    *   `docs(readme): update project features list`

### 1.3. Pull Requests (PRs)

Una vez que tu trabajo esté completo y probado en tu rama:

1.  **Haz Push**: Sube tu rama al repositorio remoto de GitHub.
2.  **Crea un Pull Request**: Abre un PR desde tu rama hacia `main`.
3.  **Describe tu PR**:
    *   Usa un título claro y conciso.
    *   En la descripción, explica **qué** hace el PR y **por qué** es necesario.
    *   Enlaza el *Issue* que resuelve usando la palabra clave `Closes #123`.
4.  **Revisión de Código**: Asigna a uno o más miembros del equipo para que revisen tu código. El PR no se podrá fusionar hasta que reciba al menos una aprobación.

---

## 2. Configuración del Entorno de Desarrollo Local

Sigue estos pasos para poner en marcha el proyecto en tu máquina.

### 2.1. Prerrequisitos

Asegúrate de tener instalado el siguiente software:

- **Git**: Para clonar el repositorio.
- **Node.js**: Se recomienda la versión 18 o superior. Puedes usar un gestor de versiones como [nvm](https://github.com/nvm-sh/nvm).
- **Docker** y **Docker Compose**: Para levantar la base de datos de forma sencilla.

### 2.2. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/Mozzarella_Cloud.git
cd Mozzarella_Cloud
```

### 3. Configurar y Levantar la Base de Datos

El proyecto utiliza Docker para gestionar la base de datos PostgreSQL con PostGIS.

1.  Abre una terminal en la raíz del proyecto.
2.  Ejecuta el siguiente comando para iniciar el contenedor de la base de datos en segundo plano:
    ```bash
    docker-compose up -d
    ```
    Esto creará y ejecutará una base de datos con las credenciales definidas en el archivo `docker-compose.yml`.

### 4. Configurar y Ejecutar el Backend (NestJS)

1.  Navega a la carpeta del backend: `cd backend`.
2.  Crea tu propio archivo de variables de entorno a partir del ejemplo:
    ```bash
    cp .env.example .env
    ```
    Abre el archivo `.env` y asegúrate de que las variables estén configuradas correctamente para tu entorno. La más importante para que los correos electrónicos funcionen es `FRONTEND_URL`:

    ```dotenv
    # ... otras variables
    # URL pública del Frontend (la que usará el backend para generar enlaces en correos)
    FRONTEND_URL=http://localhost:5173
    # ...
    ```
    *Si estás desarrollando en un entorno como GitHub Codespaces, asegúrate de usar la URL pública que te proporciona el entorno para el frontend.*

3.  Instala todas las dependencias del proyecto:
    ```bash
    npm install
    ```
4.  Inicia la aplicación en modo de desarrollo. Se reiniciará automáticamente cada vez que guardes un cambio.
    ```bash
    npm run start:dev
    ```

¡Listo! Si todo ha ido bien, el backend estará corriendo y conectado a la base de datos. Ya puedes empezar a desarrollar y probar los endpoints de la API.

### 5. Configurar y Ejecutar el Frontend (React)

1.  Desde la raíz del proyecto, navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala todas las dependencias del proyecto:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```
    La aplicación web estará disponible en la URL que indique la terminal (generalmente `http://localhost:5173`).