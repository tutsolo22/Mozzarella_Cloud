# Documentación de la API - Mozzarella Cloud

Esta es la documentación oficial para la API del backend de Mozzarella Cloud.

## 1. Autenticación

El sistema de autenticación se basa en JWT (JSON Web Tokens). Para acceder a las rutas protegidas, primero debes obtener un `access_token`.

### 1.1. Obtener Token (Login)

*   **Endpoint**: `POST /auth/login`
*   **Descripción**: Autentica a un usuario y devuelve un token de acceso.
*   **Request Body**:
    ```json
    {
      "email": "admin@example.com",
      "password": "your_password"
    }
    ```
*   **Successful Response (201)**:
    ```json
    {
      "access_token": "ey..."
    }
    ```

### 1.2. Usar el Token

Para todas las peticiones a endpoints protegidos, debes incluir el token en el encabezado `Authorization` con el prefijo `Bearer`.

```
Authorization: Bearer <your_access_token>
```

Para una explicación más detallada del flujo interno, consulta AUTHENTICATION.md.

### 1.3. Validar Licencia (Público)

*   **Endpoint**: `POST /licenses/validate`
*   **Descripción**: Endpoint público para que las instalaciones locales validen su clave de licencia. No requiere autenticación de usuario.
*   **Request Body**:
    ```json
    {
      "licenseKey": "ey...",
      "localTenantId": "uuid-del-tenant-local"
    }
    ```
*   **Successful Response (200)**:
    ```json
    {
        "isValid": true,
        "status": "active",
        "tenantId": "uuid-del-tenant-local",
        "userLimit": 10,
        "branchLimit": 2,
        "expiresAt": "2024-12-31T23:59:59.000Z"
    }
    ```
*   **Error Response (401 Unauthorized)**: Si la licencia es inválida, expiró o fue revocada.

### 1.4. Cambiar de Sucursal (Switch Location)

*   **Endpoint**: `PATCH /auth/switch-location`
*   **Descripción**: Permite a un usuario (generalmente un `Admin`) cambiar su sucursal activa. Devuelve un nuevo `access_token` con el `locationId` actualizado en su payload. El frontend debe reemplazar el token antiguo por este nuevo para que las siguientes peticiones se realicen en el contexto de la nueva sucursal.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Request Body**:
    ```json
    {
      "locationId": "uuid-de-la-nueva-sucursal"
    }
    ```
*   **Successful Response (200)**:
    ```json
    {
      "access_token": "ey... (nuevo token)"
    }
    ```

## 2. Autorización (Roles)

El acceso a ciertos endpoints está restringido por roles. El rol del usuario se incluye en el payload del JWT y es verificado por el `RolesGuard` en el backend.

Los roles disponibles son:
*   `admin`: Acceso total para crear, modificar y eliminar recursos.
*   `manager`: (A definir)
*   `kitchen`: (A definir)
*   `delivery`: (A definir)

## 3. Endpoints

---

### Módulo de Usuarios (`/users`)

#### `GET /users/profile`
*   **Descripción**: Obtiene el perfil del usuario actualmente autenticado.
*   **Protección**: `JWT Auth` (Cualquier rol autenticado).
*   **Successful Response (200)**:
    ```json
    {
        "id": "uuid-del-usuario",
        "email": "user@example.com",
        "fullName": "Nombre Apellido",
        "role": {
            "id": "uuid-del-rol",
            "name": "admin"
        }
    }
    ```

#### `POST /users`
*   **Descripción**: Crea un nuevo usuario.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Request Body (`CreateUserDto`)**:
    ```json
    {
      "email": "newuser@example.com",
      "password": "strong_password",
      "fullName": "Nuevo Usuario",
      "roleId": "uuid-del-rol" // El ID de un rol existente
    }
    ```
*   **Successful Response (201)**: Devuelve el objeto del usuario creado (sin la contraseña).

