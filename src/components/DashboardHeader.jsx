import { BarChart3, ClipboardList, MessageCircle, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function DashboardHeader({
  ticketCount,
  query,
  theme,
  onQueryChange,
  onToggleTheme,
  onOpenMetrics,
}) {
  return (
    <header className="border-b border-slate-200/50 bg-transparent transition-colors dark:border-white/[0.08]">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
            <ClipboardList size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-violet-500 dark:text-violet-400">
              Mantenimiento
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Panel de tickets
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            <MessageCircle size={17} aria-hidden="true" className="text-violet-400" />
            <span>{ticketCount} tickets desde WhatsApp</span>
          </div>

          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 text-sm text-slate-400 transition-colors focus-within:border-violet-400 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-violet-500/50">
            <Search size={17} aria-hidden="true" />
            <input
              className="w-full min-w-0 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-48"
              placeholder="Buscar ticket"
              type="search"
              aria-label="Buscar ticket"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>

          {onOpenMetrics && (
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-all duration-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 active:scale-[0.97] dark:border-white/10 dark:text-slate-400 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
              onClick={onOpenMetrics}
              title="Ver métricas"
              type="button"
            >
              <BarChart3 size={19} aria-hidden="true" />
              <span className="sr-only">Ver métricas</span>
            </button>
          )}

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
