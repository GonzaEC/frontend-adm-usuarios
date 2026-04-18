/**
 * Mock server — simula el backend con datos en memoria.
 * Reemplazar por las llamadas reales cuando los endpoints estén disponibles.
 */
import type { User, Role, Permission, Page } from '../types';

// ─────────────────────────── Store en memoria ───────────────────────────

const permissions: Permission[] = [
  { id: 1, name: 'PROJECT_READ' },
  { id: 2, name: 'PROJECT_CREATE' },
  { id: 3, name: 'PROJECT_DELETE' },
  { id: 4, name: 'INVEST' },
  { id: 5, name: 'USER_READ' },
  { id: 6, name: 'USER_CREATE' },
  { id: 7, name: 'USER_UPDATE' },
  { id: 8, name: 'USER_DELETE' },
  { id: 9, name: 'ROLE_READ' },
  { id: 10, name: 'ROLE_CREATE' },
  { id: 11, name: 'ROLE_UPDATE' },
  { id: 12, name: 'ROLE_DELETE' },
];

const roles: Role[] = [
  { id: 1, name: 'BASIC',     permissions: [permissions[0]] },
  { id: 2, name: 'INVESTOR',  permissions: [permissions[0], permissions[3]] },
  { id: 3, name: 'DEVELOPER', permissions: [permissions[0], permissions[1]] },
  { id: 4, name: 'ADMIN',     permissions: [...permissions] },
];

const users: User[] = [
  { id: 1, email: 'admin@sip.com',    role: roles[3], active: true },
  { id: 2, email: 'dev@sip.com',      role: roles[2], active: true },
  { id: 3, email: 'investor@sip.com', role: roles[1], active: true },
  { id: 4, email: 'basic@sip.com',    role: roles[0], active: true },
  { id: 5, email: 'inactive@sip.com', role: roles[0], active: false },
];

let nextPermissionId = 13;
let nextRoleId = 5;
let nextUserId = 6;

// ─────────────────────────── Helpers ───────────────────────────

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function paginate<T>(items: T[], page: number, size: number): Page<T> {
  const start = page * size;
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    number: page,
    size,
  };
}

function makeToken(email: string, role: string, id: number): string {
  const roleData = roles.find((r) => r.name === role);
  // Fake JWT — header.payload.signature con el payload real codificado en base64
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: email,
    role,
    id,
    permissions: (roleData?.permissions ?? []).map((p) => p.name),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }));
  return `${header}.${payload}.mock-signature`;
}

// ─────────────────────────── Auth ───────────────────────────

export async function mockLogin(email: string, _password: string): Promise<string> {
  await delay();
  const user = users.find((u) => u.email === email);
  if (!user) throw mockError('Credenciales inválidas', 401);
  if (!user.active) throw mockError('Usuario inactivo', 403);
  return makeToken(user.email, user.role.name, user.id);
}

export async function mockRegister(email: string, _password: string): Promise<string> {
  await delay();
  if (users.some((u) => u.email === email)) {
    throw mockError('El email ya está registrado', 409);
  }
  const basic = roles.find((r) => r.name === 'BASIC')!;
  const user: User = { id: nextUserId++, email, role: basic, active: true };
  users.push(user);
  return makeToken(user.email, user.role.name, user.id);
}

export async function mockChangePassword(email: string, _old: string, _new: string): Promise<void> {
  await delay();
  const user = users.find((u) => u.email === email);
  if (!user) throw mockError('Usuario no encontrado', 404);
  // En mock no validamos el password real
}

// ─────────────────────────── Users ───────────────────────────

export async function mockGetUsers(page: number, size: number): Promise<Page<User>> {
  await delay();
  return paginate(users, page, size);
}

export async function mockGetUserById(id: number): Promise<User> {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) throw mockError('Usuario no encontrado', 404);
  return user;
}

