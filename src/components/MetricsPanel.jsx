import { Clock, TrendingUp, X } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS = {
  abierto: "#3b82f6",
  "en-proceso": "#f59e0b",
  resuelto: "#10b981",
};

const CHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

function formatDuration(minutes) {
  if (minutes == null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

export default function MetricsPanel({ tickets, statuses, onClose }) {
  const statusDistribution = useMemo(() => {
    return statuses.map((status) => ({
      name: status.columnLabel,
      value: tickets.filter((t) => t.status === status.id).length,
      color: STATUS_COLORS[status.id],
    }));
  }, [tickets, statuses]);

  const totalTickets = tickets.length;

  const averageResolutionTime = useMemo(() => {
    const resolvedTickets = tickets.filter((t) => t.status === "resuelto");
    if (resolvedTickets.length === 0) return null;

    const times = resolvedTickets
      .map((ticket) => {
        const created = ticket.history.find((h) => h.action === "Ticket creado");
        const resolved = ticket.history.find(
          (h) => h.action === "Estado actualizado" && h.detail?.includes("Resuelto"),
        );
        if (!created || !resolved) return null;
        const diff = new Date(resolved.date) - new Date(created.date);
        return diff / (1000 * 60);
      })
      .filter(Boolean);

    if (times.length === 0) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }, [tickets]);

  const trendsData = useMemo(() => {
    const byDay = {};
    tickets.forEach((t) => {
      const day = t.date.split(" ")[0];
      if (!byDay[day]) byDay[day] = 0;
      byDay[day]++;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => {
        const parts = day.split("-");
        return { day: `${parts[2]}/${parts[1]}`, tickets: count };
      });
  }, [tickets]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0];
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-sm shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
        <p className="font-medium text-slate-100">
          {data.name}: <span className="font-semibold">{data.value}</span> (
          {totalTickets > 0 ? ((data.value / totalTickets) * 100).toFixed(1) : 0}%)
        </p>
      </div>
    );
  };

  return (
    <aside className="animate-fade-overlay fixed inset-0 z-30 flex justify-end bg-black/40 px-0 backdrop-blur-sm sm:px-4">
      <div className="glass-panel animate-slide-in-right flex h-full w-full max-w-2xl flex-col overflow-hidden sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-xl">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200/80 px-5 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400">
              <TrendingUp size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Métricas
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Panel analítico de tickets
              </p>
            </div>
          </div>
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:scale-[0.97] dark:border-white/10 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            onClick={onClose}
            title="Cerrar métricas"
            type="button"
          >
            <X size={19} aria-hidden="true" />
            <span className="sr-only">Cerrar métricas</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-6">
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Distribución por estado
              </h3>
              <div className="glass-card rounded-xl p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
                  {statusDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index] }}
                      />
                      <span className="text-slate-600 dark:text-slate-300">
                        {entry.name}:{" "}
                        <strong className="text-slate-900 dark:text-slate-100">
                          {entry.value}
                        </strong>{" "}
                        ({totalTickets > 0
                          ? ((entry.value / totalTickets) * 100).toFixed(0)
                          : 0}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Tiempo promedio de resolución
              </h3>
              <div className="glass-card flex items-center gap-4 rounded-xl p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Clock size={24} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {formatDuration(averageResolutionTime)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Promedio entre creación y resolución (
                    {tickets.filter((t) => t.status === "resuelto").length} tickets resueltos)
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Tendencias
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tickets creados por día
              </p>
              <div className="glass-card rounded-xl p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendsData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#94a3b8"
                      strokeOpacity={0.15}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={{ stroke: "#94a3b8", strokeOpacity: 0.2 }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      animationDuration={150}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(15,15,35,0.9)",
                        backdropFilter: "blur(12px)",
                        fontSize: "13px",
                        color: "#f1f5f9",
                      }}
                    />
                    <Bar dataKey="tickets" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}
