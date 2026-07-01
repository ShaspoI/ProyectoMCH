import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockTickets } from "../data/mockTickets.js";
import { TICKET_STATUSES } from "../config/ticketStatuses.js";

const TicketContext = createContext(null);

// Cambiamos la clave al introducir un schema incompatible con la versión anterior.
// Esto fuerza una recarga desde mockTickets y evita errores con datos viejos en localStorage.
const STORAGE_KEY = "maintenance-tickets-v3";

function loadTickets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTickets;
  } catch {
    return mockTickets;
  }
}

/** Genera IDs en formato MT-NNN a partir del máximo existente. */
function generateTicketId(tickets) {
  const maxNum = tickets.reduce((max, t) => {
    const num = parseInt(String(t.id).replace("MT-", ""), 10);
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 1012);
  return `MT-${maxNum + 1}`;
}

export function TicketProvider({ children, onEvent }) {
  const [tickets, setTickets] = useState(loadTickets);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  /**
   * Crea un nuevo ticket con el schema completo.
   * La generación del ID, la construcción del objeto y la entrada de historial
   * son responsabilidad exclusiva del contexto.
   */
  const addTicket = useCallback(
    ({ category, subcategory, deviceTag, fullDescription, userId, userSnapshot, source }) => {
      const id = generateTicketId(tickets);
      const now = new Date().toISOString();

      const newTicket = {
        id,
        source: source ?? "web",
        userId,
        userSnapshot,                  // { name, sector, legajo }
        category,
        subcategory,
        deviceTag: deviceTag?.trim() ?? "",
        fullDescription: fullDescription.trim(),
        // shortDescription eliminado del schema — se deriva en render con getShortDescription()
        status: "pendiente",
        createdAt: now,
        assignedTo: null,              // { id, name } cuando se asigna técnico
        resolvedAt: null,
        closedAt: null,
        observations: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            action: "Ticket creado",
            detail: "Solicitud creada desde el portal de usuario.",
            actor: userSnapshot.name,
            actorId: userId,
            createdAt: now,
          },
        ],
      };

      setTickets((prev) => [...prev, newTicket]);

      if (onEvent) {
        onEvent("ticket_created", "admin", { ticketId: id });
      }
    },
    [tickets, onEvent],
  );

  /**
   * Cambia el estado de un ticket.
   * Registra automáticamente la entrada de historial con el actor real.
   * Si el nuevo estado es "resuelto", establece closedAt.
   */
  const changeStatus = useCallback((ticketId, newStatusId, actor, actorId) => {
    // Leer el ticket ANTES del update para usarlo en la notificación.
    // tickets está en el closure (igual que addTicket). onEvent NO debe
    // llamarse dentro del updater de setTickets (viola React rules of hooks).
    const ticket = tickets.find((t) => t.id === ticketId);

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const prevLabel = TICKET_STATUSES.find((s) => s.id === t.status)?.label ?? t.status;
        const newLabel  = TICKET_STATUSES.find((s) => s.id === newStatusId)?.label ?? newStatusId;
        const now = new Date().toISOString();
        return {
          ...t,
          status: newStatusId,
          resolvedAt: newStatusId === "resuelto-pendiente" ? now : t.resolvedAt,
          closedAt: newStatusId === "cerrado" ? now : t.closedAt,
          history: [
            ...t.history,
            {
              id: `hist-${Date.now()}`,
              action: "Estado actualizado",
              detail: `Cambio de ${prevLabel} a ${newLabel}.`,
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );

    // onEvent se llama DESPUÉS de setTickets, fuera del updater.
    if (onEvent && ticket) {
      const newLabel = TICKET_STATUSES.find((s) => s.id === newStatusId)?.label ?? newStatusId;
      if (newStatusId === "resuelto-pendiente") {
        onEvent("ticket_conformidad_required", ticket.userId, { ticketId });
      } else if (newStatusId === "cerrado") {
        onEvent("ticket_closed", ticket.userId, { ticketId });
      } else if (newStatusId === "en-proceso" && ticket.assignedTo?.id && actorId !== ticket.assignedTo.id) {
        onEvent("ticket_reopened", ticket.assignedTo.id, { ticketId });
      } else {
        onEvent("ticket_status_changed", ticket.userId, { ticketId, newStatusLabel: newLabel });
      }
    }
  }, [onEvent, tickets]);

  /**
   * Agrega una observación interna a un ticket.
   * Registra la entrada de historial con el actor real.
   */
  const addObservation = useCallback((ticketId, text, author, authorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          observations: [
            ...t.observations,
            {
              id: `obs-${Date.now()}`,
              author: author ?? "Sistema",
              authorId: authorId ?? "system",
              text,
              createdAt: now,
            },
          ],
          history: [
            ...t.history,
            {
              id: `hist-${Date.now() + 1}`,
              action: "Observación agregada",
              detail: "Se registró una nueva observación interna.",
              actor: author ?? "Sistema",
              actorId: authorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
  }, []);

  /**
   * Asigna un técnico a un ticket.
   */
  const assignTicket = useCallback((ticketId, technicianId, technicianName, actor, actorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const wasPendiente = t.status === "pendiente";
        const newStatus = wasPendiente ? "asignado" : t.status;
        
        let historyEntries = [...t.history];
        if (wasPendiente) {
          const prevLabel = TICKET_STATUSES.find((s) => s.id === t.status)?.label ?? t.status;
          const newLabel = TICKET_STATUSES.find((s) => s.id === "asignado")?.label ?? "Asignado";
          historyEntries.push({
            id: `hist-${Date.now()}-status`,
            action: "Estado actualizado",
            detail: `Cambio de ${prevLabel} a ${newLabel}.`,
            actor: actor ?? "Sistema",
            actorId: actorId ?? "system",
            createdAt: now,
          });
        }
        
        historyEntries.push({
          id: `hist-${Date.now()}-assign`,
          action: `Asignado a ${technicianName}`,
          detail: "Técnico asignado al ticket.",
          actor: actor ?? "Sistema",
          actorId: actorId ?? "system",
          createdAt: now,
        });

        return {
          ...t,
          status: newStatus,
          assignedAt: t.assignedAt ?? now,   // Solo la primera asignación; reasignaciones lo preservan
          assignedTo: { id: technicianId, name: technicianName },
          history: historyEntries,
        };
      }),
    );
    // Notificar al técnico asignado (fuera del map, con el ID ya conocido)
    if (onEvent) {
      onEvent("ticket_assigned", technicianId, { ticketId });
    }
  }, [onEvent]);

  /**
   * Edita campos de un ticket (solo mientras status === "pendiente").
   */
  const editTicket = useCallback((ticketId, { category, subcategory, deviceTag, fullDescription }, actor, actorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId || t.status !== "pendiente") return t;
        return {
          ...t,
          category,
          subcategory,
          deviceTag: deviceTag?.trim() ?? "",
          fullDescription: fullDescription.trim(),
          history: [
            ...t.history,
            {
              id: `hist-${Date.now()}`,
              action: "Ticket editado",
              detail: "Se actualizaron los detalles de la solicitud.",
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
  }, []);

  /**
   * Confirma la conformidad del usuario (cierra el ticket).
   */
  const confirmTicket = useCallback((ticketId, actor, actorId) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const prevLabel = TICKET_STATUSES.find((s) => s.id === t.status)?.label ?? t.status;
        const newLabel = TICKET_STATUSES.find((s) => s.id === "cerrado")?.label ?? "Cerrado";
        return {
          ...t,
          status: "cerrado",
          closedAt: now,
          history: [
            ...t.history,
            {
              id: `hist-${Date.now()}-status`,
              action: "Estado actualizado",
              detail: `Cambio de ${prevLabel} a ${newLabel}.`,
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
            {
              id: `hist-${Date.now()}-confirm`,
              action: "Conformidad confirmada",
              detail: "El usuario confirmó la resolución.",
              actor: actor ?? "Sistema",
              actorId: actorId ?? "system",
              createdAt: now,
            },
          ],
        };
      }),
    );
    // onEvent se llama DESPUÉS del updater. actorId es el dueño (quien da conformidad).
    if (onEvent) {
      onEvent("ticket_closed", actorId, { ticketId });
    }
  }, [onEvent]);

  return (
    // setTickets NO se expone — los componentes deben usar las funciones encapsuladas
    <TicketContext.Provider value={{ tickets, addTicket, changeStatus, addObservation, assignTicket, editTicket, confirmTicket }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
