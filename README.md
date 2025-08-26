# Mozzarella Cloud

**Mozzarella Cloud** es un sistema de gestión integral (ERP/CRM) para pizzerías, diseñado para ser una solución moderna, escalable y eficiente. El objetivo es optimizar todas las áreas del negocio, desde la toma de pedidos hasta la entrega final.

Este proyecto está siendo construido con un stack tecnológico moderno para asegurar un alto rendimiento y una excelente experiencia de usuario.

## Documentación Clave

*   [Arquitectura del Proyecto](./ARCHITECTURE.md)
*   [Esquema de la Base de Datos](./DATABASE_SCHEMA.md)
*   [Guía de Contribución](./CONTRIBUTING.md)
*   [Registro de Cambios](./CHANGELOG.md)

## Stack Tecnológico

| Componente                | Tecnología Recomendada          |
| ------------------------- | ------------------------------- |
| **Backend**               | Node.js (con NestJS) + TypeScript |
| **Base de Datos Principal** | PostgreSQL con PostGIS          |
| **Base de Datos Tiempo Real** | Firebase Realtime / Firestore   |
| **Frontend Web (Admin/CRM)**  | React + Ant Design (AntD)       |
| **App Móvil (Repartidores)**  | React Native                    |
| **Despliegue**            | Docker                          |
| **Chatbot WhatsApp**      | API de Twilio / Meta            |
| **Optimización de Rutas** | API de Google Maps / Mapbox     |

## Módulos Principales

- **Módulo de Recepción y CRM:** Gestión de clientes, toma de pedidos e integración con Chatbot de WhatsApp.
- **Módulo de Cocina:** Gestión de recetas, control de inventario y Kitchen Display System (KDS).
- **Módulo de Producción y Despacho:** Transformación de inventario y asignación de pedidos.
- **Módulo de Reparto y Logística:** App móvil para repartidores, optimización de rutas y seguimiento en tiempo real.

## Gestión del Proyecto

La gestión de tareas, reporte de bugs y planificación de nuevas características se realiza a través de [GitHub Issues](https://github.com/tu-usuario/Mozzarella_Cloud/issues).