#### `GET /users`
*   **Descripción**: Obtiene una lista de todos los usuarios.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Successful Response (200)**: Un array de objetos de usuario.

#### `GET /users/:id`
*   **Descripción**: Obtiene un usuario específico por su ID.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del usuario.
*   **Successful Response (200)**: El objeto del usuario (sin la contraseña).

#### `PATCH /users/:id`
*   **Descripción**: Actualiza un usuario existente.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del usuario.
*   **Request Body (`UpdateUserDto`)**:
    ```json
    { "fullName": "Nombre Actualizado" }
    ```
*   **Successful Response (200)**: Devuelve el objeto del usuario actualizado.

#### `DELETE /users/:id`
*   **Descripción**: Elimina un usuario.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del usuario.
*   **Successful Response (200)**: `null` o `{}`.

---

### Módulo de Categorías de Productos (`/product-categories`)

#### `GET /product-categories`
*   **Descripción**: Lista todas las categorías de productos.
*   **Protección**: Público.
*   **Query Parameters (Opcional)**:
    *   `includeDeleted` (boolean): Si se establece en `true`, el listado incluirá también las categorías eliminadas (soft-delete). Ejemplo: `/product-categories?includeDeleted=true`.
*   **Successful Response (200)**:
    ```json
    [
        {
            "id": "uuid-de-categoria-1",
            "name": "Pizzas Clásicas",
            "description": "Las de toda la vida.",
            "createdAt": "...",
            "updatedAt": "..."
        }
    ]
    ```

#### `POST /product-categories`
*   **Descripción**: Crea una nueva categoría de producto.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Request Body (`CreateProductCategoryDto`)**:
    ```json
    {
      "name": "Pizzas Gourmet",
      "description": "Para paladares exigentes."
    }
    ```
*   **Successful Response (201)**: Devuelve el objeto de la categoría creada.

#### `PATCH /product-categories/:id`
*   **Descripción**: Actualiza una categoría de producto existente.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) de la categoría.
*   **Request Body (`UpdateProductCategoryDto`)**:
    ```json
    { "description": "Nuevas pizzas para paladares exigentes." }
    ```
*   **Successful Response (200)**: Devuelve el objeto de la categoría actualizada.

#### `DELETE /product-categories/:id`
*   **Descripción**: Realiza un "soft delete" de una categoría de producto. La categoría no se elimina permanentemente de la base de datos, sino que se marca como eliminada y se puede restaurar.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) de la categoría.
*   **Successful Response (204 No Content)**.

#### `PATCH /product-categories/:id/restore`
*   **Descripción**: Restaura una categoría de producto que ha sido eliminada mediante "soft delete".
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) de la categoría a restaurar.
*   **Successful Response (204 No Content)**.

#### `GET /product-categories/export`
*   **Descripción**: Exporta todas las categorías de productos a un archivo CSV.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Successful Response (200)**: Un archivo `categories.csv` para descargar.

#### `POST /product-categories/import`
*   **Descripción**: Importa categorías de productos desde un archivo CSV. El CSV debe tener las columnas `name` y `description`. Si se incluye una columna `id` y coincide con una categoría existente, se actualizará; de lo contrario, se creará una nueva.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Request Body**: `multipart/form-data` con un campo `file` que contiene el archivo CSV.
*   **Successful Response (201)**:
    ```json
    { "created": 10, "updated": 5, "errors": [] }
    ```

---

### Módulo de Productos (`/products`)

#### `GET /products`
*   **Descripción**: Lista todos los productos. Por defecto, solo devuelve los productos marcados como `disponibles` (`isAvailable: true`).
*   **Protección**: Público.
*   **Query Parameters (Opcional)**:
    *   `includeUnavailable` (boolean): Si se establece en `true`, el listado incluirá también los productos marcados como no disponibles. Ejemplo: `/products?includeUnavailable=true`.
