import client from './client';
import type { ApiResponse, Role } from '../types';
import { USE_MOCK } from '../config';
import {
  mockGetRoles,
  mockGetRoleById,
  mockCreateRole,
  mockUpdateRole,
  mockDeleteRole,
} from './mock';

export async function getRoles(): Promise<Role[]> {
  if (USE_MOCK) return mockGetRoles();
  const res = await client.get<ApiResponse<Role[]>>('/roles');
  return res.data.data;
}

export async function getRoleById(id: number): Promise<Role> {
  if (USE_MOCK) return mockGetRoleById(id);
  const res = await client.get<ApiResponse<Role>>(`/roles/${id}`);
  return res.data.data;
}

export interface RoleRequest {
  name: string;
  permissionIds: number[];
  description?: string;
}

/**
 * Back expone dos endpoints:
 *   POST /roles                     body: { name, description }
 *   PUT  /roles/{id}/permissions    body: [1, 2, 3]  (Set<Long> crudo)
 * Hacemos las dos llamadas encadenadas para mantener la API del front simple.
 */
export async function createRole(data: RoleRequest): Promise<Role> {
  if (USE_MOCK) return mockCreateRole(data.name, data.permissionIds);
  const createRes = await client.post<ApiResponse<Role>>('/roles', {
    name: data.name,
    description: data.description ?? '',
  });
  const created = createRes.data.data;
  if (data.permissionIds.length > 0) {
    const permRes = await client.put<ApiResponse<Role>>(
      `/roles/${created.id}/permissions`,
      data.permissionIds,
    );
    return permRes.data.data;
  }
  return created;
}

export async function updateRole(id: number, data: RoleRequest): Promise<Role> {
  if (USE_MOCK) return mockUpdateRole(id, data.name, data.permissionIds);
  await client.put<ApiResponse<Role>>(`/roles/${id}`, {
    name: data.name,
    description: data.description ?? '',
  });
  const permRes = await client.put<ApiResponse<Role>>(
    `/roles/${id}/permissions`,
    data.permissionIds,
  );
  return permRes.data.data;
}

export async function deleteRole(id: number): Promise<void> {
  if (USE_MOCK) return mockDeleteRole(id);
  await client.delete(`/roles/${id}`);
}
