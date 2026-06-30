import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";
import { formatDate, getShortDescription, getStatus, isOverSLA } from "../utils/ticketUtils.js";
import TecnicoTicketPanel from "../components/TecnicoTicketPanel.jsx";

export default function TecnicoTickets() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const [detailTicketId, setDetailTicketId] = useState(null);
  const [filter, setFilter] = useState("activos");

  const myTickets = useMemo(() => {
    return tickets.filter((t) => t.assignedTo?.id === user.id && t.status !== "cerrado");
  }, [tickets, user.id]);

  const filteredTickets = useMemo(() => {
    if (filter === "activos") return myTickets;
    return myTickets.filter((t) => t.status === filter);
  }, [myTickets, filter]);

  const counts = useMemo(() => {
    return {
      asignado: myTickets.filter(t => t.status === "asignado").length,
      "en-proceso": myTickets.filter(t => t.status === "en-proceso").length,
      "resuelto-pendiente": myTickets.filter(t => t.status === "resuelto-pendiente").length,
    };
  }, [myTickets]);

  const detailTicket = detailTicketId
    ? tickets.find((t) => t.id === detailTicketId)
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Mis Tickets Asignados
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tenés {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} activo{myTickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        {/* Filters */}
        <div className="mt-4 flex gap-2 sm:mt-0 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <FilterButton 
            active={filter === "activos"} 
            onClick={() => setFilter("activos")}
            label="Todos"
            count={myTickets.length}
          />
          <FilterButton 
            active={filter === "asignado"} 
            onClick={() => setFilter("asignado")}
            label="Asignados"
            count={counts.asignado}
          />
          <FilterButton 
            active={filter === "en-proceso"} 
            onClick={() => setFilter("en-proceso")}
            label="En proceso"
            count={counts["en-proceso"]}
          />
          <FilterButton 
            active={filter === "resuelto-pendiente"} 
            onClick={() => setFilter("resuelto-pendiente")}
            label="Por cerrar"
            count={counts["resuelto-pendiente"]}
          />
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center text-sm text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          No hay tickets en esta categoría.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredTickets.map((ticket) => {
            const status = getStatus(TICKET_STATUSES, ticket.status);
            return (
              <button
                key={ticket.id}
                onClick={() => setDetailTicketId(ticket.id)}
                className="glass-card flex w-full flex-col gap-3 rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-lg dark:hover:shadow-white/5"
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {ticket.id}
                    </span>
                    <StatusBadge status={status} />
                    {isOverSLA(ticket) && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                        title="Este ticket lleva más de 3 días sin cerrarse"
                      >
                        ⏱ +3d
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                
                <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {getShortDescription(ticket.fullDescription)}
                </p>
                
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                    {ticket.category}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    {ticket.userSnapshot?.sector || "Sin sector"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {detailTicket && (
        <TecnicoTicketPanel 
          ticket={detailTicket} 
          onClose={() => setDetailTicketId(null)} 
        />
      )}
    </div>
  );
}

function FilterButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-teal-600 text-white shadow-sm shadow-teal-500/20"
          : "bg-white/60 text-slate-600 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
