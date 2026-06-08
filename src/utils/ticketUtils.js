export function getStatus(statuses, statusId) {
  return statuses.find((status) => status.id === statusId) ?? statuses[0];
}

export function formatActionDate(date) {
  return date;
}

export function buildHistoryEntry({ action, detail }) {
  return {
    id: `hist-${Date.now()}`,
    action,
    detail,
    actor: "Mantenimiento",
    date: new Intl.DateTimeFormat("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };
}
