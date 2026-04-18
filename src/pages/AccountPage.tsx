import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export function AccountPage() {
  const { email, role } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpia el timer al desmontar para evitar actualizar estado en componente desmontado
  useEffect(() => () => { if (successTimer.current) clearTimeout(successTimer.current); }, []);

  const mutation = useMutation({
    mutationFn: () => changePassword({ email: email!, oldPassword, newPassword }),
    onSuccess: () => {
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Error al cambiar la contraseña'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      <div>
        <h1 className="text-xl font-bold text-white">Mi cuenta</h1>
        <p className="text-slate-500 text-sm mt-0.5">Administrá tus datos y credenciales</p>
      </div>

      {/* Perfil */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Perfil</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 w-20">Email</span>
            <span className="text-slate-200">{email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 w-20">Rol</span>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Cambiar contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Contraseña actual</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nueva contraseña</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Confirmar nueva contraseña</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Contraseña actualizada correctamente
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            >
              {mutation.isPending ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
