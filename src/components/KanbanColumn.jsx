import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTicketCard from "./SortableTicketCard.jsx";

const COLUMN_ACCENTS = {
  abierto: "border-blue-500/30 dark:border-blue-500/20",
  "en-proceso": "border-amber-500/30 dark:border-amber-500/20",
  resuelto: "border-emerald-500/30 dark:border-emerald-500/20",
};

const COLUMN_HEADER_ACCENTS = {
  abierto: "text-blue-600 dark:text-blue-400",
  "en-proceso": "text-amber-600 dark:text-amber-400",
  resuelto: "text-emerald-600 dark:text-emerald-400",
};

const COLUMN_COUNT_ACCENTS = {
  abierto: "bg-blue-500/10 text-blue-600 ring-blue-400/20 dark:text-blue-300 dark:ring-blue-500/20",
  "en-proceso": "bg-amber-500/10 text-amber-600 ring-amber-400/20 dark:text-amber-300 dark:ring-amber-500/20",
  resuelto: "bg-emerald-500/10 text-emerald-600 ring-emerald-400/20 dark:text-emerald-300 dark:ring-emerald-500/20",
};

export default function KanbanColumn({
  status,
  tickets,
  statuses,
  expandedTicketId,
  onActivateTicket,
  onCollapseTicket,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status.id,
    data: {
      type: "column",
      statusId: status.id,
    },
  });

  return (
    <section
      className={`flex min-h-[calc(100vh-230px)] min-w-0 flex-col rounded-xl border transition-all duration-200 ${
        COLUMN_ACCENTS[status.id] ?? "border-slate-200 dark:border-white/10"
      } ${
        isOver
          ? "bg-violet-50/80 dark:bg-violet-500/5 shadow-[0_0_20px_rgba(124,58,237,0.12)]"
          : "bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl"
      }`}
    >
      <div className={`flex min-h-14 items-center justify-between border-b px-4 ${
        isOver
          ? "border-violet-200 dark:border-violet-500/20"
          : "border-slate-200/80 dark:border-white/[0.07]"
      }`}>
        <div className="min-w-0">
          <h2 className={`truncate text-sm font-semibold ${COLUMN_HEADER_ACCENTS[status.id] ?? "text-slate-900 dark:text-slate-100"}`}>
            {status.columnLabel}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-500">Tickets de mantenimiento</p>
        </div>
        {/* key triggers count-pop animation on every change */}
        <span
          key={tickets.length}
          className={`animate-count-pop flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold ring-1 ${
            COLUMN_COUNT_ACCENTS[status.id] ?? "bg-slate-100 text-slate-700 ring-slate-200"
          }`}
        >
          {tickets.length}
        </span>
      </div>

      <SortableContext
        id={status.id}
        items={tickets.map((ticket) => ticket.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="grid flex-1 content-start gap-2.5 p-3">
          {tickets.map((ticket) => (
            <SortableTicketCard
              key={ticket.id}
              ticket={ticket}
              statuses={statuses}
              isExpanded={expandedTicketId === ticket.id}
              onActivate={onActivateTicket}
              onCollapse={onCollapseTicket}
            />
          ))}

          {tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300/60 bg-transparent px-3 py-8 text-center text-sm text-slate-400 dark:border-white/[0.07] dark:text-slate-600">
              Sin tickets visibles
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  );
}
