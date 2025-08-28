# Esquema de la Base de Datos (PostgreSQL)

Este documento describe el esquema inicial de la base de datos principal. Se utilizará PostgreSQL por su robustez y su extensión PostGIS para capacidades geoespaciales.

## Tipos de Datos Personalizados (ENUMs)

Para mejorar la integridad de los datos, definimos tipos enumerados para campos con estados fijos.

```sql
CREATE TYPE order_status AS ENUM ('pending_confirmation', 'confirmed', 'in_preparation', 'ready_for_delivery', 'in_delivery', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('delivery', 'pickup', 'dine_in');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'debit_card', 'credit_card');
CREATE TYPE inventory_movement_type AS ENUM ('purchase', 'sale_deduction', 'waste', 'adjustment');
```

## Tabla: `users`
- `id` (UUID, PK): Identificador único del usuario.
- `email` (VARCHAR, UNIQUE, NOT NULL): Correo electrónico para el login.
- `password_hash` (VARCHAR, NOT NULL): Contraseña hasheada.
- `full_name` (VARCHAR): Nombre completo del usuario.
- `role_id` (UUID, FK to `roles.id`): Rol del usuario en el sistema.
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `roles`
- `id` (UUID, PK): Identificador único del rol.
- `name` (VARCHAR, UNIQUE, NOT NULL): Nombre del rol (e.g., 'admin', 'recepcionista', 'cocinero', 'repartidor').
- `description` (TEXT): Descripción del rol.
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `permissions`
- `id` (UUID, PK): Identificador único del permiso.
- `action` (VARCHAR, NOT NULL): La acción permitida (e.g., 'create', 'read', 'update', 'delete').
- `subject` (VARCHAR, NOT NULL): El objeto sobre el que se aplica la acción (e.g., 'order', 'customer', 'inventory').

## Tabla: `role_permissions` (Tabla Pivote)
- `role_id` (UUID, FK to `roles.id`): ID del rol.
- `permission_id` (UUID, FK to `permissions.id`): ID del permiso.
- `PRIMARY KEY (role_id, permission_id)`

## Tabla: `customers`
- `id` (UUID, PK): Identificador único del cliente.
- `phone_number` (VARCHAR, UNIQUE, NOT NULL): Número de teléfono, clave para la identificación por WhatsApp.
- `full_name` (VARCHAR): Nombre del cliente.
- `addresses` (JSONB): Arreglo de direcciones guardadas. Formato: `[{"alias": "Casa", "full_address": "...", "location": {"lat": ..., "lon": ...}}]`
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `product_categories`
- `id` (UUID, PK): Identificador único de la categoría.
- `name` (VARCHAR, UNIQUE, NOT NULL): Nombre de la categoría (e.g., 'Pizzas Clásicas', 'Bebidas').
- `description` (TEXT): Descripción de la categoría.
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `products`
- `id` (UUID, PK): Identificador único del producto (e.g., Pizza Margarita).
- `name` (VARCHAR, NOT NULL): Nombre del producto.
- `description` (TEXT): Descripción.
- `price` (DECIMAL, NOT NULL): Precio de venta.
- `category_id` (UUID, FK to `product_categories.id`): Categoría a la que pertenece.
- `image_url` (VARCHAR, NULLABLE): URL de la imagen del producto.
- `is_available` (BOOLEAN, NOT NULL, DEFAULT true): Para activar/desactivar el producto del menú.
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `ingredients`
- `id` (UUID, PK): Identificador único del ingrediente.
- `name` (VARCHAR, NOT NULL): Nombre del ingrediente (e.g., 'Queso Mozzarella', 'Harina 000').
- `stock_quantity` (DECIMAL, NOT NULL): Cantidad en inventario.
- `unit` (VARCHAR, NOT NULL): Unidad de medida (e.g., 'kg', 'litro', 'unidad').
- `low_stock_threshold` (DECIMAL, DEFAULT 0): Umbral para notificar stock bajo.
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `product_ingredients` (Recetas)
- `product_id` (UUID, FK to `products.id`)
- `ingredient_id` (UUID, FK to `ingredients.id`)
- `quantity_required` (DECIMAL, NOT NULL): Cantidad del ingrediente para hacer un producto.
- `PRIMARY KEY (product_id, ingredient_id)`

## Tabla: `orders`
- `id` (UUID, PK): Identificador único interno del pedido.
- `short_id` (VARCHAR, UNIQUE, NOT NULL): ID corto y legible para el cliente (e.g., 'P-00123').
- `customer_id` (UUID, FK to `customers.id`): Cliente que realizó el pedido.
- `status` (order_status, NOT NULL): Estado actual del pedido.
- `order_type` (order_type, NOT NULL): Tipo de pedido (reparto, recoger, etc.).
- `total_amount` (DECIMAL, NOT NULL): Monto total del pedido.
- `delivery_address` (TEXT, NOT NULL): Dirección de entrega.
- `delivery_location` (GEOMETRY(Point, 4326)): Coordenadas geográficas (lat, lon) para PostGIS.
- `assigned_driver_id` (UUID, FK to `users.id`, NULLABLE): Repartidor asignado.
- `payment_method` (VARCHAR): Método de pago (e.g., 'cash', 'online').
- `payment_status` (payment_status, NOT NULL, DEFAULT 'pending'): Estado del pago.
- `created_at` (TIMESTAMPZ): Fecha de creación.
- `updated_at` (TIMESTAMPZ): Fecha de última actualización.

## Tabla: `order_items`
- `id` (UUID, PK): Identificador único del item del pedido.
- `order_id` (UUID, FK to `orders.id`): Pedido al que pertenece.
- `product_id` (UUID, FK to `products.id`): Producto solicitado.
- `quantity` (INTEGER, NOT NULL): Cantidad del producto.
- `unit_price` (DECIMAL, NOT NULL): Precio del producto al momento de la compra (histórico).
- `notes` (TEXT, NULLABLE): Notas o personalizaciones del cliente (e.g., "sin cebolla").

## Tabla: `inventory_movements`
- `id` (UUID, PK): Identificador único del movimiento.
- `ingredient_id` (UUID, FK to `ingredients.id`): Ingrediente afectado.
- `order_id` (UUID, FK to `orders.id`, NULLABLE): Pedido que causó el movimiento (si aplica).
- `user_id` (UUID, FK to `users.id`, NULLABLE): Usuario que registró el movimiento (para ajustes manuales).
- `type` (inventory_movement_type, NOT NULL): Tipo de movimiento.
- `quantity_change` (DECIMAL, NOT NULL): Cantidad que se movió (negativo para salidas, positivo para entradas).
- `reason` (TEXT, NULLABLE): Razón del movimiento (e.g., "Venta pedido P-00123", "Ajuste por merma").
- `created_at` (TIMESTAMPZ): Fecha del movimiento.
## Tabla: `inventory_movements`
- `id` (UUID, PK): Identificador único del movimiento.
- `ingredient_id` (UUID, FK to `ingredients.id`): Ingrediente afectado.
- `order_id` (UUID, FK to `orders.id`, NULLABLE): Pedido que causó el movimiento (si aplica).
- `user_id` (UUID, FK to `users.id`, NULLABLE): Usuario que registró el movimiento (para ajustes manuales).
- `type` (inventory_movement_type, NOT NULL): Tipo de movimiento.
- `quantity_change` (DECIMAL, NOT NULL): Cantidad que se movió (negativo para salidas, positivo para entradas).
- `reason` (TEXT, NULLABLE): Razón del movimiento (e.g., "Venta pedido P-00123", "Ajuste por merma").
- `created_at` (TIMESTAMPZ): Fecha del movimiento.