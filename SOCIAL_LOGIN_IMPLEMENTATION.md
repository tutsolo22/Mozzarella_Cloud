# Guía de Implementación: Inicio de Sesión Social (OAuth 2.0)

Este documento detalla los requisitos técnicos y los pasos necesarios para implementar el inicio de sesión con proveedores externos como Google, Microsoft y Apple en Mozzarella Cloud.

## Visión General del Flujo (OAuth 2.0)

El proceso delega la autenticación al proveedor social, evitando que nuestra aplicación maneje directamente las contraseñas del usuario.

1.  **Inicio**: El usuario hace clic en "Iniciar sesión con Google" en nuestro frontend.
2.  **Redirección a la API**: El frontend redirige al usuario a un endpoint de nuestra API (ej. `GET /auth/google`).
3.  **Redirección al Proveedor**: Nuestra API, usando Passport.js, redirige al usuario a la página de inicio de sesión de Google.
4.  **Autenticación del Usuario**: El usuario se autentica con su cuenta de Google.
5.  **Callback a la API**: Google redirige al usuario de vuelta a nuestra API (a una URL de callback como `GET /auth/google/callback`) con un código de autorización temporal.
6.  **Obtención del Perfil**: Nuestra API intercambia ese código por un token de acceso y lo usa para obtener el perfil del usuario de Google (nombre, email, ID único).
7.  **Lógica de "Buscar o Crear"**:
    *   La API busca en nuestra base de datos un usuario con el email recibido.
    *   **Si el usuario existe**: Se vincula su ID de Google a la cuenta existente.
    *   **Si el usuario no existe**: Se crea un nuevo `User` y un nuevo `Tenant` en nuestra base de datos.
8.  **Generación de Token JWT**: Nuestra API genera nuestro propio token JWT para el usuario, exactamente como en el flujo de login con contraseña.
9.  **Redirección Final al Frontend**: La API redirige al usuario de vuelta a una página especial en nuestro frontend (ej. `/auth/callback?token=...`), pasándole el token JWT. El frontend guarda el token y redirige al usuario al dashboard, completando el inicio de sesión.

---

## Requisitos del Backend

La mayor parte de la lógica reside en el backend.

### 1. Dependencias y Estrategias de Passport.js

Necesitaremos instalar y configurar una "estrategia" de Passport para cada proveedor.

```bash
npm install passport-google-oauth20 passport-microsoft passport-apple
npm install --save-dev @types/passport-google-oauth20 @types/passport-microsoft @types/passport-apple
```

### 2. Modificaciones en la Base de Datos

La entidad `User` debe ser actualizada para almacenar los IDs de los proveedores y permitir contraseñas nulas.

**`backend/src/users/entities/user.entity.ts`**
```typescript
@Entity('users')
export class User {
  // ... otras columnas

  @Column({ select: false, nullable: true }) // <-- Hacer la contraseña opcional
  password: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  microsoftId: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  appleId: string | null;

  // ... resto de la entidad
}
```

### 3. Nuevos Endpoints en la API

En `backend/src/auth/auth.controller.ts`, se deben añadir las rutas para iniciar el flujo y para el callback.

```typescript
// backend/src/auth/auth.controller.ts

// Ruta para iniciar el login con Google
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth(@Req() req) {
  // Passport se encarga de la redirección a Google
}

// Ruta de callback a la que Google redirigirá
@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req, @Res() res) {
  const { access_token } = await this.authService.login(req.user);
  // Redirigir al frontend con el token
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`);
}

// Repetir para Microsoft y Apple...
```

### 4. Lógica de Servicio "Buscar o Crear"

En `backend/src/auth/auth.service.ts`, se debe implementar la lógica que maneja el perfil devuelto por el proveedor.

```typescript
// backend/src/auth/auth.service.ts

async findOrCreateUser(profile: any, provider: 'google' | 'microsoft' | 'apple') {
  const { id, name, emails } = profile;
  const email = emails[0].value;

  let user = await this.usersRepository.findOne({ where: { email } });

  if (user) {
    // Si el usuario existe, vinculamos su ID de proveedor
    user[`${provider}Id`] = id;
  } else {
    // Si no existe, creamos el usuario y un tenant para él
    // La lógica de creación de tenant debe ser similar a la del `register` actual
    const tenantName = `Negocio de ${name.givenName}`;
    // ...lógica para crear Tenant, User, Location por defecto...
    user = this.usersRepository.create({
      email,
      fullName: `${name.givenName} ${name.familyName}`,
      [`${provider}Id`]: id,
      // ...otros campos necesarios...
    });
  }

  await this.usersRepository.save(user);
  return user;
}
```

---

## Requisitos del Frontend

### 1. Botones en la UI

En `LoginPage.tsx` y `RegisterPage.tsx`, añadir los botones. Serán simples enlaces a la API.

```typescriptreact
// frontend/src/pages/login/LoginPage.tsx

<a href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}>
  <Button icon={<GoogleOutlined />}>Continuar con Google</Button>
</a>
// Repetir para los otros proveedores
```

### 2. Página de Callback

Crear una nueva página/componente que maneje la redirección desde el backend.

**`frontend/src/pages/auth/AuthCallbackPage.tsx`**
```typescriptreact
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Guardar el token y recargar el estado del usuario
      setTokenAndUser(token);
      // Redirigir al dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // Manejar error y redirigir al login
      navigate('/login', { replace: true });
    }
  }, [location, navigate, setTokenAndUser]);

  return <Spin tip="Autenticando..." />;
};
```

Finalmente, añadir la nueva ruta en `App.tsx`:

```typescriptreact
// frontend/src/App.tsx
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

---

## Pasos Administrativos (Investigación)

Para cada proveedor, es necesario crear una "Aplicación" en su respectiva consola de desarrollador para obtener las credenciales (`Client ID` y `Client Secret`).

1.  **Google**:
    *   Ir a la Google Cloud Console.
    *   Crear un nuevo proyecto.
    *   Ir a "APIs y servicios" > "Credenciales".
    *   Crear "ID de cliente de OAuth 2.0" de tipo "Aplicación web".
    *   **URIs de redireccionamiento autorizadas**: Añadir la URL de callback de nuestra API (ej. `https://api.tudominio.com/auth/google/callback`).

2.  **Microsoft**:
    *   Ir al Portal de Azure.
    *   Ir a "Azure Active Directory" > "Registros de aplicaciones".
    *   Crear un nuevo registro.
    *   En "Autenticación", añadir una plataforma "Web" y configurar la **URI de redireccionamiento** (ej. `https://api.tudominio.com/auth/microsoft/callback`).
    *   En "Certificados y secretos", crear un nuevo secreto de cliente.

3.  **Apple**:
    *   **Requisito**: Se necesita una cuenta de Apple Developer (es de pago).
    *   Ir al portal de Apple Developer.
    *   Crear un "App ID" y un "Service ID".
    *   Configurar el "Service ID" con el dominio y las URLs de redirección.
    *   Crear una "Clave privada" (`.p8`) para firmar las peticiones. Este es el paso más complejo.

**Recomendación**: Empezar con un solo proveedor (Google es el más sencillo) para establecer el flujo completo. Una vez funcionando, replicar la lógica para los demás será más rápido.