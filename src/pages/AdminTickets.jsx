import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import KanbanColumn from "../components/KanbanColumn.jsx";
import MetricsPanel from "../components/MetricsPanel.jsx";
import TicketCard from "../components/TicketCard.jsx";
import TicketDetailPanel from "../components/TicketDetailPanel.jsx";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";
import { getStatus } from "../utils/ticketUtils.js";
import { Filter, X as XIcon } from "lucide-react";

const statusIds = TICKET_STATUSES.map((s) => s.id);

const defaultExpandedTicketIds = TICKET_STATUSES.reduce((acc, s) => {
  acc[s.id] = null;
  return acc;
}, {});

function buildColumns(tickets) {
  return TICKET_STATUSES.reduce((acc, status) => {
    acc[status.id] = tickets
      .filter((t) => t.status === status.id)
      .map((t) => t.id);
    return acc;
  }, {});
}

function ticketMatchesQuery(ticket, normalizedQuery) {
  if (!normalizedQuery) return true;
  return [
    ticket.id,
    ticket.userSnapshot?.name ?? ticket.user ?? "",
    ticket.userSnapshot?.sector ?? ticket.sector ?? "",
    ticket.userSnapshot?.legajo ?? "",
    ticket.category,
    ticket.subcategory,
    ticket.deviceTag,
    ticket.fullDescription,
    ticket.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function moveTicketToColumn(columns, ticketId, targetStatusId) {
  const nextColumns = statusIds.reduce((acc, statusId) => {
    acc[statusId] = (columns[statusId] ?? []).filter((id) => id !== ticketId);
    return acc;
  }, {});
  nextColumns[targetStatusId] = [...(nextColumns[targetStatusId] ?? []), ticketId];
  return nextColumns;
}

export default function AdminTickets() {
  const { user } = useAuth();
  const { tickets, changeStatus, addObservation, assignTicket } = useTickets();
  const { theme, toggleTheme } = useTheme();
  const { users } = useUsers();
  const tecnicos = useMemo(() => users.filter((u) => u.role === "tecnico" || u.role === "admin"), [users]);

  const [columns, setColumns] = useState(() => buildColumns(tickets));
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [expandedTicketIds, setExpandedTicketIds] = useState(defaultExpandedTicketIds);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [query, setQuery] = useState("");
  const [showMetrics, setShowMetrics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTecnico, setFilterTecnico] = useState("");   // "" = todos, "none" = sin asignar, o ID del técnico
  const [filterSector, setFilterSector] = useState("");     // "" = todos
  const [filterEstado, setFilterEstado] = useState("");     // "" = todos
  const columnsBeforeDragRef = useRef(null);
  const sourceContainerBeforeDragRef = useRef(null);

  const activeFiltersCount = [filterTecnico, filterSector, filterEstado].filter(Boolean).length;

  useEffect(() => {
    setColumns(buildColumns(tickets));
  }, [tickets]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ticketsById = useMemo(
    () => new Map(tickets.map((t) => [t.id, t])),
    [tickets],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const ticketsByStatus = useMemo(() => {
    return TICKET_STATUSES.reduce((acc, status) => {
      acc[status.id] = (columns[status.id] ?? [])
        .map((ticketId) => ticketsById.get(ticketId))
        .filter(Boolean)
        .filter((t) => ticketMatchesQuery(t, normalizedQuery))
        .filter((t) => {
          // Filtro por técnico
          if (filterTecnico === "none") return !t.assignedTo;
          if (filterTecnico) return t.assignedTo?.id === filterTecnico;
          return true;
        })
        .filter((t) => {
          // Filtro por sector
          if (filterSector) return (t.userSnapshot?.sector ?? t.sector ?? "") === filterSector;
          return true;
        })
        .filter((t) => {
          // Filtro por estado (adicional al agrupado por columna)
          if (filterEstado) return t.status === filterEstado;
          return true;
        });
      return acc;
    }, {});
  }, [columns, normalizedQuery, ticketsById, filterTecnico, filterSector, filterEstado]);

  // Sectores únicos derivados de los tickets actuales (para el selector)
  const availableSectors = useMemo(() => {
    const sectors = new Set(tickets.map((t) => t.userSnapshot?.sector ?? t.sector).filter(Boolean));
    return [...sectors].sort();
  }, [tickets]);

  function clearFilters() {
    setFilterTecnico("");
    setFilterSector("");
    setFilterEstado("");
  }

  const selectedTicket = selectedTicketId ? ticketsById.get(selectedTicketId) : null;
  const activeTicket = activeTicketId ? ticketsById.get(activeTicketId) : null;

  function findContainer(itemId, sourceColumns = columns) {
    if (statusIds.includes(itemId)) return itemId;
    return statusIds.find((statusId) => sourceColumns[statusId]?.includes(itemId));
  }

  function handleTicketActivation(ticketId) {
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer) return;
    if (expandedTicketIds[ticketContainer] === ticketId) {
      setSelectedTicketId(ticketId);
      return;
    }
    setExpandedTicketIds((prev) => ({ ...prev, [ticketContainer]: ticketId }));
  }

  function handleTicketCollapse(ticketId) {
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer) return;
    setExpandedTicketIds((prev) => ({ ...prev, [ticketContainer]: null }));
  }

  // Usa changeStatus del contexto — el contexto genera la entrada de historial con el actor real.
  function handleUpdateStatus(ticketId, newStatusId) {
    changeStatus(
      ticketId,
      newStatusId,
      `${user.nombre} ${user.apellido}`,
      user.id,
    );
    // Sincronizar columnas visualmente
    setColumns((prev) => moveTicketToColumn(prev, ticketId, newStatusId));
  }

  function handleAddObservation(ticketId, text) {
    addObservation(
      ticketId,
      text,
      `${user.nombre} ${user.apellido}`,
      user.id,
    );
  }

  function handleAssignTicket(ticketId, techId, techName) {
    assignTicket(
      ticketId,
      techId,
      techName,
      `${user.nombre} ${user.apellido}`,
      user.id
    );
  }

  function commitDroppedStatus(ticketId, nextStatusId) {
    const ticket = ticketsById.get(ticketId);
    if (!ticket || ticket.status === nextStatusId) return;
    changeStatus(
      ticketId,
      nextStatusId,
      `${user.nombre} ${user.apellido}`,
      user.id,
    );
  }

  function handleDragStart(event) {
    const ticketId = event.active.id;
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer || expandedTicketIds[ticketContainer] !== ticketId) return;
    columnsBeforeDragRef.current = columns;
    sourceContainerBeforeDragRef.current = ticketContainer;
    setActiveTicketId(ticketId);
  }

  function handleDragOver(event) {
    if (!activeTicketId) return;
    const activeId = event.active.id;
    const overId = event.over?.id;
    if (!overId || activeId === overId) return;
    setColumns((currentColumns) => {
      const activeContainer = findContainer(activeId, currentColumns);
      const overContainer = findContainer(overId, currentColumns);
      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return currentColumns;
      }
      const activeItems = currentColumns[activeContainer] ?? [];
      const overItems = currentColumns[overContainer] ?? [];
      const overIndex = overItems.indexOf(overId);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;
      return {
        ...currentColumns,
        [activeContainer]: activeItems.filter((id) => id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeId,
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd(event) {
    if (!activeTicketId) return;
    const activeId = event.active.id;
    const overId = event.over?.id;
    const activeContainer = findContainer(activeId);
    const overContainer = overId ? findContainer(overId) : null;
    const sourceContainer = sourceContainerBeforeDragRef.current;

    setActiveTicketId(null);
    columnsBeforeDragRef.current = null;
    sourceContainerBeforeDragRef.current = null;

    if (!overId || !activeContainer || !overContainer) return;

    if (activeContainer === overContainer && activeId !== overId && !statusIds.includes(overId)) {
      setColumns((currentColumns) => {
        const items = currentColumns[activeContainer] ?? [];
        const activeIndex = items.indexOf(activeId);
        const overIndex = items.indexOf(overId);
        if (activeIndex === -1 || overIndex === -1) return currentColumns;
        return { ...currentColumns, [activeContainer]: arrayMove(items, activeIndex, overIndex) };
      });
    }

    commitDroppedStatus(activeId, activeContainer);

    if (sourceContainer && sourceContainer !== activeContainer) {
      setExpandedTicketIds((prev) => ({
        ...prev,
        [sourceContainer]: null,
        [activeContainer]: activeId,
      }));
    }
  }

  function handleDragCancel() {
    if (columnsBeforeDragRef.current) {
      setColumns(columnsBeforeDragRef.current);
    }
    setActiveTicketId(null);
    columnsBeforeDragRef.current = null;
    sourceContainerBeforeDragRef.current = null;
  }

  return (
    <div className="flex w-full flex-col h-full">
      <DashboardHeader
        ticketCount={tickets.filter((t) => t.source === "whatsapp").length}
        query={query}
        theme={theme}
        onQueryChange={setQuery}
        onToggleTheme={toggleTheme}
        onOpenMetrics={() => setShowMetrics(true)}
      />

      <main className="mx-auto flex w-full max-w-[1480px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-5 transition-colors dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">Tablero operativo</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              Solicitudes recibidas y seguimiento
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {TICKET_STATUSES.map((status) => (
              <span
                className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                key={status.id}
              >
                {status.columnLabel}: {ticketsByStatus[status.id]?.length ?? 0}
              </span>
            ))}
            {/* Botón filtros */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300"
                  : "border-slate-200/80 bg-white/60 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              <Filter size={14} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white dark:bg-violet-500">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* Barra de filtros avanzados */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            {/* Filtro: Técnico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Técnico</label>
              <select
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                value={filterTecnico}
                onChange={(e) => setFilterTecnico(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="none">Sin asignar</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                ))}
              </select>
            </div>

            {/* Filtro: Sector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Sector</label>
              <select
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
              >
                <option value="">Todos</option>
                {availableSectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Filtro: Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Estado</label>
              <select
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos</option>
                {TICKET_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <XIcon size={14} />
                Limpiar
              </button>
            )}
          </div>
        )}


        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <section className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
            {TICKET_STATUSES.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                tickets={ticketsByStatus[status.id] ?? []}
                statuses={TICKET_STATUSES}
                expandedTicketId={expandedTicketIds[status.id]}
                onActivateTicket={handleTicketActivation}
                onCollapseTicket={handleTicketCollapse}
              />
            ))}
          </section>

          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
            {activeTicket ? (
              <TicketCard
                ticket={activeTicket}
                statuses={TICKET_STATUSES}
                isExpanded
                isOverlay
                onActivate={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {selectedTicket ? (
        <TicketDetailPanel
          ticket={selectedTicket}
          statuses={TICKET_STATUSES}
          onClose={() => setSelectedTicketId(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddObservation={handleAddObservation}
          onAssignTicket={handleAssignTicket}
        />
      ) : null}

      {showMetrics ? (
        <MetricsPanel
          tickets={tickets}
          statuses={TICKET_STATUSES}
          onClose={() => setShowMetrics(false)}
        />
      ) : null}
    </div>
  );
}
