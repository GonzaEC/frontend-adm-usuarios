export interface User {
  id: number;
  email: string;
  role: Role;
  active: boolean;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  status: number;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  userId: number | null;
  permissions: string[];
}
