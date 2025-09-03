# Manual Técnico de Mozzarella Cloud

Este documento describe la arquitectura y el funcionamiento de las funcionalidades avanzadas implementadas en el sistema Mozzarella Cloud.

## 1. Arquitectura Multi-Tenant

El sistema está diseñado desde su núcleo para ser multi-inquilino (multi-tenant), lo que significa que puede dar servicio a múltiples negocios (pizzerías) de forma segura y aislada desde una única instancia de la aplicación.

### ¿Cómo funciona?

1.  **Autenticación y JWT**: Cuando un usuario inicia sesión, el backend genera un JSON Web Token (JWT) que contiene no solo su `userId` y `role`, sino también el **`tenantId`** al que pertenece.
2.  **Aislamiento en el Backend**: El backend es el guardián de los datos. En cada petición a la API, el `JwtAuthGuard` valida el token y extrae el `tenantId`. Todos los servicios (como `OrdersService`, `ProductsService`, etc.) utilizan este `tenantId` para filtrar las consultas a la base de datos.
    *   **Ejemplo**: `this.orderRepository.find({ where: { tenantId } });`
    *   Esto garantiza que un usuario del "Tenant A" nunca pueda ver o modificar datos del "Tenant B", incluso si intenta manipular la petición.
3.  **Configuraciones por Tenant**: Para dar flexibilidad, cada tenant puede tener sus propias configuraciones. Esto no se gestiona con archivos `.env` separados, sino con una tabla `TenantConfiguration` en la base de datos, asociada a cada tenant. Esto permite, por ejemplo, que cada negocio use su propia clave de API para servicios externos.

---

## 2. Módulo de Reparto y Geocodificación (Delivery)

Se ha implementado un completo sistema de gestión de repartos para optimizar la logística de entrega.

### 2.1. Flujo de un Pedido de Reparto

1.  **Creación del Pedido**: Cuando se crea un pedido de tipo `delivery` en el panel de administración, el backend dispara un proceso de **geocodificación automática**.
2.  **Geocodificación Automática**:
    *   El `OrdersService` llama al `GeocodingService`.
    *   Este servicio se comunica con una API externa (OpenCage) para convertir la dirección de texto (ej. "Av. Corrientes 1234") en coordenadas (latitud y longitud).
    *   Las coordenadas se guardan en la entidad `Order`.
3.  **Validación de Zona de Entrega**:
    *   Si el administrador ha definido un área de entrega (un polígono en el mapa), el backend utiliza **PostGIS** para verificar si las coordenadas del nuevo pedido están dentro de esa área.
    *   Si el pedido está fuera de la zona, no se rechaza, sino que se le añade una nota automática: `¡ATENCIÓN! Pedido fuera del área de entrega.`.
4.  **Refinamiento Manual (Opcional)**:
    *   Si la geocodificación automática falla o es imprecisa, el personal de recepción puede abrir un modal (`GeocodingModal.tsx`) en el panel de pedidos.
    *   Este modal muestra un mapa donde se puede arrastrar un marcador a la ubicación exacta. Al guardar, se actualizan las coordenadas del pedido en la base de datos.
5.  **Asignación al Repartidor**:
    *   Cuando un pedido se asigna a un repartidor y su estado cambia a `InDelivery`, el backend emite un evento de WebSocket (`new_delivery_for_driver`) al canal específico de ese repartidor.
6.  **Visualización en el Dashboard del Repartidor**:
    *   El `DeliveryDashboardPage` del repartidor, que está escuchando eventos de WebSocket, recibe el nuevo pedido y lo añade a su lista en tiempo real, mostrando una notificación.
    *   El mapa (`DeliveryMap.tsx`) se actualiza automáticamente, mostrando un marcador para el nuevo pedido. Los pedidos fuera de zona tienen un marcador de color rojo para destacarlos.

### 2.2. Componentes Clave del Backend

*   **`GeocodingModule`**: Encapsula la lógica para comunicarse con APIs de geocodificación externas.
    *   `geocoding.service.ts`: Contiene el método `geocode()` que busca la clave de API del tenant y realiza la petición HTTP.
*   **`OrdersService`**:
    *   En el método `create()`, llama al `GeocodingService` y realiza la validación del área de entrega usando una consulta nativa de PostGIS (`ST_Contains`).
    *   `updateCoordinates()`: Método para actualizar las coordenadas desde el modal de refinamiento.
*   **`TenantConfiguration` (Entidad)**: Almacena configuraciones por tenant, incluyendo el campo `deliveryArea` de tipo `geometry` para el polígono y `openCageApiKey` para la clave de API.
*   **`NotificationsGateway`**: (No implementado, pero es el siguiente paso) Gestiona las conexiones WebSocket, las salas por repartidor y la emisión de eventos.

### 2.3. Componentes Clave del Frontend

