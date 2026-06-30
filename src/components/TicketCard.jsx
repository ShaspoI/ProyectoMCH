import {
  Building2,
  CalendarDays,
  ChevronUp,
  GripVertical,
  Tag,
  UserRound,
  Wrench,
} from "lucide-react";
import { forwardRef } from "react";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate, getShortDescription, getStatus, isOverSLA } from "../utils/ticketUtils.js";

const TicketCard = forwardRef(function TicketCard(
  {
    ticket,
    statuses,
    isExpanded,
    isDragging,
    isOverlay,
    dragHandleProps,
    onActivate = () => {},
    onCollapse = () => {},
    style,
  },
  ref,
) {
  const status = getStatus(statuses, ticket.status);
  const dragAttributes = dragHandleProps?.attributes ?? {};
  const dragListeners = dragHandleProps?.listeners ?? {};
  const rootDragListeners = isExpanded
    ? {
        onMouseDown: dragListeners.onMouseDown,
        onPointerDown: dragListeners.onPointerDown,
        onTouchStart: dragListeners.onTouchStart,
      }
    : {};

  function handleActivate() {
    onActivate(ticket.id);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  function handleCollapse(event) {
    event.preventDefault();
    event.stopPropagation();
    onCollapse(ticket.id);
  }

  function stopDragFromControl(event) {
    event.stopPropagation();
  }

  return (
    <article
      ref={ref}
      className={`glass-card group w-full cursor-pointer rounded-xl text-left ${
        isExpanded
          ? "p-4 ring-1 ring-violet-500/20 dark:ring-violet-500/10"
          : "px-3 py-2.5"
      } ${isDragging ? "opacity-40" : "opacity-100"} ${isOverlay ? "shadow-xl" : ""}`}
      {...dragAttributes}
      {...rootDragListeners}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-5 text-slate-900 dark:text-slate-50">
            {ticket.id}
          </p>
          <p className="truncate text-sm leading-5 text-slate-500 dark:text-slate-400">
            {ticket.userSnapshot?.name ?? ticket.user ?? "—"}
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1.5 overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <button
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 active:scale-[0.97] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
            onClick={handleCollapse}
            onMouseDown={stopDragFromControl}
            onPointerDown={stopDragFromControl}
            onTouchStart={stopDragFromControl}
            title="Minimizar ticket"
            type="button"
            tabIndex={isExpanded ? 0 : -1}
          >
            <ChevronUp size={17} aria-hidden="true" />
            <span className="sr-only">Minimizar ticket</span>
          </button>
          <span
            className="mt-0.5 flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-200 hover:border-violet-300 hover:text-violet-500 active:cursor-grabbing dark:border-white/10 dark:bg-white/5 dark:text-slate-500 dark:hover:border-violet-500/40 dark:hover:text-violet-300"
            onClick={stopDragFromControl}
            onKeyDown={stopDragFromControl}
            title="Arrastrar ticket"
          >
            <GripVertical size={17} aria-hidden="true" />
            <span className="sr-only">Arrastrar ticket</span>
          </span>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {getShortDescription(ticket.fullDescription)}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            <InfoRow icon={UserRound} value={ticket.userSnapshot?.name ?? ticket.user ?? "—"} />
            <InfoRow icon={Building2} value={ticket.userSnapshot?.sector ?? ticket.sector ?? "—"} />
            <InfoRow icon={Tag} value={ticket.deviceTag || "—"} />
            <InfoRow icon={CalendarDays} value={formatDate(ticket.createdAt)} />
            <InfoRow icon={Wrench} value={`${ticket.category} / ${ticket.subcategory}`} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
              {ticket.assignedTo && (
                <div 
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 ring-2 ring-white dark:bg-white/10 dark:text-slate-200 dark:ring-slate-900" 
                  title={`Asignado a: ${ticket.assignedTo.name}`}
                >
                  {ticket.assignedTo.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
              )}
              {isOverSLA(ticket) && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                  title="Este ticket lleva más de 3 días sin cerrarse"
                >
                  ⏱ +3d
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Click para ver detalle
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

export default TicketCard;

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="shrink-0 text-violet-400 dark:text-violet-400" size={15} aria-hidden="true" />
      <span className="truncate">{value}</span>
    </div>
  );
}