*   **Successful Response (200)**:
    ```json
    [
        {
            "id": "uuid-de-producto-1",
            "name": "Pizza Margarita",
            "description": "Salsa de tomate, mozzarella y albahaca.",
            "price": "10.50",
            "imageUrl": "http://example.com/margarita.jpg",
            "category": {
                "id": "uuid-de-categoria-1",
                "name": "Pizzas Clásicas"
            }
        }
    ]
    ```

#### `POST /products`
*   **Descripción**: Crea un nuevo producto.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **Request Body (`CreateProductDto`)**:
    ```json
    {
      "name": "Pizza Pepperoni",
      "description": "La clásica con pepperoni.",
      "price": 12.00,
      "categoryId": "uuid-de-categoria-1",
      "imageUrl": "http://example.com/pepperoni.jpg"
    }
    ```
*   **Successful Response (201)**: Devuelve el objeto del producto creado.

#### `PATCH /products/:id`
*   **Descripción**: Actualiza un producto existente.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del producto.
*   **Request Body (`UpdateProductDto`)**:
    ```json
    { "price": 12.50 }
    ```
*   **Successful Response (200)**: Devuelve el objeto del producto actualizado.

#### `DELETE /products/:id`
*   **Descripción**: Elimina un producto.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del producto.
*   **Successful Response (200)**: `null` o `{}`.

#### `GET /products/:id/ingredients`
*   **Descripción**: Obtiene la receta (lista de ingredientes) de un producto específico.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager` o `kitchen`.
*   **URL Parameters**: `id` (UUID) del producto.
*   **Successful Response (200)**: Un array con los ingredientes y cantidades de la receta.

#### `POST /products/:id/ingredients`
*   **Descripción**: Asigna o actualiza la receta para un producto específico. Esta operación reemplaza la receta anterior.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **URL Parameters**: `id` (UUID) del producto.
*   **Request Body (`AssignIngredientsDto`)**:
    ```json
    {
      "ingredients": [
        {
          "ingredientId": "uuid-del-ingrediente-1",
          "quantityRequired": 0.150
        },
        {
          "ingredientId": "uuid-del-ingrediente-2",
          "quantityRequired": 0.200
        }
      ]
    }
    ```
*   **Successful Response (201)**: `null` o `{}`.

#### `GET /products/:id/estimate`
*   **Descripción**: Calcula cuántas unidades de un producto se pueden fabricar con el inventario actual.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager` o `kitchen`.
*   **URL Parameters**: `id` (UUID) del producto.
*   **Successful Response (200)**:
    ```json
    {
      "estimatedUnits": 45,
      "limitingIngredient": "Queso Mozzarella"
    }
    ```

---

### Módulo de Clientes (`/customers`)

Todos los endpoints de este módulo requieren autenticación (`JWT Auth`) y el rol de `admin`.

#### `POST /customers`
*   **Descripción**: Crea un nuevo cliente.
*   **Request Body (`CreateCustomerDto`)**:
    ```json
    {
      "phoneNumber": "+5491123456789",
      "fullName": "Juan Perez",
      "addresses": "[{\"alias\": \"Casa\", \"full_address\": \"Av. Corrientes 123\"}]"
    }
    ```
*   **Successful Response (201)**: Devuelve el objeto del cliente creado.

#### `GET /customers`
*   **Descripción**: Obtiene una lista de todos los clientes.
*   **Successful Response (200)**: Un array de objetos de cliente.

#### `GET /customers/:id`
*   **Descripción**: Obtiene un cliente específico por su ID.
*   **URL Parameters**: `id` (UUID) del cliente.
*   **Successful Response (200)**: El objeto del cliente.

#### `PATCH /customers/:id`
*   **Descripción**: Actualiza un cliente existente.
*   **URL Parameters**: `id` (UUID) del cliente.
*   **Request Body (`UpdateCustomerDto`)**:
    ```json
    { "fullName": "Juan Carlos Perez" }
    ```
*   **Successful Response (200)**: Devuelve el objeto del cliente actualizado.

