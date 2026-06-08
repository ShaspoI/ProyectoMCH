import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Send,
  Tag,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import DetailField from "./DetailField.jsx";
import HistoryTimeline from "./HistoryTimeline.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { buildHistoryEntry, getStatus } from "../utils/ticketUtils.js";

export default function TicketDetailPanel({
  ticket,
  statuses,
  onClose,
  onUpdateStatus,
  onAddObservation,
}) {
  const [draftStatus, setDraftStatus] = useState(ticket.status);
  const [observation, setObservation] = useState("");
  const currentStatus = getStatus(statuses, ticket.status);
  const statusChanged = draftStatus !== ticket.status;
  const selectedStatus = useMemo(() => getStatus(statuses, draftStatus), [draftStatus, statuses]);

  function handleStatusSubmit(event) {
    event.preventDefault();
    if (!statusChanged) return;
    onUpdateStatus(
      ticket.id,
      draftStatus,
      buildHistoryEntry({
        action: "Estado actualizado",
        detail: `Cambio de ${currentStatus.label} a ${selectedStatus.label}.`,
      }),
    );
  }

  function handleObservationSubmit(event) {
    event.preventDefault();
    const trimmed = observation.trim();
    if (!trimmed) return;
    onAddObservation(ticket.id, {
      id: `obs-${Date.now()}`,
      author: "Mantenimiento",
      text: trimmed,
      date: new Intl.DateTimeFormat("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    });
    setObservation("");
  }

  return (
    <aside className="animate-fade-overlay fixed inset-0 z-30 flex justify-end bg-black/40 px-0 backdrop-blur-sm sm:px-4">
      <div className="glass-panel animate-slide-in-right flex h-full w-full max-w-2xl flex-col overflow-hidden sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-xl">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200/80 px-5 dark:border-white/[0.08]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {ticket.id}
              </p>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {ticket.shortDescription}
            </p>
          </div>
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:scale-[0.97] dark:border-white/10 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            onClick={onClose}
            title="Cerrar detalle"
            type="button"
          >
            <X size={19} aria-hidden="true" />
            <span className="sr-only">Cerrar detalle</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Informacion del ticket
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <IconField icon={UserRound} label="Usuario" value={ticket.user} />
              <IconField icon={Building2} label="Sector" value={ticket.sector} />
              <IconField icon={Wrench} label="Categoria" value={ticket.category} />
              <IconField icon={CheckCircle2} label="Subcategoria" value={ticket.subcategory} />
              <IconField icon={Tag} label="Etiqueta del dispositivo" value={ticket.deviceTag} />
              <IconField icon={CalendarDays} label="Fecha" value={ticket.date} />
            </dl>
            <DetailField label="Descripcion completa" value={ticket.fullDescription} />
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Gestion</h3>
            <form
              className="glass-card grid gap-3 rounded-xl p-4"
              onSubmit={handleStatusSubmit}
            >
              <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Estado
                <select
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 transition-colors focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-violet-500/50"
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value)}
                >
                  {statuses.map((status) => (
                    <option className="dark:bg-slate-900 dark:text-slate-100" key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!statusChanged}
                type="submit"
              >
                <CheckCircle2 size={17} aria-hidden="true" />
                Actualizar estado
              </button>
            </form>

            <form className="grid gap-3" onSubmit={handleObservationSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Observaciones
                <textarea
                  className="min-h-28 resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  placeholder="Agregar una observacion interna"
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                />
              </label>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 active:scale-[0.97] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                type="submit"
              >
                <Send size={17} aria-hidden="true" />
                Agregar observacion
              </button>
            </form>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Observaciones registradas
            </h3>
            {ticket.observations.length > 0 ? (
              <div className="grid gap-3">
                {ticket.observations.map((item) => (
                  <article
                    className="glass-card rounded-xl p-4"
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
              <p className="rounded-xl border border-dashed border-slate-300/60 bg-slate-50/50 p-4 text-sm text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-400">
                Sin observaciones registradas.
              </p>
            )}
          </section>

          <section className="mt-8 space-y-4 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Historial</h3>
            <HistoryTimeline history={ticket.history} />
          </section>
        </div>
      </div>
    </aside>
  );
}

function IconField({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400">
        <Icon size={17} aria-hidden="true" />
      </div>
      <DetailField label={label} value={value} />
    </div>
  );
}
