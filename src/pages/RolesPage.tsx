import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, deleteRole } from '../api/roles';
import { RoleModal } from '../components/RoleModal';
import type { Role } from '../types';

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     'bg-violet-500/20 text-violet-300 ring-violet-500/30',
  DEVELOPER: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  INVESTOR:  'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  BASIC:     'bg-slate-500/20 text-slate-400 ring-slate-500/30',
};

export function RolesPage() {
  const qc = useQueryClient();
  const [modalRole, setModalRole] = useState<Role | null | undefined>(undefined);

  const { data: roles = [], isLoading, isError } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  const removeRole = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
    onError: (err: any) => alert(err.response?.data?.message ?? 'Error al eliminar'),
  });

  function confirmDelete(role: Role) {
    if (confirm(`¿Eliminar el rol "${role.name}"?`)) {
      removeRole.mutate(role.id);
    }
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Roles</h1>
          <p className="text-slate-500 text-sm mt-0.5">{roles.length} roles definidos</p>
        </div>
        <button
          onClick={() => setModalRole(null)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo rol
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading && (
          <div className="py-20 text-center text-slate-500 text-sm">Cargando...</div>
        )}
        {isError && (
          <div className="py-20 text-center text-slate-500 text-sm">Error al cargar los roles</div>
        )}
        {roles.length > 0 && (
          <div className="divide-y divide-slate-800/60">
            {roles.map((role) => (
              <div key={role.id} className="group px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between gap-3 sm:contents">
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ring-1 shrink-0 ${ROLE_COLORS[role.name] ?? ROLE_COLORS.BASIC}`}>
                    {role.name}
                  </span>
                  {/* Botones siempre visibles en mobile, hover en desktop */}
                  <div className="flex items-center gap-2 sm:hidden">
                    <button
                      onClick={() => setModalRole(role)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => confirmDelete(role)}
                      disabled={removeRole.isPending}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.length === 0 ? (
                      <span className="text-xs text-slate-600 italic">Sin permisos asignados</span>
                    ) : (
                      role.permissions.map((p) => (
                        <span key={p.id} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 ring-1 ring-slate-700/50">
                          {p.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {/* Botones hover solo en desktop */}
                <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setModalRole(role)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => confirmDelete(role)}
                    disabled={removeRole.isPending}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalRole !== undefined && (
        <RoleModal role={modalRole} onClose={() => setModalRole(undefined)} />
      )}
    </div>
  );
}