#### `DELETE /customers/:id`
*   **Descripción**: Elimina un cliente.
*   **URL Parameters**: `id` (UUID) del cliente.
*   **Successful Response (200)**: `null` o `{}`.

---

### Módulo de Reportes

#### `GET /orders/reports/sales`
*   **Descripción**: Obtiene un reporte de ventas filtrado por un rango de fechas. Excluye pedidos cancelados.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Query Parameters**:
    *   `startDate` (string, opcional): Fecha de inicio en formato `YYYY-MM-DD`.
    *   `endDate` (string, opcional): Fecha de fin en formato `YYYY-MM-DD`.
*   **Ejemplo de Petición**: `/orders/reports/sales?startDate=2023-10-01&endDate=2023-10-31`
*   **Successful Response (200)**:
    ```json
    {
      "reportPeriod": { "from": "2023-10-01", "to": "2023-10-31" },
      "totalOrders": 50,
      "totalRevenue": 1250.75,
      "productsBreakdown": [
        { "productId": "uuid-del-producto-1", "productName": "Pizza Margarita", "quantitySold": 25, "totalRevenue": 262.50 }
      ]
    }
    ```

---

### Módulo de Ingredientes (`/ingredients`)

#### `POST /ingredients/purchase`
*   **Descripción**: Registra una compra de ingredientes y aumenta el stock de cada uno.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Request Body (`PurchaseIngredientsDto`)**:
    ```json
    {
      "ingredients": [
        {
          "ingredientId": "uuid-del-queso",
          "quantity": 10
        },
        {
          "ingredientId": "uuid-de-la-harina",
          "quantity": 50
        }
      ]
    }
    ```
*   **Successful Response (201)**: `null` o `{}`.

#### `POST /ingredients/waste`
*   **Descripción**: Registra una merma de ingredientes y descuenta el stock.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Request Body (`RegisterWasteDto`)**:
    ```json
    {
      "items": [
        {
          "ingredientId": "uuid-del-tomate",
          "quantity": 0.5,
          "reason": "Tomates en mal estado"
        },
        {
          "ingredientId": "uuid-de-la-harina",
          "quantity": 1.2,
          "reason": "Saco roto"
        }
      ]
    }
    ```
*   **Successful Response (201)**: `null` o `{}`.

#### `POST /ingredients/adjust-stock`
*   **Descripción**: Realiza un ajuste manual del stock de ingredientes (por ejemplo, después de un conteo físico).
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Request Body (`AdjustStockDto`)**:
    ```json
    {
      "items": [
        {
          "ingredientId": "uuid-del-queso",
          "newQuantity": 48.5,
          "reason": "Ajuste por conteo físico semanal"
        },
        {
          "ingredientId": "uuid-de-la-harina",
          "newQuantity": 49.0,
          "reason": "Ajuste por conteo físico semanal"
        }
      ]
    }
    ```
*   **Successful Response (201)**: `null` o `{}`.

#### `POST /ingredients`
*   **Descripción**: Crea un nuevo ingrediente en el inventario.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Request Body (`CreateIngredientDto`)**:
    ```json
    {
      "name": "Queso Mozzarella",
      "stockQuantity": 50.5,
      "unit": "kg",
      "lowStockThreshold": 10
    }
    ```
*   **Successful Response (201)**: Devuelve el objeto del ingrediente creado.

#### `GET /ingredients`
*   **Descripción**: Obtiene una lista de todos los ingredientes.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager` o `kitchen`.
*   **Successful Response (200)**: Un array de objetos de ingrediente.

#### `GET /ingredients/:id`
*   **Descripción**: Obtiene un ingrediente específico por su ID.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager` o `kitchen`.
*   **URL Parameters**: `id` (UUID) del ingrediente.
*   **Successful Response (200)**: El objeto del ingrediente.

#### `PATCH /ingredients/:id`
*   **Descripción**: Actualiza un ingrediente existente (ej. para ajustar stock).
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **URL Parameters**: `id` (UUID) del ingrediente.
*   **Request Body (`UpdateIngredientDto`)**:
    ```json
    { "stockQuantity": 45.0 }
    ```
