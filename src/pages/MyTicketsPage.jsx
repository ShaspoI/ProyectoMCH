import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Tag,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import DetailField from "../components/DetailField.jsx";
import HistoryTimeline from "../components/HistoryTimeline.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { statuses } from "../data/mockTickets.js";
import { getStatus } from "../utils/ticketUtils.js";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const [detailTicketId, setDetailTicketId] = useState(null);

  const myTickets = tickets.filter(
    (t) => `${user.nombre} ${user.apellido}` === t.user,
  );
  const detailTicket = detailTicketId
    ? tickets.find((t) => t.id === detailTicketId)
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Mis tickets
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} registrado
       {myTickets.length !== 1 ? "s" : ""}
      </p>

      {myTickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/70 p-12 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          No tiene tickets registrados.
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {myTickets.map((ticket) => {
            const status = getStatus(statuses, ticket.status);
            return (
              <button
                key={ticket.id}
                onClick={() => setDetailTicketId(ticket.id)}
                className="glass-card flex w-full items-center gap-4 rounded-xl p-4 text-left"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {ticket.id}
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <p className="line-clamp-1 text-sm text-slate-600 dark:text-slate-300">
                    {ticket.shortDescription}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{ticket.category}</span>
                    <span>&middot;</span>
                    <span>{ticket.date}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {detailTicket ? (
        <aside className="fixed inset-0 z-30 flex justify-end px-0 sm:px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/30 dark:bg-black/50"
            onClick={() => setDetailTicketId(null)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="animate-slide-in-right relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white dark:border-l dark:border-white/10 dark:bg-slate-950/95 dark:backdrop-blur-xl sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-lg">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-5 dark:border-white/10">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {detailTicket.id}
                  </p>
                  <StatusBadge status={getStatus(statuses, detailTicket.status)} />
                </div>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {detailTicket.shortDescription}
                </p>
              </div>
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.97] dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                onClick={() => setDetailTicketId(null)}
                type="button"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <section className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Informacion del ticket
                </h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <IconField icon={UserRound} label="Usuario" value={detailTicket.user} />
                  <IconField icon={Building2} label="Sector" value={detailTicket.sector} />
                  <IconField icon={Wrench} label="Categoria" value={detailTicket.category} />
                  <IconField icon={CheckCircle2} label="Subcategoria" value={detailTicket.subcategory} />
                  <IconField icon={Tag} label="Etiqueta" value={detailTicket.deviceTag || "—"} />
                  <IconField icon={CalendarDays} label="Fecha" value={detailTicket.date} />
                </dl>
                <DetailField label="Descripcion completa" value={detailTicket.fullDescription} />
              </section>

              <section className="mt-8 space-y-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Observaciones
                </h3>
                {detailTicket.observations.length > 0 ? (
                  <div className="grid gap-3">
                    {detailTicket.observations.map((item) => (
                      <article
                        className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                        key={item.id}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.author}
                          </p>
                          <time className="text-xs text-slate-500 dark:text-slate-400">
                            {item.date}
                          </time>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {item.text}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    Sin observaciones registradas.
                  </p>
                )}
              </section>

              <section className="mt-8 space-y-4 pb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Historial
                </h3>
                <HistoryTimeline history={detailTicket.history} />
              </section>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function IconField({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
        <Icon size={17} aria-hidden="true" />
      </div>
      <DetailField label={label} value={value} />
    </div>
  );
}
