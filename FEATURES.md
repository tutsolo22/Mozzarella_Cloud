# Resumen de Funcionalidades - Mozzarella Cloud

Este documento describe las principales características y capacidades del sistema Mozzarella Cloud, organizadas por módulo.

## 1. Punto de Venta y Gestión de Pedidos (POS)

- **Creación y Seguimiento de Pedidos**: Permite crear pedidos para llevar (pickup), a domicilio (delivery) o para consumir en el local (dine-in).
- **Asignación de Clientes**: Asocia pedidos a clientes existentes o nuevos desde la base de datos.
- **Geocodificación Automática**: Al ingresar una dirección para un pedido a domicilio, el sistema la convierte automáticamente en coordenadas (latitud, longitud).
- **Ajuste Manual de Ubicación**: Si la geocodificación automática es imprecisa, el personal puede ajustar la ubicación del pedido arrastrando un marcador en un mapa.

## 2. Sistema de Despacho en Cocina (KDS)

- **Tablero en Tiempo Real**: El KDS se actualiza automáticamente con nuevos pedidos y cambios de estado a través de WebSockets, sin necesidad de recargar la página.
- **Gestión de Estados**: El personal de cocina puede avanzar el estado de un pedido (`Confirmado` -> `En Preparación` -> `Listo para Despacho`).
- **Notificación de Proximidad del Repartidor**:
  - **Alerta Visual**: Cuando un repartidor se acerca al local para recoger un pedido, la tarjeta de ese pedido en el KDS se resalta con un borde animado y una etiqueta "Llegando".
  - **Alerta Sonora**: Se reproduce un sonido de notificación para alertar al personal de cocina.
  - **Priorización Automática**: Los pedidos cuyo repartidor está cerca se mueven automáticamente al principio de la lista en el KDS para que se les dé prioridad.
- **Indicadores de Entrega Externa**: Muestra una etiqueta especial en los pedidos que serán recogidos por un servicio de delivery externo.

## 3. Gestión de Reparto y Despacho (Delivery)

### 3.1. Dashboard de Despacho para Managers

- **Mapa Interactivo**: Un mapa centralizado (Leaflet) muestra la ubicación de todos los pedidos listos para despachar y la ubicación en tiempo real de los repartidores activos.
- **Lista de Pedidos**: Visualización de todos los pedidos que están en estado "Listo para Despacho".
- **Asignación Manual**: Permite asignar manualmente un pedido a un repartidor **interno** específico.

### 3.2. Optimizador de Rutas

- **Generación de Rutas Inteligentes**: Con un solo clic, el sistema sugiere las rutas más eficientes para los repartidores disponibles.
- **Consideración de Restricciones**:
  - **Peso y Volumen**: El optimizador tiene en cuenta el peso y volumen total de los productos de un pedido.
  - **Capacidad del Vehículo**: Verifica que la suma de peso y volumen de los pedidos asignados a una ruta no exceda la capacidad máxima del vehículo del repartidor.
  - **Prioridad de Pedidos**: El algoritmo asigna primero los pedidos marcados como prioritarios antes de continuar con los regulares.
- **Algoritmo de Optimización**: Utiliza un algoritmo "Greedy" (Vecino más cercano) para minimizar la distancia total de la ruta.
- **Cálculo Basado en Tráfico**: Si se configura una API Key de OpenRouteService, el optimizador calcula las rutas basándose en el tiempo de viaje en tiempo real, no solo en la distancia.
- **Previsualización Interactiva**: Al pasar el ratón sobre una ruta sugerida, esta se dibuja en el mapa, permitiendo al manager visualizarla antes de asignarla.

### 3.3. Dashboard para Repartidores (Base para App Móvil)

- **Recepción de Pedidos en Tiempo Real**: La arquitectura de WebSockets está lista para que una futura app móvil reciba nuevos pedidos asignados sin necesidad de recargar.
- **Actualización de Ubicación**: La base está implementada para que los repartidores envíen su ubicación y esta se refleje en el mapa del manager.

## 4. Gestión de Inventario y Productos

### 4.1. Productos