*   **Successful Response (200)**: Devuelve el objeto del ingrediente actualizado.

#### `DELETE /ingredients/:id`
*   **Descripción**: Elimina un ingrediente del sistema.
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del ingrediente.
*   **Successful Response (200)**: `null` o `{}`.

#### `GET /ingredients/:id/movements`
*   **Descripción**: Obtiene el historial de movimientos de stock para un ingrediente específico.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **URL Parameters**: `id` (UUID) del ingrediente.
*   **Successful Response (200)**: Un array de objetos de movimiento de inventario.
    ```json
    [
      {
        "id": "uuid-del-movimiento",
        "ingredientId": "uuid-del-ingrediente",
        "orderId": null,
        "userId": "uuid-del-usuario-admin",
        "type": "purchase",
        "quantityChange": "10.000",
        "reason": "Compra de insumos",
        "createdAt": "..."
      }
    ]
    ```

#### `GET /ingredients/reports/waste`
*   **Descripción**: Obtiene un reporte de mermas de ingredientes en un período de tiempo.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Query Parameters**:
    *   `startDate` (string, opcional): Fecha de inicio en formato `YYYY-MM-DD`.
    *   `endDate` (string, opcional): Fecha de fin en formato `YYYY-MM-DD`.
*   **Ejemplo de Petición**: `/ingredients/reports/waste?startDate=2023-10-01`
*   **Successful Response (200)**:
    ```json
    {
      "reportPeriod": {
        "from": "2023-10-01",
        "to": "N/A"
      },
      "totalWasteEntries": 5,
      "summary": [
        {
          "ingredientId": "uuid-del-tomate",
          "ingredientName": "Tomate",
          "unit": "kg",
          "totalQuantity": 1.5,
          "entries": 3
        }
      ],
      "details": [
        {
          "id": "uuid-del-movimiento",
          "ingredientId": "uuid-del-tomate",
          "type": "waste",
          "quantityChange": "-0.500",
          "reason": "Tomates en mal estado",
          "createdAt": "..."
        }
      ]
    }
    ```

#### `GET /orders/reports/profitability`
*   **Descripción**: Obtiene un reporte de rentabilidad por producto, comparando el costo de los ingredientes con el precio de venta. Solo incluye productos con una receta definida.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Successful Response (200)**:
    ```json
    [
      {
        "productId": "uuid-del-producto",
        "productName": "Pizza Margarita",
        "sellingPrice": 12.50,
        "ingredientsCost": 4.75,
        "profit": 7.75,
        "margin": 62.00
      }
    ]
    ```

#### `GET /orders/reports/driver-performance`
*   **Descripción**: Obtiene un reporte de rendimiento para cada repartidor, basado en los pedidos entregados en un rango de fechas.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Query Parameters**:
    *   `startDate` (string, opcional): Fecha de inicio en formato `YYYY-MM-DD`.
    *   `endDate` (string, opcional): Fecha de fin en formato `YYYY-MM-DD`.
*   **Ejemplo de Petición**: `/orders/reports/driver-performance?startDate=2023-11-01`
*   **Successful Response (200)**:
    ```json
    [
      {
        "driverId": "uuid-del-repartidor-1",
        "driverName": "Juan Repartidor",
        "totalDeliveries": 52,
        "totalAmountCollected": 1560.50,
        "averageDeliveryTimeMinutes": "25.50"
      },
      {
        "driverId": "uuid-del-repartidor-2",
        "driverName": "Ana Veloz",
        "totalDeliveries": 45,
        "totalAmountCollected": 1350.00,
        "averageDeliveryTimeMinutes": "22.75"
      }
    ]
    ```
---

---

### Módulo de Pedidos (`/orders`)