*   **`DeliveryDashboardPage.tsx`**:
    *   Utiliza `useEffect` para establecer una conexión con el servidor de WebSockets al cargar la página.
    *   Escucha el evento `new_delivery_for_driver` y actualiza el estado `orders`, provocando una re-renderización de la UI.
    *   Separa los pedidos en "mapeables" y "no mapeables" para mostrar una alerta si a un pedido le faltan coordenadas.
*   **`DeliveryMap.tsx`**:
    *   Componente de React-Leaflet que renderiza los marcadores de los pedidos.
    *   Utiliza un `MapFitter` interno para ajustar automáticamente el zoom y el centro del mapa para que todos los marcadores sean visibles.
    *   Muestra un `Popup` en cada marcador con los detalles del pedido y un botón para "Marcar como Entregado".
    *   Renderiza un `RoutePolyline` para dibujar la ruta óptima entre los puntos (basado en el campo `deliverySequence`).
*   **`GeocodingModal.tsx`**:
    *   Modal que contiene un mapa interactivo para que el personal pueda arrastrar un marcador y ajustar la ubicación de un pedido.
*   **`DeliveryZoneMap.tsx`**:
    *   Componente de mapa especializado que se usa en la página de configuración.
    *   Utiliza `react-leaflet-draw` para mostrar herramientas de dibujo que permiten al administrador crear y editar un polígono.

---

## 3. Gestión de Tiempos de Entrega

Para mejorar la planificación, el sistema gestiona y muestra tiempos de entrega estimados.

### 3.1. Flujo de Tiempos

1.  **Estimación Preliminar**: Al crear un pedido, se le asigna un `estimatedDeliveryAt` preliminar (ej. 45 minutos desde la creación).
2.  **Ajuste por Preparación**: El personal de cocina/recepción puede indicar el tiempo de preparación real de un pedido.
    *   Esto se hace a través del `SetPrepTimeModal.tsx`.
    *   Al confirmar, se llama al endpoint `PATCH /orders/:id/prepare`.
    *   El backend actualiza el `preparationTimeMinutes`, cambia el estado del pedido a `InPreparation` y recalcula el `estimatedDeliveryAt` (hora actual + tiempo de preparación).
3.  **Visualización**:
    *   El `DeliveryDashboardPage` muestra la hora de entrega estimada para cada pedido.
    *   Utiliza `dayjs` para formatear la hora y la colorea de rojo si la hora actual ha superado la estimada.
4.  **Registro de Entrega Real**: Cuando un repartidor marca un pedido como `Delivered`, el backend registra la hora exacta en el campo `deliveredAt`.

### 3.2. Cambios en la Base de Datos

La entidad `Order` fue extendida con los siguientes campos:
*   `preparationTimeMinutes: number | null`
*   `estimatedDeliveryAt: Date | null`
*   `deliveredAt: Date | null`

---

## 4. Actualizaciones en Tiempo Real con WebSockets

Para evitar que los repartidores tengan que recargar la página para ver nuevos pedidos, se utiliza una comunicación en tiempo real.

### 4.1. Flujo de Notificación

1.  **Conexión del Cliente**: El `DeliveryDashboardPage` se conecta al servidor de WebSockets (NestJS Gateway) al montarse. Para autenticarse, envía el JWT del usuario en la cabecera de la conexión.
2.  **Identificación en el Backend**: El gateway del backend recibe la conexión, valida el token y utiliza el `userId` para suscribir a ese cliente a una "sala" o canal privado. Por ejemplo, `driver-room-<userId>`.
3.  **Emisión del Evento**: Cuando una acción en el backend debe notificar a un repartidor (ej. `OrdersService` le asigna un nuevo pedido), se inyecta el servicio del Gateway y se emite un evento a la sala específica de ese repartidor.
    *   **Ejemplo**: `this.notificationsGateway.server.to('driver-room-<userId>').emit('new_delivery_for_driver', newOrder);`
4.  **Recepción en el Frontend**: El `socket.on('new_delivery_for_driver', ...)` en el frontend recibe el nuevo pedido y lo añade al estado, actualizando la UI de forma instantánea.

### 4.2. Futuras Mejoras con WebSockets

Este mismo sistema se puede extender para:
*   Notificar al repartidor si la recepcionista **actualiza la ubicación** de un pedido en curso.
*   Mostrar la **ubicación del repartidor en tiempo real** en un mapa para el administrador (el repartidor emitiría su posición cada X segundos).
*   Notificar a la cocina (KDS) sobre nuevos pedidos al instante.

---

## 5. Documentación y Calidad de Código

*   **README.md**: Se ha actualizado para incluir una sección de "Características Principales" que resume las capacidades del sistema.
*   **CHANGELOG.md**: Se mantiene un registro de cambios versionado, documentando todas las nuevas funcionalidades, correcciones y mejoras en cada versión.

Este manual debe ser actualizado a medida que se añadan nuevas funcionalidades al proyecto.

