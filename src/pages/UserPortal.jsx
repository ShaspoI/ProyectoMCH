import {
  ClipboardList,
  FilePlus,
  Home,
  LayoutList,
  LogOut,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const navItems = [
  { to: "/dashboard", label: "Inicio", icon: Home, end: true },
  { to: "/dashboard/create-ticket", label: "Crear ticket", icon: FilePlus },
  { to: "/dashboard/my-tickets", label: "Mis tickets", icon: LayoutList },
  { to: "/dashboard/profile", label: "Mi perfil", icon: UserRound },
];

export default function UserPortal() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg flex min-h-screen transition-colors">
        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-colors dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
          {/* Logo area */}
          <div className="flex min-h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-white/10">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20">
              <ClipboardList size={19} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Mesa de ayuda
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-50 text-violet-700 dark:border dark:border-violet-500/20 dark:bg-violet-600/20 dark:text-violet-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                  }`
                }
              >
                <item.icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User area */}
          <div className="border-t border-slate-200 p-3 dark:border-white/10">
            <div className="mb-2 flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-semibold text-white shadow-md shadow-violet-500/20">
                {user?.nombre?.[0]}{user?.apellido?.[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.sector}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-[0.97] dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <LogOut size={18} aria-hidden="true" />
              Cerrar sesion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-6 transition-colors dark:border-white/10 dark:bg-black/30 dark:backdrop-blur-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bienvenido,{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.nombre} {user?.apellido}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Sector: {user?.sector}
              </span>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
