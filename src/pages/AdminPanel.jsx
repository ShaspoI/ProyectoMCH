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
import { LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import KanbanColumn from "../components/KanbanColumn.jsx";
import MetricsPanel from "../components/MetricsPanel.jsx";
import TicketCard from "../components/TicketCard.jsx";
import TicketDetailPanel from "../components/TicketDetailPanel.jsx";
import { statuses } from "../data/mockTickets.js";
import { buildHistoryEntry, getStatus } from "../utils/ticketUtils.js";

const statusIds = statuses.map((status) => status.id);
const defaultExpandedTicketIds = statuses.reduce((accumulator, status) => {
  accumulator[status.id] = null;
  return accumulator;
}, {});

function buildColumns(tickets) {
  return statuses.reduce((accumulator, status) => {
    accumulator[status.id] = tickets
      .filter((ticket) => ticket.status === status.id)
      .map((ticket) => ticket.id);
    return accumulator;
  }, {});
}

function ticketMatchesQuery(ticket, normalizedQuery) {
  if (!normalizedQuery) return true;

  return [
    ticket.id,
    ticket.user,
    ticket.sector,
    ticket.category,
    ticket.subcategory,
    ticket.deviceTag,
    ticket.shortDescription,
    ticket.fullDescription,
    ticket.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function moveTicketToColumn(columns, ticketId, targetStatusId) {
  const nextColumns = statusIds.reduce((accumulator, statusId) => {
    accumulator[statusId] = (columns[statusId] ?? []).filter((id) => id !== ticketId);
    return accumulator;
  }, {});

  nextColumns[targetStatusId] = [...(nextColumns[targetStatusId] ?? []), ticketId];
  return nextColumns;
}

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const { tickets, setTickets } = useTickets();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [columns, setColumns] = useState(() => buildColumns(tickets));
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [expandedTicketIds, setExpandedTicketIds] = useState(defaultExpandedTicketIds);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [query, setQuery] = useState("");
  const [showMetrics, setShowMetrics] = useState(false);
  const columnsBeforeDragRef = useRef(null);
  const sourceContainerBeforeDragRef = useRef(null);

  useEffect(() => {
    setColumns(buildColumns(tickets));
  }, [tickets]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ticketsById = useMemo(() => {
    return new Map(tickets.map((ticket) => [ticket.id, ticket]));
  }, [tickets]);

  const normalizedQuery = query.trim().toLowerCase();
  const ticketsByStatus = useMemo(() => {
    return statuses.reduce((accumulator, status) => {
      accumulator[status.id] = (columns[status.id] ?? [])
        .map((ticketId) => ticketsById.get(ticketId))
        .filter(Boolean)
        .filter((ticket) => ticketMatchesQuery(ticket, normalizedQuery));
      return accumulator;
    }, {});
  }, [columns, normalizedQuery, ticketsById]);

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

    setExpandedTicketIds((currentExpandedTicketIds) => ({
      ...currentExpandedTicketIds,
      [ticketContainer]: ticketId,
    }));
  }

  function handleTicketCollapse(ticketId) {
    const ticketContainer = findContainer(ticketId);
    if (!ticketContainer) return;

    setExpandedTicketIds((currentExpandedTicketIds) => ({
      ...currentExpandedTicketIds,
      [ticketContainer]: null,
    }));
  }

  function updateTicketStatus(ticketId, statusId, historyEntry) {
    const currentTicket = ticketsById.get(ticketId);

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: statusId,
              history: [...ticket.history, historyEntry],
            }
          : ticket,
      ),
    );

    if (currentTicket?.status !== statusId) {
      setColumns((currentColumns) => moveTicketToColumn(currentColumns, ticketId, statusId));
    }
  }

  function addObservation(ticketId, observation) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              observations: [...ticket.observations, observation],
              history: [
                ...ticket.history,
                buildHistoryEntry({
                  action: "Observacion agregada",
                  detail: "Se registro una nueva observacion interna.",
                }),
              ],
            }
          : ticket,
      ),
    );
  }

  function commitDroppedStatus(ticketId, nextStatusId) {
    const ticket = ticketsById.get(ticketId);
    if (!ticket || ticket.status === nextStatusId) return;

    const previousStatus = getStatus(statuses, ticket.status);
    const nextStatus = getStatus(statuses, nextStatusId);

    setTickets((currentTickets) =>
      currentTickets.map((currentTicket) =>
        currentTicket.id === ticketId
          ? {
              ...currentTicket,
              status: nextStatusId,
              history: [
                ...currentTicket.history,
                buildHistoryEntry({
                  action: "Estado actualizado",
                  detail: `Cambio de ${previousStatus.label} a ${nextStatus.label}.`,
                }),
              ],
            }
          : currentTicket,
      ),
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

        return {
          ...currentColumns,
          [activeContainer]: arrayMove(items, activeIndex, overIndex),
        };
      });
    }

    commitDroppedStatus(activeId, activeContainer);

    if (sourceContainer && sourceContainer !== activeContainer) {
      setExpandedTicketIds((currentExpandedTicketIds) => ({
        ...currentExpandedTicketIds,
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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="dashboard-shell transition-colors">
        <header className="border-b border-slate-200/50 bg-white/40 backdrop-blur-md transition-colors dark:border-white/[0.12] dark:bg-white/10">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Admin:{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.nombre} {user?.apellido}
              </span>
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-[0.97] dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut size={16} aria-hidden="true" />
              Cerrar sesion
            </button>
          </div>
        </header>

        <DashboardHeader
          ticketCount={tickets.length}
          query={query}
          theme={theme}
          onQueryChange={setQuery}
          onToggleTheme={toggleTheme}
          onOpenMetrics={() => setShowMetrics(true)}
        />

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-5 transition-colors dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tablero operativo</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Solicitudes recibidas y seguimiento
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {statuses.map((status) => (
                <span
                  className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  key={status.id}
                >
                  {status.columnLabel}: {ticketsByStatus[status.id]?.length ?? 0}
                </span>
              ))}
            </div>
          </section>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <section className="grid gap-4 lg:grid-cols-3">
              {statuses.map((status) => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  tickets={ticketsByStatus[status.id] ?? []}
                  statuses={statuses}
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
                  statuses={statuses}
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
            statuses={statuses}
            onClose={() => setSelectedTicketId(null)}
            onUpdateStatus={updateTicketStatus}
            onAddObservation={addObservation}
          />
        ) : null}

        {showMetrics ? (
          <MetricsPanel
            tickets={tickets}
            statuses={statuses}
            onClose={() => setShowMetrics(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
