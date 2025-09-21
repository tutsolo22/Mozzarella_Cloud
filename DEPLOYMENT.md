# Guía de Despliegue

Este documento proporciona una guía paso a paso para desplegar la aplicación Mozzarella Cloud en un servidor de producción utilizando Docker y Docker Compose.

## 1. Prerrequisitos

Antes de comenzar, asegúrate de que tu servidor de producción tenga instalado lo siguiente:

-   **Git**: Para clonar el repositorio.
-   **Docker**: Para construir y ejecutar los contenedores.
-   **Docker Compose**: Para orquestar los servicios de la aplicación.
-   **Nginx** (o cualquier otro reverse proxy): Recomendado para gestionar el tráfico HTTPS y dirigir las peticiones a los contenedores correspondientes.

## 2. Pasos para el Despliegue

Esta sección cubre la configuración inicial del servidor. Para el flujo de trabajo de actualizaciones recurrentes, consulta la sección **"3. Flujo de Trabajo de Producción"**.

### Paso 1: Clonar el Repositorio

Conéctate a tu servidor y clona el repositorio del proyecto:

```bash
git clone https://github.com/tu-usuario/Mozzarella_Cloud.git
cd Mozzarella_Cloud
```

### Paso 2: Configuración de Variables de Entorno

Es crucial configurar las variables de entorno para el entorno de producción. No debes usar los archivos `.env` de desarrollo.

#### Backend

1.  Navega al directorio del backend:
    ```bash
    cd backend
    ```
2.  Crea un archivo de entorno para producción:
    ```bash
    cp .env.example .env.prod
    ```
3.  Edita `.env.prod` y configura las siguientes variables. **¡Asegúrate de usar valores seguros y secretos!**

    ```dotenv
    # Base de Datos (apuntando al servicio 'db' de Docker Compose)
    DATABASE_URL="postgresql://user:pG_sTr0nPa55w0rd_f0r_M0zz4r3ll4!@db:5432/mozzarella"

    # Secreto para firmar los tokens JWT (¡usa un valor largo y aleatorio!)
    JWT_SECRET="a_v3ry_l0ng_and_s3cur3_r4nd0m_jwt_s3cr3t_f0r_pr0duct10n_!@#$"

    # Clave para cifrar datos sensibles (API Keys). DEBE ser de 32 caracteres.
    ENCRYPTION_KEY="una_clave_secreta_de_32_caracteres_aqui"

    # URL pública de la API (la que usará el frontend)
    API_URL="https://api.tudominio.com"

    # URL pública del Frontend (la que usará el backend para generar enlaces en correos)
    FRONTEND_URL="https://app.tudominio.com"

    # Configuración de CORS (permite el acceso desde tu dominio de frontend)
    CORS_ORIGIN="https://app.tudominio.com"

    # Configuración SMTP (Opcional, como respaldo)
    # A partir de la versión 0.6.0, esta configuración se puede gestionar desde el panel de Super-Admin.
    # Estos valores se usarán solo si no hay nada configurado en la base de datos.
    SMTP_HOST=smtp.example.com
    SMTP_PASS=tu-password-secreto
    ```

#### Frontend

1.  Regresa a la raíz y navega al directorio del frontend:
    ```bash
    cd ../frontend
    ```
2.  Crea un archivo de entorno para producción:
    ```bash
    touch .env.production
    ```
3.  Edita `.env.production` y añade la URL de tu API:
    ```dotenv
    VITE_API_BASE_URL=https://api.tudominio.com
    ```

### Paso 3: Construir y Ejecutar con Docker Compose

Desde la raíz del proyecto, utiliza el archivo `docker-compose.prod.yml` para construir las imágenes y levantar los servicios.

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

Este comando hará lo siguiente:
-   `--build`: Construirá las imágenes de Docker para el backend y el frontend.
-   `-d`: Ejecutará los contenedores en segundo plano (detached mode).

### Paso 4: Configurar el Reverse Proxy (Ejemplo con Nginx)

Para que tu aplicación sea accesible desde Internet de forma segura (con HTTPS), necesitas un reverse proxy.

