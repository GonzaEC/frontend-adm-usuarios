import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPermissions } from '../api/permissions';
import { createRole, updateRole } from '../api/roles';
import type { Role } from '../types';

interface Props {
  role?: Role | null;
  onClose: () => void;
}

export function RoleModal({ role, onClose }: Props) {
  const qc = useQueryClient();
  const isEditing = !!role;

  const [name, setName] = useState(role?.name ?? '');
  const [selected, setSelected] = useState<Set<number>>(
    new Set(role?.permissions.map((p) => p.id) ?? [])
  );
  const [error, setError] = useState('');

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  function toggle(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const data = { name, permissionIds: [...selected] };
      return isEditing ? updateRole(role!.id, data) : createRole(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Error al guardar'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isEditing ? 'Editar rol' : 'Nuevo rol'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? `Modificando ${role!.name}` : 'Definí el rol y sus permisos'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="EJ: MODERATOR"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Permisos ({selected.size} / {permissions.length})
            </label>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-2 max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
              {permissions.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                      checked ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                      className="accent-indigo-600"
                    />
                    {p.name}
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            >
              {mutation.isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
