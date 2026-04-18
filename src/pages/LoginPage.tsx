import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';

type Mode = 'login' | 'register';

function InputField({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoFocus = false,
  rightElement,
}: {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoFocus?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
      <span className="text-slate-500 shrink-0 w-5 h-5">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none min-w-0"
      />
      {rightElement}
    </div>
  );
}

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function changeMode(next: Mode) {
    setMode(next);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const token = mode === 'login'
        ? await login({ email, password })
        : await register({ email, password });
      signIn(token);
      navigate(mode === 'login' ? '/usuarios' : '/cuenta');
    } catch (err: any) {
      setError(err.response?.data?.message ?? (mode === 'login' ? 'Credenciales inválidas' : 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  }

  const eyeIcon = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
      tabIndex={-1}
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-950 px-4 pt-10 sm:pt-20">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">SIP Admin</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10">

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">
              {mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </h1>
            <div className="w-12 h-1.5 bg-indigo-600 rounded-full mx-auto mt-3" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <InputField
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={setEmail}
              required
              autoFocus
            />

            <InputField
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={setPassword}
              required
              rightElement={eyeIcon}
            />

            {mode === 'register' && (
              <InputField
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />
            )}

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Botones — Login izquierda, Registrarse derecha */}
            <div className="flex gap-3 pt-2">
              <button
                type={mode === 'login' ? 'submit' : 'button'}
                disabled={loading}
                onClick={() => { if (mode !== 'login') changeMode('login'); }}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 ${
                  mode === 'login'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {loading && mode === 'login' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cargando...
                  </span>
                ) : 'Iniciar sesión'}
              </button>

              <button
                type={mode === 'register' ? 'submit' : 'button'}
                disabled={loading}
                onClick={() => { if (mode !== 'register') changeMode('register'); }}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 ${
                  mode === 'register'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {loading && mode === 'register' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cargando...
                  </span>
                ) : 'Registrarse'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
