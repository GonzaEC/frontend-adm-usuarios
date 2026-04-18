import client from './client';
import type { ApiResponse, LoginRequest } from '../types';
import { USE_MOCK } from '../config';
import { mockLogin, mockRegister, mockChangePassword } from './mock';

export async function login(data: LoginRequest): Promise<string> {
  if (USE_MOCK) return mockLogin(data.email, data.password);
  const res = await client.post<ApiResponse<string>>('/auth/login', data);
  return res.data.data;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * El back no expone /auth/register: el alta de usuario se hace contra
 * POST /users (sin auth). Luego pegamos /auth/login para obtener el token.
 */
export async function register(data: RegisterRequest): Promise<string> {
  if (USE_MOCK) return mockRegister(data.email, data.password);
  await client.post<ApiResponse<unknown>>('/users', data);
  return login(data);
}

export interface ChangePasswordRequest {
  email: string;        // no lo usa el back (toma el principal del JWT), lo mantenemos para el mock
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  if (USE_MOCK) return mockChangePassword(data.email, data.oldPassword, data.newPassword);
  await client.post('/auth/change-password', {
    oldPassword: data.oldPassword,
    newPassword: data.newPassword,
  });
}
