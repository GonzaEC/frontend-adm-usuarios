import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUsers, deactivateUser, activateUser } from '../api/users';
import { UserModal } from '../components/UserModal';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     'bg-violet-500/20 text-violet-300 ring-violet-500/30',
  DEVELOPER: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  INVESTOR:  'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  BASIC:     'bg-slate-500/20 text-slate-400 ring-slate-500/30',
};

function Avatar({ email }: { email: string }) {
  const colors = [
    'bg-indigo-500', 'bg-violet-500', 'bg-blue-500',
    'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  ];
  const color = colors[email.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold uppercase shrink-0`}>
      {email[0]}
    </div>
  );
}

export function UsersPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [page, setPage] = useState(0);
  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page],
    queryFn: () => getUsers(page),
  });

  const deactivate = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const activate = useMutation({
    mutationFn: activateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  function confirmDeactivate(user: User) {
    if (confirm(`¿Desactivar a ${user.email}?`)) {
      deactivate.mutate(user.id);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Usuarios</h1>
          {data && (
            <p className="text-slate-500 text-sm mt-0.5">{data.totalElements} usuarios registrados</p>
          )}
        </div>
        <button
          onClick={() => setModalUser(null)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-medium px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nuevo usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Cargando usuarios...</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
            <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm">No se pudo cargar la lista de usuarios</p>
          </div>
        )}

        {data && data.content.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
            <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm">No hay usuarios todavía</p>
          </div>
        )}

        {data && data.content.length > 0 && (
          <>
            {/* ── MOBILE: cards ── */}
            <div className="sm:hidden divide-y divide-slate-800/60">
              {data.content.map((user) => (
                <div key={user.id} className="px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar email={user.email} />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 text-sm truncate">{user.email}</div>
                        <div className="text-xs text-slate-600">ID #{user.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className={`text-xs font-medium ${user.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${ROLE_COLORS[user.role.name] ?? ROLE_COLORS.BASIC}`}>
                      {user.role.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/usuarios/${user.id}`)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver
                      </button>
                      <button
                        onClick={() => setModalUser(user)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                        Editar
                      </button>
                      {user.active ? (
                        <button
                          onClick={() => confirmDeactivate(user)}
                          disabled={deactivate.isPending || user.id === userId}
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Desact.
                        </button>
                      ) : (
                        <button
                          onClick={() => activate.mutate(user.id)}
                          disabled={activate.isPending}
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Activar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── DESKTOP: tabla ── */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Estado</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.content.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar email={user.email} />
                        <div>
                          <div className="font-medium text-slate-200">{user.email}</div>
                          <div className="text-xs text-slate-600 mt-0.5">ID #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${ROLE_COLORS[user.role.name] ?? ROLE_COLORS.BASIC}`}>
                        {user.role.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${user.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span className={`text-xs font-medium ${user.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/usuarios/${user.id}`)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Ver
                        </button>
                        <button
                          onClick={() => setModalUser(user)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Editar
                        </button>
                        {user.active ? (
                          <button
                            onClick={() => confirmDeactivate(user)}
                            disabled={deactivate.isPending || user.id === userId}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => activate.mutate(user.id)}
                            disabled={activate.isPending}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {data.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  Página <span className="text-slate-300 font-medium">{data.number + 1}</span> de {data.totalPages} — {data.totalElements} usuarios
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.totalPages - 1}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalUser !== undefined && (
        <UserModal user={modalUser} onClose={() => setModalUser(undefined)} />
      )}
    </div>
  );
}
