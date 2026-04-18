import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { RolesPage } from './pages/RolesPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { AccountPage } from './pages/AccountPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Redirige / según el rol */}
              <Route
                index
                element={
                  <AdminRoute>
                    <Navigate to="/usuarios" replace />
                  </AdminRoute>
                }
              />

              {/* Rutas por sección según permiso/rol requerido */}
              <Route path="usuarios" element={<AdminRoute permission="user:read"><UsersPage /></AdminRoute>} />
              <Route path="usuarios/:id" element={<AdminRoute permission="user:read"><UserDetailPage /></AdminRoute>} />
              {/* Roles y Permisos: solo ADMIN, sin importar qué permisos tenga el rol */}
              <Route path="roles" element={<AdminRoute requiredRole="ADMIN"><RolesPage /></AdminRoute>} />
              <Route path="permisos" element={<AdminRoute requiredRole="ADMIN"><PermissionsPage /></AdminRoute>} />

              {/* Ruta para cualquier usuario autenticado */}
              <Route path="cuenta" element={<AccountPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
