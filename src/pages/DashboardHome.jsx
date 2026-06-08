import { FilePlus, LayoutList } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";

export default function DashboardHome() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const myTickets = tickets.filter(
    (t) => `${user.nombre} ${user.apellido}` === t.user,
  );
  const openTickets = myTickets.filter((t) => t.status === "abierto");
  const resolvedTickets = myTickets.filter((t) => t.status === "resuelto");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Inicio
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Resumen de su actividad en el sistema de mantenimiento.
      </p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-5">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{myTickets.length}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total tickets</p>
        </div>
        <div className="glass-card rounded-xl p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
          <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{openTickets.length}</p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">Abiertos</p>
        </div>
        <div className="glass-card rounded-xl p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{resolvedTickets.length}</p>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-300">Resueltos</p>
        </div>
      </div>

      {/* Quick-link cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/create-ticket"
          className="glass-card flex items-center gap-4 rounded-xl p-5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
            <FilePlus size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Crear ticket</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registre una nueva solicitud de mantenimiento
            </p>
          </div>
        </Link>
        <Link
          to="/dashboard/my-tickets"
          className="glass-card flex items-center gap-4 rounded-xl p-5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
            <LayoutList size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Mis tickets</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Consulte el estado de sus solicitudes
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
