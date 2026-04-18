import client from './client';
import type { ApiResponse, Page, User } from '../types';
import { USE_MOCK } from '../config';
import {
  mockGetUsers,
  mockGetUserById,
  mockCreateUser,
  mockUpdateUser,
  mockDeactivateUser,
  mockActivateUser,
} from './mock';

export async function getUsers(page = 0, size = 10): Promise<Page<User>> {
  if (USE_MOCK) return mockGetUsers(page, size);
  const res = await client.get<ApiResponse<Page<User>>>('/users', {
    params: { page, size },
  });
  return res.data.data;
}

export async function getUserById(id: number): Promise<User> {
  if (USE_MOCK) return mockGetUserById(id);
  const res = await client.get<ApiResponse<User>>(`/users/${id}`);
  return res.data.data;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  roleId: number;
}

/**
 * El back crea al user con rol BASIC por defecto. Si el front pidió otro rol,
 * hacemos un segundo PUT /users/{id}/role para asignarlo.
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  if (USE_MOCK) return mockCreateUser(data.email, data.password, data.roleId);
  const createRes = await client.post<ApiResponse<User>>('/users', {
    email: data.email,
    password: data.password,
  });
  const created = createRes.data.data;
  if (created.role?.id !== data.roleId) {
    const roleRes = await client.put<ApiResponse<User>>(
      `/users/${created.id}/role`,
      { roleId: data.roleId },
    );
    return roleRes.data.data;
  }
  return created;
}

export interface UpdateUserRequest {
  email: string;
  roleId: number;
}

/**
 * PUT /users/{id} solo actualiza email. Si cambió el rol, hacemos el PUT
 * al endpoint dedicado.
 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<User> {
  if (USE_MOCK) return mockUpdateUser(id, data.email, data.roleId);
  const emailRes = await client.put<ApiResponse<User>>(`/users/${id}`, {
    email: data.email,
  });
  const updated = emailRes.data.data;
  if (updated.role?.id !== data.roleId) {
    const roleRes = await client.put<ApiResponse<User>>(`/users/${id}/role`, {
      roleId: data.roleId,
    });
    return roleRes.data.data;
  }
  return updated;
}

export async function deactivateUser(id: number): Promise<void> {
  if (USE_MOCK) return mockDeactivateUser(id);
  await client.delete(`/users/${id}`);
}

/**
 * ⚠ El back actual no expone un endpoint para reactivar usuarios.
 * Cuando se agregue, cambiar esta URL. Por ahora falla con 404/405.
 */
export async function activateUser(id: number): Promise<void> {
  if (USE_MOCK) return mockActivateUser(id);
  await client.put(`/users/${id}/activate`);
}
