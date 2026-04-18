import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPermission, updatePermission } from '../api/permissions';
import type { Permission } from '../types';

interface Props {
  permission?: Permission | null;
  onClose: () => void;
}

export function PermissionModal({ permission, onClose }: Props) {
  const qc = useQueryClient();
  const isEditing = !!permission;

  const [name, setName] = useState(permission?.name ?? '');
  const [description, setDescription] = useState(permission?.description ?? '');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      isEditing
        ? updatePermission(permission!.id, { name, description })
        : createPermission({ name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] });
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isEditing ? 'Editar permiso' : 'Nuevo permiso'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Usá el formato <span className="font-mono text-slate-400">RECURSO_ACCION</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              placeholder="EJ: PROJECT_READ"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Descripción <span className="normal-case text-slate-600 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Permite ver proyectos"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {mutation.isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear permiso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
