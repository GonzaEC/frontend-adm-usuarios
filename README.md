# Frontend Administración de Usuarios — SIP 2026

Interfaz web para la administración de usuarios, roles y permisos del sistema SIP. Consume la API REST del backend [rbac-springboot](../rbac-springboot).

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5 | Tipado estático |
| Vite | 6 | Bundler y servidor de desarrollo |
| Tailwind CSS | v4 | Estilos utilitarios |
| React Router | v7 | Navegación SPA |
| TanStack React Query | v5 | Fetch, caché y estado del servidor |
| Axios | — | Cliente HTTP con interceptores JWT |
| jwt-decode | — | Lectura del payload del token |

## Estructura del proyecto

```
src/
├── api/
│   ├── client.ts          # Instancia Axios con Bearer token y manejo de 401
│   ├── auth.ts            # Login, registro, cambio de contraseña
│   ├── users.ts           # CRUD usuarios + activar/desactivar
│   ├── roles.ts           # CRUD roles + asignación de permisos
│   ├── permissions.ts     # CRUD permisos
│   └── mock.ts            # Datos en memoria para desarrollo sin backend
├── context/
│   └── AuthContext.tsx    # Estado global de auth, signIn/signOut, hasPermission()
├── components/
│   ├── Layout.tsx         # Header con nav filtrado por permisos/rol y botón salir
│   ├── ProtectedRoute.tsx # Redirige a /login si no hay token
│   ├── AdminRoute.tsx     # Guarda de ruta por permiso y/o rol específico
│   ├── UserModal.tsx      # Modal crear/editar usuario
│   ├── RoleModal.tsx      # Modal crear/editar rol con checkboxes de permisos
│   └── PermissionModal.tsx# Modal crear/editar permiso
├── pages/
│   ├── LoginPage.tsx      # Login y registro en una misma pantalla
│   ├── UsersPage.tsx      # Tabla paginada de usuarios
│   ├── UserDetailPage.tsx # Detalle de un usuario con sus permisos de rol
│   ├── RolesPage.tsx      # Gestión de roles y sus permisos
│   ├── PermissionsPage.tsx# Gestión del catálogo de permisos
│   └── AccountPage.tsx    # Perfil y cambio de contraseña del usuario logueado
├── types/
│   └── index.ts           # Interfaces: User, Role, Permission, Page, AuthState, etc.
├── config.ts              # Flag USE_MOCK para alternar mock/backend real
├── App.tsx                # Providers, rutas y guardas de acceso
└── main.tsx               # Punto de entrada
```

## Cómo levantar

### Requisitos
- Node.js 18+
- Backend `rbac-springboot` corriendo en `http://localhost:8080`

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre en `http://localhost:5173`. Las requests a `/api/*` se redirigen al backend via proxy de Vite (sin CORS en desarrollo).

### Build para producción

```bash
npm run build
```

### Modo mock (sin backend)

En `src/config.ts` cambiar:
```ts
export const USE_MOCK = true;
```
Usa datos en memoria definidos en `src/api/mock.ts`. Útil para desarrollo de UI sin depender del backend.

## Autenticación y autorización

### Flujo JWT
1. El usuario ingresa email y contraseña en `/login`
2. El backend devuelve un JWT con vigencia de 24 horas
3. El token se persiste en `localStorage` y se decodifica con `jwt-decode`
4. El payload incluye: `sub` (email), `role`, `id`, `permissions[]`
5. Cada request incluye automáticamente `Authorization: Bearer <token>`
6. Si el backend responde **401**, el token se elimina y redirige a `/login`. Los **403** no desloguean (el usuario puede no tener permiso para una acción puntual)

### Control de acceso por ruta

| Ruta | Requisito |
|---|---|
| `/login` | Pública |
| `/cuenta` | Cualquier usuario autenticado |
| `/usuarios`, `/usuarios/:id` | Permiso `user:read` en JWT |
| `/roles`, `/permisos` | Rol `ADMIN` (no alcanza con permisos — protección contra escalada de privilegios) |

El componente `AdminRoute` acepta `permission` y/o `requiredRole` para proteger rutas de forma granular.

### Visibilidad del menú

El nav se filtra dinámicamente: cada ítem solo aparece si el usuario cumple el requisito de permiso/rol de esa sección. Un DEVELOPER con `user:read` ve **Usuarios** y **Mi cuenta** pero nunca Roles ni Permisos.

## Páginas

### Login (`/login`)
Pantalla unificada con dos modos: **Iniciar sesión** y **Registrarse**. Después del registro se redirige a `/cuenta` (los usuarios nuevos tienen rol BASIC sin acceso al panel de administración).

### Usuarios (`/usuarios`)
Tabla paginada con todos los usuarios del sistema. Por fila:
- Ver detalle completo → `/usuarios/:id`
- Editar email y rol
- Activar / Desactivar (baja lógica). No se puede desactivar la propia cuenta.

### Detalle de usuario (`/usuarios/:id`)
Ficha completa del usuario: datos, estado, rol y listado de permisos del rol asignado.

### Roles (`/roles`) — solo ADMIN
Gestión del catálogo de roles. Permite crear, editar nombre/descripción y administrar el conjunto de permisos asignados a cada rol mediante checkboxes.

### Permisos (`/permisos`) — solo ADMIN
Gestión del catálogo de permisos. Permite crear, editar y eliminar permisos. El campo descripción es opcional; si se omite, se genera automáticamente como `"Permiso para <NOMBRE>"`.

### Mi cuenta (`/cuenta`)
Muestra el email y rol del usuario logueado. Permite cambiar la contraseña (requiere contraseña actual). .

## Endpoints del backend que consume

| Método | URL | Descripción | Permiso backend |
|--------|-----|-------------|-----------------|
| POST | `/api/auth/login` | Obtener token JWT | Público |
| POST | `/api/users` | Registrar usuario | Público |
| GET | `/api/users` | Listar usuarios (paginado) | `user:read` |
| GET | `/api/users/{id}` | Detalle de usuario | `user:read` |
| PUT | `/api/users/{id}` | Editar email | `user:update` |
| PUT | `/api/users/{id}/role` | Cambiar rol | `user:update` |
| PUT | `/api/users/{id}/activate` | Activar usuario | `user:update` |
| DELETE | `/api/users/{id}` | Desactivar usuario | `user:delete` |
| PUT | `/api/auth/change-password` | Cambiar contraseña | Autenticado |
| GET | `/api/roles` | Listar roles | Autenticado |
| POST | `/api/roles` | Crear rol | `ADMIN` |
| PUT | `/api/roles/{id}` | Editar rol | `ADMIN` |
| PUT | `/api/roles/{id}/permissions` | Asignar permisos al rol | `ADMIN` |
| DELETE | `/api/roles/{id}` | Eliminar rol | `ADMIN` |
| GET | `/api/permissions` | Listar permisos | Autenticado |
| POST | `/api/permissions` | Crear permiso | `ADMIN` |
| PUT | `/api/permissions/{id}` | Editar permiso | `ADMIN` |
| DELETE | `/api/permissions/{id}` | Eliminar permiso | `ADMIN` |
