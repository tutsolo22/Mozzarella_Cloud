# Arquitectura del Proyecto Mozzarella Cloud

El sistema está diseñado siguiendo una arquitectura de microservicios/servicios distribuidos para garantizar la escalabilidad, mantenibilidad y despliegue independiente de los componentes.

## Diagrama de Componentes

```mermaid
graph TD
    subgraph "Clientes"
        Usuario_Web[Usuario Web/Recepcionista]
        Cliente_WhatsApp[Cliente Final por WhatsApp]
        Repartidor[Repartidor con App Móvil]
    end

    subgraph "Frontend"
        WebApp[Panel de Admin (React + AntD)]
        KDS[Kitchen Display System (React)]
        MobileApp[App Repartidor (React Native)]
    end

    subgraph "Backend Services"
        API_Gateway[API Gateway]
        Auth_Service[Servicio de Autenticación]
        Orders_Service[Servicio de Pedidos y CRM]
        Inventory_Service[Servicio de Inventario y Recetas]
        Chatbot_Service[Servicio de Chatbot WhatsApp]
        Routing_Service[Servicio de Rutas y Geo]
    end

    subgraph "Bases de Datos"
        PostgreSQL[PostgreSQL (PostGIS)]
        Firebase[Firebase (Realtime DB / Firestore)]
    end

    subgraph "APIs Externas"
        Twilio[Twilio/Meta API]
        GoogleMaps[Google Maps/Mapbox API]
    end

    Usuario_Web --> WebApp;
    WebApp --> API_Gateway;
    KDS --> Firebase;
    Repartidor --> MobileApp;
    MobileApp --> API_Gateway;
    MobileApp --> Firebase;

    API_Gateway --> Auth_Service & Orders_Service & Inventory_Service;
    Orders_Service & Inventory_Service & Auth_Service --> PostgreSQL;
    Orders_Service --> Firebase;

    Cliente_WhatsApp <--> Twilio --> Chatbot_Service;
    Chatbot_Service --> API_Gateway;

    Routing_Service --> GoogleMaps;
    API_Gateway --> Routing_Service;
```

## Descripción de Componentes

1.  **Frontend (React / React Native)**: Interfaces de usuario para los diferentes actores del sistema. Se comunican principalmente con el Backend a través de una API REST/GraphQL. El KDS y la App Móvil también escuchan eventos en tiempo real desde Firebase.
2.  **Backend (Node.js / NestJS)**: El cerebro del sistema. Expone una API segura y gestiona toda la lógica de negocio. Se comunica con la base de datos principal y otros servicios.
3.  **Servicio de Chatbot**: Un microservicio dedicado que maneja la lógica de la conversación con los clientes a través de la API de WhatsApp.
4.  **Servicio de Rutas**: Un microservicio que se comunica con APIs externas (Google Maps/Mapbox) para calcular las rutas de entrega óptimas.
5.  **Base de Datos (PostgreSQL + Firebase)**: Usamos PostgreSQL como la base de datos relacional principal para datos estructurados (clientes, pedidos, inventario) y Firebase para funcionalidades en tiempo real (notificaciones al KDS, ubicación de repartidores).