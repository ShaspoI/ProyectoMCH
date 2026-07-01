import { BarChart3, CheckCircle2, Clock, FileWarning, Users } from "lucide-react";
import { useTickets } from "../context/TicketContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

function MetricCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="glass-card flex flex-col justify-between rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
          <Icon size={24} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { tickets } = useTickets();
  const { users } = useUsers();
  const { theme, toggleTheme } = useTheme();

  const countPendiente = tickets.filter((t) => t.status === "pendiente").length;
  const countAsignado = tickets.filter((t) => t.status === "asignado").length;
  const countEnProceso = tickets.filter((t) => t.status === "en-proceso").length;
  const countResueltoPend = tickets.filter((t) => t.status === "resuelto-pendiente").length;
  const countCerrado = tickets.filter((t) => t.status === "cerrado").length;

  // Bug #1 corregido: usar UserContext como fuente de verdad (no mockUsers estático)
  const activeUsersCount = users.filter((u) => u.estado === "Activo").length;

  // Bug #2: Rendimiento de Resolución
  const closedTickets = tickets.filter(t => t.status === "cerrado" && t.createdAt && t.closedAt);
  let averageResolutionDays = 0;
  if (closedTickets.length > 0) {
    const totalDiff = closedTickets.reduce((acc, t) => {
      const diff = new Date(t.closedAt).getTime() - new Date(t.createdAt).getTime();
      return acc + diff;
    }, 0);
    averageResolutionDays = (totalDiff / closedTickets.length) / (1000 * 60 * 60 * 24);
  }
  const avgDaysFormatted = averageResolutionDays.toFixed(1);

  // Bug #2: Tickets por Sector
  const ticketsBySector = tickets.reduce((acc, t) => {
    const sector = t.userSnapshot?.sector || t.sector || "Sin asignar";
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {});
  const topSectors = Object.entries(ticketsBySector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const maxSectorCount = topSectors.length > 0 ? topSectors[0][1] : 1;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Dashboard General
          </h1>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            Resumen operativo y métricas principales del sistema.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
        <MetricCard
          title="Pendientes"
          value={countPendiente}
          icon={FileWarning}
          colorClass="bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-400"
        />
        <MetricCard
          title="Asignados"
          value={countAsignado}
          icon={Clock}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <MetricCard
          title="En Proceso"
          value={countEnProceso}
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <MetricCard
          title="Por Cerrar"
          value={countResueltoPend}
          icon={CheckCircle2}
          colorClass="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400"
        />
        <MetricCard
          title="Cerrados"
          value={countCerrado}
          icon={CheckCircle2}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <MetricCard
          title="Usuarios"
          value={activeUsersCount}
          icon={Users}
          colorClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card flex min-h-[400px] flex-col rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Rendimiento de Resolución
            </h3>
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center pt-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
                <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {closedTickets.length > 0 ? avgDaysFormatted : "—"}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Días promedio
              </p>
              {closedTickets.length > 0 && (
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Basado en {closedTickets.length} ticket{closedTickets.length !== 1 && "s"} cerrado{closedTickets.length !== 1 && "s"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card flex min-h-[400px] flex-col rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Tickets por Sector
            </h3>
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div className="flex flex-1 flex-col justify-center pt-4">
            {topSectors.length > 0 ? (
              <div className="space-y-4">
                {topSectors.map(([sector, count]) => {
                  const widthPercent = (count / maxSectorCount) * 100;
                  return (
                    <div key={sector}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{sector}</span>
                        <span className="text-slate-500 dark:text-slate-400">{count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/5">
                        <div
                          className="h-2 rounded-full bg-violet-500 dark:bg-violet-600"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
