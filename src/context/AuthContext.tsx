import { createContext, useContext, useState, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthState } from '../types';

interface JwtPayload {
  sub: string;
  role?: string;
  roles?: string[];
  id?: number;
  permissions?: string[];
  authorities?: Array<string | { authority?: string }>;
  scope?: string;
  scp?: string | string[];
  userId?: number;
  uid?: number;
}

interface AuthContextType extends AuthState {
  signIn: (token: string) => void;
  signOut: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizePermission(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function stripCommonPrefixes(value: string): string {
  return value
    .replace(/^ROLE_/, '')
    .replace(/^PERM_/, '')
    .replace(/^PERMISSION_/, '')
    .replace(/^SCOPE_/, '');
}

function splitClaimString(value?: string): string[] {
  if (!value) return [];
  return value.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
}

function extractAuthorities(payload: JwtPayload): string[] {
  const fromAuthorities = (payload.authorities ?? [])
    .map((a) => (typeof a === 'string' ? a : a.authority))
    .filter((a): a is string => Boolean(a));

  const fromPermissions = payload.permissions ?? [];
  const fromScope = splitClaimString(payload.scope);
  const fromScp = Array.isArray(payload.scp) ? payload.scp : splitClaimString(payload.scp);

  return [...fromPermissions, ...fromAuthorities, ...fromScope, ...fromScp];
}

function pickRole(payload: JwtPayload): string | null {
  if (payload.role) return payload.role;
  if (payload.roles?.length) return payload.roles[0];

  const roleAuthority = (payload.authorities ?? [])
    .map((a) => (typeof a === 'string' ? a : a.authority))
    .find((a) => Boolean(a) && normalizePermission(a!).startsWith('ROLE_'));

  if (roleAuthority) return stripCommonPrefixes(normalizePermission(roleAuthority));
  return null;
}

function isAdminRole(role: string | null): boolean {
  if (!role) return false;
  const normalized = stripCommonPrefixes(normalizePermission(role));
  return normalized === 'ADMIN';
}

function parseToken(token: string): Omit<AuthState, 'token'> {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const tokenPermissions = extractAuthorities(payload);
    return {
      email: payload.sub,
      role: pickRole(payload),
      userId: payload.id ?? payload.userId ?? payload.uid ?? null,
      permissions: tokenPermissions,
    };
  } catch {
    return { email: null, role: null, userId: null, permissions: [] };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem('token');
  const initial = stored ? parseToken(stored) : { email: null, role: null, userId: null, permissions: [] };

  const [state, setState] = useState<AuthState>({ token: stored, ...initial });

  function signIn(token: string) {
    localStorage.setItem('token', token);
    setState({ token, ...parseToken(token) });
  }

  function signOut() {
    localStorage.removeItem('token');
    setState({ token: null, email: null, role: null, userId: null, permissions: [] });
  }

  function hasPermission(permission: string): boolean {
    if (isAdminRole(state.role)) return true;
    const required = stripCommonPrefixes(normalizePermission(permission));
    return state.permissions.some((p) => stripCommonPrefixes(normalizePermission(p)) === required);
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
