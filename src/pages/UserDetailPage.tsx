import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, deactivateUser, activateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { UserModal } from '../components/UserModal';

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
    <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white text-2xl font-bold uppercase`}>
      {email[0]}
    </div>
  );
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(Number(id)),
  });

  const deactivate = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }),
  });

  const activate = useMutation({
    mutationFn: activateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-32 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm">Cargando usuario...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-slate-500">
        <p className="text-sm">No se encontró el usuario</p>
        <button
          onClick={() => navigate('/usuarios')}
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          ← Volver al listado
        </button>
      </div>
    );
  }

  const roleClass = ROLE_COLORS[user.role?.name] ?? ROLE_COLORS.BASIC;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/usuarios')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Usuarios
      </button>

      {/* Card principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar email={user.email} />
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white break-all">{user.email}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${roleClass}`}>
                  {user.role?.name ?? '—'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className={`text-xs font-medium ${user.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 sm:shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editar
            </button>
            {user.active ? (
              <button
                onClick={() => { if (confirm(`¿Desactivar a ${user.email}?`)) deactivate.mutate(user.id); }}
                disabled={deactivate.isPending || user.id === userId}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 transition-colors disabled:opacity-50"
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
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/20 transition-colors disabled:opacity-50"
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

      {/* Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
        <InfoRow label="ID" value={`#${user.id}`} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Estado" value={user.active ? 'Activo' : 'Inactivo'} highlight={user.active ? 'green' : 'gray'} />
        <InfoRow label="Rol" value={user.role?.name ?? '—'} />
      </div>

      {/* Permisos del rol */}
      {user.role?.permissions && user.role.permissions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Permisos del rol {user.role.name}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {user.role.permissions.map((p) => (
              <span
                key={p.id}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 ring-1 ring-slate-700/50"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {editOpen && (
        <UserModal
          user={user}
          onClose={() => {
            setEditOpen(false);
            qc.invalidateQueries({ queryKey: ['user', id] });
          }}
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'gray';
}) {
  const valueClass = highlight === 'green'
    ? 'text-emerald-400'
    : highlight === 'gray'
    ? 'text-slate-500'
    : 'text-slate-200';

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