1.  Asegúrate de tener un dominio y un certificado SSL (puedes obtener uno gratis con Let's Encrypt).
2.  Crea un nuevo archivo de configuración en Nginx (ej. `/etc/nginx/sites-available/mozzarella.conf`):

    ```nginx
    # Servidor para el Frontend
    server {
        listen 443 ssl;
        server_name app.tudominio.com;

        # ssl_certificate /ruta/a/tu/certificado.pem;
        # ssl_certificate_key /ruta/a/tu/clave.key;

        location / {
            proxy_pass http://localhost:8080; # Puerto expuesto por el contenedor del frontend
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }

    # Servidor para el Backend
    server {
        listen 443 ssl;
        server_name api.tudominio.com;

        # ssl_certificate /ruta/a/tu/certificado.pem;
        # ssl_certificate_key /ruta/a/tu/clave.key;

        location / {
            proxy_pass http://localhost:3000; # Puerto expuesto por el contenedor del backend
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```
3.  Activa la configuración y reinicia Nginx.

## 3. Actualizaciones y Mantenimiento
### Flujo de Trabajo de Producción (Aplicando Cambios)

Este es el proceso estándar para actualizar la aplicación en el servidor de producción con los últimos cambios.

#### Paso 1: Integración en `main`

Todo cambio debe ser primero integrado en la rama `main` del repositorio de GitHub. Este proceso se realiza a través de un **Pull Request** desde una rama de `feature` o `fix`, que debe ser revisado y aprobado por otro miembro del equipo. Consulta la Guía de Contribución para más detalles.

#### Paso 2: Conexión al Servidor de Producción

Conéctate a tu servidor de producción vía SSH:
```bash
ssh tu-usuario@ip-del-servidor
```

#### Paso 3: Actualizar el Código Fuente

Navega al directorio del proyecto y descarga los últimos cambios de la rama `main`:

```bash
cd /ruta/a/Mozzarella_Cloud
git pull origin main
```

#### Paso 4: Reconstruir y Reiniciar los Servicios

Utiliza Docker Compose para reconstruir las imágenes que hayan cambiado y reiniciar los servicios de forma ordenada:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

#### Paso 5: Verificación

Es una buena práctica revisar los logs de los contenedores para asegurarte de que todos los servicios han iniciado correctamente:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## Apéndice: Guías de Despliegue Detalladas

Aquí se proporcionan guías más específicas para desplegar en los principales proveedores de nube.

### Opción A: Google Cloud Run (Recomendado por su simplicidad y escalado a cero)

Google Cloud Run es una plataforma sin servidor que ejecuta tus contenedores. Es ideal porque no tienes que gestionar servidores y solo pagas cuando tu código se está ejecutando.

**Prerrequisitos:**
*   Tener una cuenta de Google Cloud con facturación habilitada.
*   Instalar y configurar el [SDK de Google Cloud](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI).
*   Habilitar las APIs: Artifact Registry, Cloud Run, y Cloud SQL Admin en tu proyecto.

**Paso 1: Configurar Artifact Registry (para tus imágenes Docker)**

1.  Crea un repositorio en Artifact Registry para tus imágenes:
    ```bash
    gcloud artifacts repositories create mozzarella-cloud-repo \
        --repository-format=docker \
        --location=us-central1 # Elige tu región preferida
    ```
2.  Configura Docker para autenticarse con Artifact Registry:
    ```bash
    gcloud auth configure-docker us-central1-docker.pkg.dev
    ```

**Paso 2: Construir y Subir las Imágenes Docker**

1.  Define tus variables de entorno (reemplaza `PROJECT-ID` y `REGION`):
    ```bash
    export GCR_HOSTNAME=us-central1-docker.pkg.dev
    export PROJECT_ID=$(gcloud config get-value project)
    ```
2.  Construye y sube la imagen del backend:
    ```bash
    docker build -t $GCR_HOSTNAME/$PROJECT_ID/mozzarella-cloud-repo/backend:latest -f backend/Dockerfile.prod backend/
    docker push $GCR_HOSTNAME/$PROJECT_ID/mozzarella-cloud-repo/backend:latest
    ```
3.  Construye y sube la imagen del frontend:
    ```bash
    docker build -t $GCR_HOSTNAME/$PROJECT_ID/mozzarella-cloud-repo/frontend:latest -f frontend/Dockerfile.prod frontend/
    docker push $GCR_HOSTNAME/$PROJECT_ID/mozzarella-cloud-repo/frontend:latest
    ```

**Paso 3: Crear la Base de Datos en Cloud SQL**

1.  Crea una instancia de PostgreSQL:
    ```bash
    gcloud sql instances create mozzarella-db --database-version=POSTGRES_13 --region=us-central1 --cpu=1 --memory=4GB
    ```
2.  Crea la base de datos específica para la aplicación:
    ```bash
    gcloud sql databases create mozzarella --instance=mozzarella-db
    ```
3.  Crea un usuario para la base de datos (reemplaza `tu-password-seguro`):
    ```bash
    gcloud sql users create user --instance=mozzarella-db --password="tu-password-seguro"
    ```

**Paso 4: Desplegar el Backend en Cloud Run**

1.  Obtén el "Connection Name" de tu instancia de Cloud SQL. Lo necesitarás para el siguiente paso.
    ```bash
    gcloud sql instances describe mozzarella-db --format='value(connectionName)'
    ```
    (El resultado será algo como `tu-project-id:us-central1:mozzarella-db`)

2.  Despliega el servicio del backend, conectándolo a la base de datos y configurando las variables de entorno:
    ```bash
    gcloud run deploy mozzarella-backend \
      --image=$GCR_HOSTNAME/$PROJECT_ID/mozzarella-cloud-repo/backend:latest \
      --platform=managed \
      --region=us-central1 \
      --allow-unauthenticated \
      --add-cloudsql-instances=TU_CONNECTION_NAME_DE_CLOUDSQL \
      --set-env-vars="JWT_SECRET=USA_UN_SECRETO_MUY_LARGO_Y_SEGURO,DATABASE_URL=postgresql://user:tu-password-seguro@/mozzarella?host=/cloudsql/TU_CONNECTION_NAME_DE_CLOUDSQL,FRONTEND_URL=https://LA_URL_DE_TU_FRONTEND"
    ```
    *   `--allow-unauthenticated`: Permite que el servicio sea accesible públicamente.
    *   Anota la URL que te devuelve el comando al finalizar. Será la URL de tu API.

**Paso 5: Desplegar el Frontend en Cloud Run**

1.  Despliega el servicio del frontend, pasándole la URL del backend que acabas de crear:
    ```bash
    gcloud run deploy mozzarella-frontend \
      --image=$GCR_HOSTNAME/$PROJECT_ID/mozzarella-cloud-repo/frontend:latest \
      --platform=managed \
      --region=us-central1 \
      --allow-unauthenticated \
      --set-env-vars="VITE_API_BASE_URL=LA_URL_DE_TU_BACKEND_DESPLEGADO"
    ```

**Paso 6 (Opcional pero recomendado): Configurar un Balanceador de Carga y Dominios Personalizados**

Para usar dominios como `app.tudominio.com` y `api.tudominio.com`, deberás configurar un **Balanceador de Carga de Aplicaciones (Global External Application Load Balancer)** en Google Cloud. Esto te permitirá dirigir el tráfico a tus servicios de Cloud Run y gestionar los certificados SSL de forma centralizada.

---

### Opción B: AWS Elastic Container Service (ECS) con Fargate

Fargate es la opción sin servidor de AWS para ejecutar contenedores, similar a Cloud Run. Es más potente pero también más complejo de configurar.

**Prerrequisitos:**
*   Tener una cuenta de AWS.
*   Instalar y configurar la AWS CLI.

**Resumen de Pasos:**

1.  **Construir y subir imágenes a ECR (Elastic Container Registry)**: Crea dos repositorios (backend/frontend) y sube tus imágenes Docker.
2.  **Crear una base de datos en RDS (Relational Database Service)**: Lanza una instancia de PostgreSQL y guarda las credenciales y el endpoint.
3.  **Guardar secretos en AWS Secrets Manager**: Almacena de forma segura la URL de la base de datos y el `JWT_SECRET`.
4.  **Crear Definiciones de Tareas (Task Definitions) en ECS**:
    *   Crea una "Task Definition" para el backend, eligiendo Fargate, definiendo CPU/memoria y vinculando la imagen de ECR. En la sección de variables de entorno, inyecta los secretos desde Secrets Manager.
    *   Repite el proceso para el frontend.
5.  **Crear un Cluster y Servicios en ECS**:
    *   Crea un Cluster de ECS (puedes usar la plantilla "Networking only").
    *   Dentro del cluster, crea un "Service" para cada "Task Definition", configurándolo para que se ejecute detrás de un "Application Load Balancer" (ALB).
6.  **Configurar el Application Load Balancer (ALB)**:
    *   Configura un listener en el puerto 443 (HTTPS).
    *   Crea dos "target groups" (uno para el backend y otro para el frontend).
    *   Añade reglas al listener para que el tráfico a `api.tudominio.com` se dirija al target group del backend, y el de `app.tudominio.com` al del frontend.

Esta guía es un resumen. Cada paso en AWS puede tener múltiples sub-opciones, por lo que se recomienda seguir la documentación oficial de AWS para cada servicio.
## 4. Opciones de Proveedores de Hosting

Gracias a que la aplicación está contenerizada con Docker, tienes una gran flexibilidad para elegir dónde desplegarla. Aquí tienes un resumen de las mejores opciones, agrupadas por tipo de servicio:

### Opción 1: Plataformas Simplificadas (PaaS - Recomendado para empezar)

Estas plataformas se encargan de la infraestructura por ti. Son ideales para desplegar rápidamente sin preocuparte por la configuración de servidores.

-   **Render**:
    -   **Servicios**: Web Service (para el backend y frontend desde Docker) y PostgreSQL (para la base de datos).
    -   **Pros**: Extremadamente fácil de usar ("cero-devops"), se conecta a tu repositorio de GitHub y despliega automáticamente con cada `push`. Gestiona los certificados SSL sin coste adicional.
    -   **Contras**: Puede ser más caro que un VPS a medida que la aplicación crece.

-   **DigitalOcean App Platform**:
    -   **Servicios**: Similar a Render, te permite desplegar componentes desde tu código o imágenes de Docker.
    -   **Pros**: Muy intuitivo, parte del ecosistema de DigitalOcean que es conocido por su excelente documentación y comunidad.
    -   **Contras**: Similar a Render, el coste puede aumentar con el uso.

### Opción 2: Servidores Privados Virtuales (VPS - Balance Costo/Control)

Con un VPS, alquilas un servidor virtual sobre el que tienes control total. Es más económico a escala, pero requiere que instales y gestiones el software tú mismo (Docker, Nginx, seguridad, etc.).

-   **DigitalOcean Droplets**:
    -   **Servicios**: Droplet (el VPS) y Managed PostgreSQL Database (para no tener que gestionar la base de datos tú mismo).
    -   **Pros**: Precios predecibles, excelente rendimiento y una comunidad muy activa. Ideal para seguir esta guía de despliegue.

-   **Linode (Akamai)** o **Vultr**:
    -   **Servicios**: Ofrecen VPS y bases de datos gestionadas, al igual que DigitalOcean.
    -   **Pros**: Son competidores directos y a menudo ofrecen precios muy competitivos. Son alternativas excelentes y muy fiables.

### Opción 3: Grandes Nubes (IaaS - Máxima Potencia y Escalabilidad)

Son la opción más potente y flexible, ideal para aplicaciones a gran escala que necesitan un ecosistema de servicios completo (IA, Big Data, etc.). Tienen una curva de aprendizaje más pronunciada.

-   **Amazon Web Services (AWS)**:
    -   **Servicios Clave**:
        -   **Contenedores**: Amazon ECS con Fargate (ejecuta contenedores sin servidor) o Amazon EC2 (VPS).
        -   **Base de Datos**: Amazon RDS for PostgreSQL.
    -   **Pros**: El líder del mercado, con la mayor cantidad de servicios disponibles.
    -   **Contras**: Puede ser complejo de configurar y sus costos pueden ser difíciles de predecir.

-   **Google Cloud Platform (GCP)**:
    -   **Servicios Clave**:
        -   **Contenedores**: Google Cloud Run (excelente y muy fácil para desplegar imágenes de Docker) o Compute Engine (VPS).
        -   **Base de Datos**: Cloud SQL for PostgreSQL.
    -   **Pros**: Experiencia de desarrollo muy pulida, especialmente para contenedores.
    -   **Contras**: Similar en complejidad y modelo de precios a AWS.

-   **Microsoft Azure**:
    -   **Servicios Clave**:
        -   **Contenedores**: Azure Container Apps.
        -   **Base de Datos**: Azure Database for PostgreSQL.
    -   **Pros**: Fuerte integración con el ecosistema de Microsoft.
    -   **Contras**: A menudo se percibe como más orientado al mundo empresarial.