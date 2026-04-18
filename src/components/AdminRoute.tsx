import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Permiso JWT requerido (ej: 'user:read').
   * Se evalúa si no hay requiredRole, o además del rol.
   */
  permission?: string;
  /**
   * Rol exacto requerido (ej: 'ADMIN').
   * Tiene prioridad sobre permission — si el rol no coincide, bloquea aunque tenga el permiso.
   */
  requiredRole?: string;
}

/**
 * Guarda de ruta configurable.
 * - Si se pasa requiredRole: solo ese rol puede entrar (independiente de permisos).
 * - Si se pasa permission: el usuario debe tener ese permiso en su JWT.
 * - Si no se pasa ninguno: cualquier usuario autenticado puede entrar.
 */
export function AdminRoute({ children, permission, requiredRole }: Props) {
  const { token, hasPermission, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/cuenta" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/cuenta" replace />;
  return <>{children}</>;
}
