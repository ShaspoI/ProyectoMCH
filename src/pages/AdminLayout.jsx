import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
  UserCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X as XIcon
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket },
  { to: "/admin/users", label: "Usuarios", icon: Users },
  { to: "/admin/settings", label: "Configuración", icon: Settings },
  { to: "/admin/profile", label: "Mi perfil", icon: UserCircle },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg flex h-screen w-screen overflow-hidden transition-colors p-3 sm:p-4 md:p-5 gap-3 sm:gap-4 md:gap-5">
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-3 left-3 sm:inset-y-4 sm:left-4 md:inset-auto md:left-auto z-50 flex shrink-0 flex-col rounded-2xl border border-slate-200/60 bg-white/60 shadow-xl transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl dark:backdrop-blur-xl backdrop-blur-md md:relative md:z-40 ${
            isCollapsed ? "md:w-[76px]" : "md:w-64"
          } ${
            isMobileOpen ? "translate-x-0 w-[260px] max-w-[calc(100vw-32px)]" : "-translate-x-[120%] md:translate-x-0"
          }`}
        >
          {/* Logo area */}
          <div 
            className={`flex h-[77px] w-full items-center justify-between border-b border-slate-200/50 px-4 transition-colors dark:border-white/10`}
          >
            <div 
              className="flex items-center cursor-pointer flex-1"
              onClick={() => window.innerWidth >= 768 && setIsCollapsed(!isCollapsed)}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                <ClipboardList size={22} aria-hidden="true" />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${(isCollapsed && !isMobileOpen) ? 'md:w-0 md:opacity-0' : 'w-full opacity-100 ml-3'}`}>
                <p className="whitespace-nowrap text-[15px] font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  Mantenimiento
                </p>
              </div>
            </div>
            {/* Close button mobile */}
            <button 
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              onClick={() => setIsMobileOpen(false)}
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 border border-transparent ${
                    isActive
                      ? "bg-violet-100/50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-600/20 dark:text-violet-300"
                      : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                  }`
                }
              >
                <item.icon size={18} aria-hidden="true" className="shrink-0" />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${(isCollapsed && !isMobileOpen) ? 'w-0 opacity-0' : 'w-full opacity-100 ml-3'}`}>
                  <span className="truncate">{item.label}</span>
                </div>
                
                {(isCollapsed && !isMobileOpen) && (
                  <div className="absolute left-full ml-4 invisible rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900 z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User area */}
          <div className="border-t border-slate-200/50 p-3 dark:border-white/10">
              <div className={`flex items-center px-3 overflow-hidden transition-all duration-300 ease-in-out ${(isCollapsed && !isMobileOpen) ? 'h-0 opacity-0 mb-0' : 'h-9 opacity-100 mb-3'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-semibold text-white shadow-md shadow-violet-500/20">
                  {user?.nombre?.[0]}{user?.apellido?.[0]}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    Admin
                  </p>
                </div>
              </div>
            <button
              onClick={handleLogout}
              className={`group relative flex w-full items-center rounded-lg py-2.5 px-4 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50/80 hover:text-red-700 active:scale-[0.97] dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300`}
            >
              <LogOut size={18} aria-hidden="true" className="shrink-0" />
              <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${(isCollapsed && !isMobileOpen) ? 'w-0 opacity-0' : 'w-full opacity-100 ml-3'}`}>
                <span className="whitespace-nowrap">Cerrar sesión</span>
              </div>
              {(isCollapsed && !isMobileOpen) && (
                  <div className="absolute left-full ml-4 invisible rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900 z-50 whitespace-nowrap">
                    Cerrar sesión
                  </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main content wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden relative rounded-2xl border border-slate-200/60 bg-white/60 shadow-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl dark:backdrop-blur-xl backdrop-blur-md">
          {/* Mobile Header - solo visible en pantallas pequeñas */}
          <div className="flex min-h-[64px] items-center justify-between border-b border-slate-200/50 px-4 md:hidden dark:border-white/10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <Menu size={20} />
              </button>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Mantenimiento</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                <ClipboardList size={18} />
              </div>
            </div>
          </div>

          {/* Desktop Header - solo visible en md+ */}
          <div className="hidden md:flex min-h-[64px] items-center justify-between border-b border-slate-200/50 px-6 dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bienvenido,{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.nombre} {user?.apellido}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>

          <main className="flex-1 overflow-y-scroll overflow-x-hidden h-full w-full">
            <Outlet />
          </main>
        </div>
        
      </div>
    </div>
  );
}