export async function mockCreateUser(email: string, _password: string, roleId: number): Promise<User> {
  await delay();
  if (users.some((u) => u.email === email)) {
    throw mockError('El email ya está registrado', 409);
  }
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw mockError('Rol inexistente', 400);
  const user: User = { id: nextUserId++, email, role, active: true };
  users.push(user);
  return user;
}

export async function mockUpdateUser(id: number, email: string, roleId: number): Promise<User> {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) throw mockError('Usuario no encontrado', 404);
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw mockError('Rol inexistente', 400);
  user.email = email;
  user.role = role;
  return user;
}

export async function mockDeactivateUser(id: number): Promise<void> {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) throw mockError('Usuario no encontrado', 404);
  user.active = false;
}

export async function mockActivateUser(id: number): Promise<void> {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) throw mockError('Usuario no encontrado', 404);
  user.active = true;
}

// ─────────────────────────── Roles ───────────────────────────

export async function mockGetRoles(): Promise<Role[]> {
  await delay();
  return [...roles];
}

export async function mockGetRoleById(id: number): Promise<Role> {
  await delay();
  const role = roles.find((r) => r.id === id);
  if (!role) throw mockError('Rol no encontrado', 404);
  return role;
}

export async function mockCreateRole(name: string, permissionIds: number[]): Promise<Role> {
  await delay();
  if (roles.some((r) => r.name === name)) {
    throw mockError('Ya existe un rol con ese nombre', 409);
  }
  const rolePermissions = permissions.filter((p) => permissionIds.includes(p.id));
  const role: Role = { id: nextRoleId++, name, permissions: rolePermissions };
  roles.push(role);
  return role;
}

export async function mockUpdateRole(id: number, name: string, permissionIds: number[]): Promise<Role> {
  await delay();
  const role = roles.find((r) => r.id === id);
  if (!role) throw mockError('Rol no encontrado', 404);
  if (roles.some((r) => r.name === name && r.id !== id)) {
    throw mockError('Ya existe un rol con ese nombre', 409);
  }
  role.name = name;
  role.permissions = permissions.filter((p) => permissionIds.includes(p.id));
  return role;
}

export async function mockDeleteRole(id: number): Promise<void> {
  await delay();
  const role = roles.find((r) => r.id === id);
  if (!role) throw mockError('Rol no encontrado', 404);
  if (users.some((u) => u.role.id === id)) {
    throw mockError('No se puede eliminar: hay usuarios asignados a este rol', 409);
  }
  const i = roles.findIndex((r) => r.id === id);
  roles.splice(i, 1);
}

// ─────────────────────────── Permisos ───────────────────────────

export async function mockGetPermissions(): Promise<Permission[]> {
  await delay();
  return [...permissions];
}

export async function mockCreatePermission(name: string): Promise<Permission> {
  await delay();
  if (permissions.some((p) => p.name === name)) {
    throw mockError('Ya existe un permiso con ese nombre', 409);
  }
  const p: Permission = { id: nextPermissionId++, name };
  permissions.push(p);
  return p;
}

export async function mockUpdatePermission(id: number, name: string): Promise<Permission> {
  await delay();
  const p = permissions.find((x) => x.id === id);
  if (!p) throw mockError('Permiso no encontrado', 404);
  if (permissions.some((x) => x.name === name && x.id !== id)) {
    throw mockError('Ya existe un permiso con ese nombre', 409);
  }
  p.name = name;
  return p;
}

export async function mockDeletePermission(id: number): Promise<void> {
  await delay();
  const p = permissions.find((x) => x.id === id);
  if (!p) throw mockError('Permiso no encontrado', 404);
  if (roles.some((r) => r.permissions.some((perm) => perm.id === id))) {
    throw mockError('No se puede eliminar: hay roles que usan este permiso', 409);
  }
  const i = permissions.findIndex((x) => x.id === id);
  permissions.splice(i, 1);
}

// ─────────────────────────── Errores ───────────────────────────

function mockError(message: string, status: number) {
  return {
    response: {
      status,
      data: { message, status, data: null, timestamp: new Date().toISOString() },
    },
  };
}
