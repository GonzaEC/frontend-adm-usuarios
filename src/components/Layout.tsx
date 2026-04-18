import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  {
    to: '/usuarios',
    label: 'Usuarios',
    permission: 'user:read' as string | null,
    requiredRole: null as string | null,
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    to: '/roles',
    label: 'Roles',
    permission: null,
    requiredRole: 'ADMIN',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    to: '/permisos',
    label: 'Permisos',
    permission: null,
    requiredRole: 'ADMIN',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    to: '/cuenta',
    label: 'Mi cuenta',
    permission: null,
    requiredRole: null,
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     'bg-violet-500/20 text-violet-300 ring-violet-500/30',
  DEVELOPER: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  INVESTOR:  'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  BASIC:     'bg-slate-500/20 text-slate-300 ring-slate-500/30',
};

export function Layout() {
  const { email, role, signOut, hasPermission } = useAuth();
  const navigate = useNavigate();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.requiredRole && role !== item.requiredRole) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  const roleClass = ROLE_COLORS[role ?? ''] ?? ROLE_COLORS.BASIC;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">

      <header className="bg-slate-900 border-b border-slate-800 px-6 py-0 flex items-center justify-between sticky top-0 z-40">

        {/* Logo + nav */}
        <div className="flex items-center">
          <div className="flex items-center gap-2.5 py-4 pr-8 border-r border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm tracking-tight">SIP Admin</span>
          </div>

          <nav className="flex pl-8 gap-1">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Usuario + salir */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 py-4">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
              {email?.[0] ?? '?'}
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-slate-200 text-xs font-medium">{email}</span>
            </div>
            <span className={`hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${roleClass}`}>
              {role}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors py-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
