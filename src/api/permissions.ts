import client from './client';
import type { ApiResponse, Permission } from '../types';
import { USE_MOCK } from '../config';
import {
  mockGetPermissions,
  mockCreatePermission,
  mockUpdatePermission,
  mockDeletePermission,
} from './mock';

export async function getPermissions(): Promise<Permission[]> {
  if (USE_MOCK) return mockGetPermissions();
  const res = await client.get<ApiResponse<Permission[]>>('/permissions');
  return res.data.data;
}

export interface PermissionRequest {
  name: string;
  description?: string;
}

function buildDescription(data: PermissionRequest): string {
  return data.description?.trim() || `Permiso para ${data.name}`;
}

export async function createPermission(data: PermissionRequest): Promise<Permission> {
  if (USE_MOCK) return mockCreatePermission(data.name);
  const res = await client.post<ApiResponse<Permission>>('/permissions', {
    name: data.name,
    description: buildDescription(data),
  });
  return res.data.data;
}

export async function updatePermission(id: number, data: PermissionRequest): Promise<Permission> {
  if (USE_MOCK) return mockUpdatePermission(id, data.name);
  const res = await client.put<ApiResponse<Permission>>(`/permissions/${id}`, {
    name: data.name,
    description: buildDescription(data),
  });
  return res.data.data;
}

export async function deletePermission(id: number): Promise<void> {
  if (USE_MOCK) return mockDeletePermission(id);
  await client.delete(`/permissions/${id}`);
}