#### `POST /orders`
*   **Descripción**: Crea un nuevo pedido. El sistema calcula el `totalAmount` automáticamente.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Request Body (`CreateOrderDto`)**:
    ```json
    {
      "customerId": "uuid-del-cliente",
      "orderType": "delivery",
      "paymentMethod": "cash",
      "deliveryAddress": "Av. Corrientes 123, CABA",
      "items": [
        {
          "productId": "uuid-del-producto-1",
          "quantity": 2,
          "notes": "Sin cebolla"
        },
        {
          "productId": "uuid-del-producto-2",
          "quantity": 1
        }
      ]
    }
    ```
*   **Successful Response (201)**: Devuelve el objeto del pedido creado.

#### `GET /orders`
*   **Descripción**: Obtiene una lista de todos los pedidos.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager` o `kitchen`.
*   **Successful Response (200)**: Un array de objetos de pedido.

#### `GET /orders/:id`
*   **Descripción**: Obtiene un pedido específico por su ID.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager`, `kitchen` o `delivery`.
*   **URL Parameters**: `id` (UUID) del pedido.
*   **Successful Response (200)**: El objeto del pedido.

#### `PATCH /orders/:id`
*   **Descripción**: Actualiza el estado de un pedido, su estado de pago o el repartidor asignado.
*   **Protección**: `JWT Auth` + `Rol: admin`, `manager` o `kitchen`.
*   **URL Parameters**: `id` (UUID) del pedido.
*   **Request Body (`UpdateOrderDto`)**:
    ```json
    {
      "status": "in_preparation",
      "assignedDriverId": "uuid-del-repartidor"
    }
    ```
*   **Successful Response (200)**: Devuelve el objeto del pedido actualizado.

#### `DELETE /orders/:id`
*   **Descripción**: Elimina un pedido (operación destructiva).
*   **Protección**: `JWT Auth` + `Rol: admin`.
*   **URL Parameters**: `id` (UUID) del pedido.
*   **Successful Response (200)**: `null` o `{}`.

#### `GET /orders/reports/sales`
*   **Descripción**: Obtiene un reporte de ventas filtrado por un rango de fechas.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Query Parameters**:
    *   `startDate` (string, opcional): Fecha de inicio en formato `YYYY-MM-DD`.
    *   `endDate` (string, opcional): Fecha de fin en formato `YYYY-MM-DD`.
*   **Ejemplo de Petición**: `/orders/reports/sales?startDate=2023-10-01&endDate=2023-10-31`
*   **Successful Response (200)**:
    ```json
    {
      "reportPeriod": {
        "from": "2023-10-01",
        "to": "2023-10-31"
      },
      "totalOrders": 50,
      "totalRevenue": 1250.75,
      "productsBreakdown": [
        {
          "productId": "uuid-del-producto-1",
          "productName": "Pizza Margarita",
          "quantitySold": 25,
          "totalRevenue": 262.50
        }
      ],
      "orders": [
        {
          "id": "uuid-del-pedido",
          "...": "..."
        }
      ]
    }
    ```
 
#### `GET /orders/reports/ingredient-consumption`
*   **Descripción**: Obtiene un reporte del consumo total de ingredientes basado en las ventas de un período. Excluye pedidos cancelados.
*   **Protección**: `JWT Auth` + `Rol: admin` o `manager`.
*   **Query Parameters**:
    *   `startDate` (string, opcional): Fecha de inicio en formato `YYYY-MM-DD`.
    *   `endDate` (string, opcional): Fecha de fin en formato `YYYY-MM-DD`.
*   **Ejemplo de Petición**: `/orders/reports/ingredient-consumption?startDate=2023-10-01`
*   **Successful Response (200)**:
    ```json
    {
      "reportPeriod": {
        "from": "2023-10-01",
        "to": "ahora"
      },
      "consumedIngredients": [
        {
          "ingredientId": "uuid-del-queso",
          "ingredientName": "Queso Mozzarella",
          "unit": "kg",
          "totalConsumed": 12.5
        }
      ]
    }
    ```