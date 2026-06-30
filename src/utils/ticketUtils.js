import { TICKET_STATUSES } from "../config/ticketStatuses.js";

/**
 * Devuelve el objeto de estado correspondiente al id dado.
 * Si no existe, retorna el primer estado (defensa ante datos inválidos).
 */
export function getStatus(statuses, statusId) {
  return statuses.find((s) => s.id === statusId) ?? statuses[0];
}

/**
 * Formatea una fecha ISO 8601 a formato legible en español (Argentina).
 * Compatible con Chrome, Safari y Firefox.
 * Ej: "2026-05-29T08:15:00.000Z" → "29/05/2026 08:15"
 */
export function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (isNaN(date)) return isoString; // fallback sin crash para strings no estándar
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Calcula la diferencia en minutos entre dos fechas ISO 8601.
 * Devuelve null si alguna fecha es inválida.
 * Compatible con todos los navegadores.
 */
export function diffMinutes(isoStart, isoEnd) {
  const start = new Date(isoStart);
  const end = new Date(isoEnd);
  if (isNaN(start) || isNaN(end)) return null;
  return (end - start) / (1000 * 60);
}

/**
 * Devuelve los primeros N caracteres de fullDescription para usarse como
 * previsualización en tarjetas y listas. No se persiste en el schema del ticket.
 */
export function getShortDescription(fullDescription, maxLength = 80) {
  if (!fullDescription) return "";
  return fullDescription.length > maxLength
    ? fullDescription.slice(0, maxLength)
    : fullDescription;
}

/**
 * Construye una entrada de historial con el actor real del sistema.
 * actor/actorId deben ser el usuario autenticado en el momento de la acción.
 */
export function buildHistoryEntry({ action, detail, actor, actorId }) {
  return {
    id: `hist-${Date.now()}`,
    action,
    detail,
    actor: actor ?? "Sistema",
    actorId: actorId ?? "system",
    createdAt: new Date().toISOString(),
  };
}

/**
 * @deprecated Reemplazada por formatDate(). Se mantiene temporalmente para
 * evitar errores en componentes que aún no fueron migrados.
 */
export function formatActionDate(isoString) {
  return formatDate(isoString);
}

/**
 * Evalúa si un ticket ha excedido el umbral de SLA sin ser cerrado.
 * Umbral fijo: 3 días (Fase 4B-Core). Configurable en fases futuras.
 * @param {object} ticket - Objeto del ticket del schema v3
 * @param {number} thresholdDays - Días de umbral (default: 3)
 * @returns {boolean}
 */
export function isOverSLA(ticket, thresholdDays = 3) {
  if (!ticket?.createdAt || ticket.status === "cerrado") return false;
  const created = new Date(ticket.createdAt).getTime();
  if (isNaN(created)) return false;
  return (Date.now() - created) > thresholdDays * 24 * 60 * 60 * 1000;
}
