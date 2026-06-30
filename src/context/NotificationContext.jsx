import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const NotificationContext = createContext(null);

const STORAGE_KEY = "maintenance-notifications";
const MAX_AGE_DAYS = 30;

/**
 * Carga notificaciones desde localStorage, descartando las que tienen más de MAX_AGE_DAYS días.
 */
function loadNotifications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    return parsed.filter((n) => new Date(n.createdAt).getTime() > cutoff);
  } catch {
    return [];
  }
}

/**
 * Mensajes de notificación por tipo de evento del sistema.
 */
function buildMessage(type, payload) {
  switch (type) {
    case "ticket_assigned":
      return `Te asignaron el ticket ${payload.ticketId}`;
    case "ticket_status_changed":
      return `Tu ticket ${payload.ticketId} cambió a "${payload.newStatusLabel}"`;
    case "ticket_conformidad_required":
      return `Tu ticket ${payload.ticketId} está resuelto. Por favor confirmá la conformidad.`;
    case "ticket_closed":
      return `Tu ticket ${payload.ticketId} fue cerrado exitosamente.`;
    case "ticket_reopened":
      return `El ticket ${payload.ticketId} fue reabierto por el usuario.`;
    default:
      return `Evento en ticket ${payload.ticketId}`;
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadNotifications);

  // Persiste en localStorage ante cada cambio
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  /**
   * Escucha cambios de localStorage provenientes de otras pestañas (window.storage).
   * LIMITACIÓN CONOCIDA (Fase 4B-Core, entorno mock): React Context no se sincroniza
   * automáticamente entre pestañas. Este listener captura actualizaciones del storage
   * de otras pestañas y re-hidrata el estado local, logrando sincronización eventual.
   * En producción, esto se reemplazaría por WebSockets o SSE server-side.
   */
  useEffect(() => {
    function handleStorageEvent(event) {
      if (event.key !== STORAGE_KEY) return;
      try {
        const updated = event.newValue ? JSON.parse(event.newValue) : [];
        setNotifications(updated);
      } catch {
        // No crashear si el valor del storage está corrupto
      }
    }
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  /**
   * Agrega una nueva notificación para un destinatario específico.
   * Llamado desde TicketContext vía la prop onEvent de TicketProvider.
   *
   * @param {string} type - Tipo de evento ("ticket_assigned", etc.)
   * @param {string} recipientId - ID del usuario destinatario
   * @param {object} payload - { ticketId, newStatusLabel?, ... }
   */
  const addNotification = useCallback((type, recipientId, payload) => {
    if (!recipientId) return;
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recipientId,
      type,
      ticketId: payload?.ticketId ?? null,
      message: buildMessage(type, { ticketId: payload?.ticketId, ...payload }),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  /** Marca una notificación como leída. */
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  /** Marca todas las notificaciones del usuario como leídas. */
  const markAllAsRead = useCallback((userId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === userId ? { ...n, read: true } : n))
    );
  }, []);

  /**
   * Devuelve las notificaciones de un usuario específico, ordenadas por fecha desc.
   * Se usa como selector: cada portal llama a getForUser(user.id).
   */
  const getForUser = useCallback(
    (userId) => notifications.filter((n) => n.recipientId === userId),
    [notifications]
  );

  return (
    <NotificationContext.Provider value={{ addNotification, markAsRead, markAllAsRead, getForUser }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  return ctx;
}
