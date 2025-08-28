# Guía de Contribución para Mozzarella Cloud

¡Gracias por tu interés en contribuir a Mozzarella Cloud!

## Flujo de Trabajo

1.  **Busca o crea un Issue**: Antes de empezar a trabajar, busca un issue existente o crea uno nuevo en la pestaña de Issues de GitHub para describir el bug o la característica.
2.  **Crea una Rama**: Crea una nueva rama a partir de `main` para tu trabajo. Nombra la rama de forma descriptiva (e.g., `feature/user-login` o `fix/order-status-bug`).
3.  **Desarrolla**: Escribe tu código, asegurándote de seguir las guías de estilo del proyecto.
4.  **Prueba**: Asegúrate de que tus cambios no rompen ninguna funcionalidad existente.
5.  **Haz Commit**: Escribe mensajes de commit claros y descriptivos.
6.  **Crea un Pull Request**: Abre un Pull Request (PR) hacia la rama `main`. En la descripción del PR, enlaza el issue que resuelve (e.g., `Closes #123`).
7.  **Revisión de Código**: Espera a que otro miembro del equipo revise tu código y apruebe los cambios.

## Configuración del Entorno de Desarrollo

Esta guía te ayudará a configurar el proyecto en tu máquina local para empezar a desarrollar.

### 1. Prerrequisitos

Asegúrate de tener instalado el siguiente software:

- **Git**: Para clonar el repositorio.
- **Node.js**: Se recomienda la versión 18 o superior. Puedes usar un gestor de versiones como [nvm](https://github.com/nvm-sh/nvm).
- **Docker** y **Docker Compose**: Para levantar la base de datos de forma sencilla.

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
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
    *No necesitas modificar el archivo `.env` si estás usando la configuración por defecto de Docker.*
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