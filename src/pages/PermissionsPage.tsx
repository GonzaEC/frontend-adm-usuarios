import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPermissions, deletePermission } from '../api/permissions';
import { PermissionModal } from '../components/PermissionModal';
import type { Permission } from '../types';

export function PermissionsPage() {
  const qc = useQueryClient();
  const [modalPermission, setModalPermission] = useState<Permission | null | undefined>(undefined);

  const { data: permissions = [], isLoading, isError } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  const removePermission = useMutation({
    mutationFn: deletePermission,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions'] }),
    onError: (err: any) => alert(err.response?.data?.message ?? 'Error al eliminar'),
  });

  function confirmDelete(p: Permission) {
    if (confirm(`¿Eliminar el permiso "${p.name}"?`)) {
      removePermission.mutate(p.id);
    }
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Permisos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{permissions.length} permisos disponibles</p>
        </div>
        <button
          onClick={() => setModalPermission(null)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo permiso
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading && <div className="py-20 text-center text-slate-500 text-sm">Cargando...</div>}
        {isError && <div className="py-20 text-center text-slate-500 text-sm">Error al cargar</div>}
        {permissions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800/60">
            {permissions.map((p) => (
              <div
                key={p.id}
                className="group bg-slate-900 hover:bg-slate-800/60 px-5 py-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-semibold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-600">ID #{p.id}</div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setModalPermission(p)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                    title="Editar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => confirmDelete(p)}
                    disabled={removePermission.isPending}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 disabled:opacity-50"
                    title="Eliminar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 7V4a1 1 0 011-1h2a1 1 0 011 1v3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalPermission !== undefined && (
        <PermissionModal permission={modalPermission} onClose={() => setModalPermission(undefined)} />
      )}
    </div>
  );
}