- **Gestión de Productos por Sucursal**: Interfaz para que los administradores o gerentes de sucursal gestionen el catálogo de productos específico de su ubicación, incluyendo la carga de imágenes.
- **CRUD de Productos y Categorías por Tenant**: Gestión completa de productos y sus categorías a nivel de negocio.
- **Gestión de Recetas**: Permite asignar una receta (lista de ingredientes y cantidades) a cada producto, lo que descuenta el stock automáticamente con cada venta.
- **Gestión de Peso y Volumen**: Interfaz para que los administradores definan el peso (kg) y volumen (m³) de cada producto, datos cruciales para el optimizador de rutas.
- **Estimación de Producción**: Calcula cuántas unidades de un producto se pueden fabricar con el inventario actual, identificando el ingrediente limitante.

### 4.2. Ingredientes e Inventario

- **CRUD de Ingredientes**: Gestión completa de los insumos.
- **Control de Stock**:
  - **Compras**: Interfaz para registrar la compra de insumos y aumentar el stock.
  - **Mermas**: Interfaz para registrar pérdidas de producto (desperdicio).
  - **Ajustes Manuales**: Permite ajustar el stock después de un conteo físico.
- **Notificaciones de Stock Bajo**: El sistema genera alertas automáticas cuando el nivel de un ingrediente cae por debajo de su umbral mínimo.
- **Historial de Movimientos**: Trazabilidad completa de cada ingrediente, mostrando todas las compras, ventas, mermas y ajustes.

### 4.3. Zonas de Preparación

- **Gestión de Zonas por Sucursal**: Permite crear, editar y eliminar zonas de preparación (ej. "Hornos", "Barra Fría", "Bebidas") específicas para cada sucursal.
- **Optimización del KDS**: Al asignar productos a una zona, se facilita la organización del trabajo en el Kitchen Display System.
- **Protección de Datos**: Impide la eliminación de una zona si hay productos que dependen de ella, manteniendo la integridad de los datos.

## 5. Administración y Reportes

### 5.1. Gestión de Usuarios y Roles

- **Sistema de Roles y Permisos**: Roles predefinidos (`SuperAdmin`, `Admin`, `Manager`, `Kitchen`, `Delivery`) que restringen el acceso a diferentes funcionalidades de la API.
- **Gestión de Repartidores**: Interfaz para que los administradores editen la capacidad de carga (peso y volumen) de los vehículos de los repartidores.

### 5.2. Gestión de Sucursales y Configuración (para Admins)

- **CRUD de Sucursales**: Interfaz completa para que el administrador del negocio (`Admin`) pueda crear, ver, editar y eliminar sus diferentes sucursales.
- **Panel de Configuración**:
  - **Área de Entrega**: Permite al manager dibujar un polígono en un mapa para definir su zona de reparto. El sistema alerta si un pedido se crea fuera de esta zona.
  - **Sonido Personalizado**: Permite al manager subir su propio archivo de audio (`.mp3`) para las notificaciones del KDS.
  - **Gestión de APIs**: Interfaz para que el manager configure sus propias claves de API para servicios externos (geocodificación, cálculo de rutas como OpenRouteService).

### 5.3. Configuración del Sistema (para Super-Admins)

- **Gestión de Configuración Centralizada**: Permite a los Super-Admins modificar ajustes críticos del sistema, como la configuración del servidor de correo (SMTP), directamente desde una interfaz web.
- **Sin Reinicios**: Los cambios se aplican en tiempo real sin necesidad de reiniciar el servidor.
- **Flexibilidad**: El sistema prioriza la configuración guardada en la base de datos, pero puede usar las variables de entorno como un método de respaldo (fallback).
### 5.3. Reportes (Por Sucursal)

- **Reporte de Ventas**: Filtra por período de tiempo y muestra ingresos totales y un desglose de ventas por producto.
- **Reporte de Mermas**: Detalla la cantidad y el motivo de la pérdida de ingredientes.
- **Reporte de Consumo de Ingredientes**: Muestra la cantidad total de cada ingrediente consumido en base a los productos vendidos.
- **Reporte de Rendimiento de Repartidores**: Analiza el desempeño de cada repartidor (total de entregas, monto recaudado, tiempo promedio de entrega).
- **Reporte de Rentabilidad de Productos**: Analiza el costo, precio de venta y margen de ganancia de cada producto con receta definida.

## 6. Finanzas y Reportes Avanzados

- **Dashboard Financiero**: Panel para administradores con métricas clave de la jornada o período seleccionado (Ventas, Costos, Ganancia).
- **Gestión de Sesiones de Caja**:
  - Funcionalidad para "Abrir" y "Cerrar" caja al inicio y fin del día.
  - **Página de Gestión de Caja**:
    - Permite a los usuarios autorizados iniciar una nueva sesión de caja ingresando un saldo inicial.
    - Muestra los detalles de la sesión activa, incluyendo el saldo inicial, el usuario que la abrió y las ventas calculadas en tiempo real.
    - Proporciona un formulario para cerrar la sesión, donde se ingresa el saldo final contado y notas opcionales.
  - **Reporte de Corte de Caja**: Al cerrar, se genera un reporte que detalla el total de ventas por método de pago y calcula la diferencia con el efectivo contado.
- **Gestión de Costos Operativos**: Interfaz para registrar gastos adicionales (gas, leña, cajas de pizza, servicios) que se descuentan en los reportes de rentabilidad.
- **Reporte de Ganancias y Pérdidas (P&L)**: Un reporte financiero completo que consolida ingresos, costo de ingredientes, costos de mano de obra y costos operativos para calcular la ganancia neta en un período.
- **Reporte de Corte por Repartidor**: Detalla los pedidos entregados y el monto total recaudado por cada repartidor durante una sesión de caja, facilitando la liquidación diaria.

## 7. Recursos Humanos (RR.HH.)

- **Gestión de Puestos**: Permite crear, editar y eliminar los diferentes roles o puestos de trabajo dentro del restaurante (ej. Cocinero, Cajero).
- **Gestión de Empleados**:
  - Interfaz para registrar empleados, asociándolos a un usuario y un puesto.
  - Permite definir el salario y la frecuencia de pago (diario, semanal, quincenal, mensual) para cada empleado.
- **Cálculo de Costo de Mano de Obra**: El sistema utiliza los salarios para calcular el costo total de la mano de obra en los reportes de rentabilidad.

## 8. Arquitectura y Sistema

- **Multi-Tenant**: La arquitectura está diseñada para dar servicio a múltiples negocios (tenants) de forma segura y con datos completamente aislados.
- **Panel de Super-Admin**: Una interfaz dedicada para el super administrador para gestionar los tenants y sus licencias.
- **Comunicaciones en Tiempo Real**: Uso intensivo de WebSockets (con Socket.IO) para mantener sincronizados y actualizados en tiempo real el KDS, el panel de despacho y la futura app de repartidor.
- **Flujo de Alta Robusto**: El sistema utiliza tokens seguros y sin estado (JWT) para la activación de cuentas, eliminando errores de "token inválido". La creación de tenants, ya sea por registro público o desde el panel de Super Admin, ahora incluye la creación automática de una "Sucursal Principal" para garantizar una experiencia de inicio sin errores.

## 9. Integración de Pagos y WhatsApp

- **Pagos con Mercado Pago**:
  - **Generación de Links de Pago**: El sistema puede generar links de pago de Mercado Pago (Checkout Pro) para los pedidos que requieren pago en línea.
  - **Confirmación Automática**: Utiliza webhooks para recibir notificaciones de Mercado Pago. Cuando un pago es aprobado, el pedido se confirma automáticamente, se descuenta el inventario y se notifica a la cocina.
  - **Configuración por Tenant**: Cada negocio puede configurar su propio `accessToken` de Mercado Pago desde el panel de administración.
- **Integración con Chatbot de WhatsApp**:
  - **Recepción de Pedidos**: Un endpoint (`/whatsapp-integration/order`) permite que un chatbot externo envíe los detalles de un pedido.
  - **Creación de Clientes**: El sistema busca al cliente por su número de teléfono y, si no existe, lo crea automáticamente.
  - **Flujo de Pago Flexible**: El pedido se procesa de forma diferente según el método de pago seleccionado (`cash` o `mercado_pago`), confirmándolo inmediatamente o generando un link de pago.

---