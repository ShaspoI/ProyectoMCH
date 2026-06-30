import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/ticketUtils.js";

const TYPE_ICONS = {
  ticket_assigned: "🔔",
  ticket_status_changed: "🔄",
  ticket_conformidad_required: "✅",
  ticket_closed: "🔒",
  ticket_reopened: "🔓",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { getForUser, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const myNotifications = getForUser(user?.id ?? "");
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Campana */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/60 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
        title="Notificaciones"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ""}`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {open && (
        <>
          {/* Backdrop semi-transparente en mobile (evita que el panel quede sin contexto) */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="
            fixed inset-x-3 top-[72px] z-50 rounded-xl border border-slate-200/80 bg-white shadow-2xl
            dark:border-white/10 dark:bg-slate-900
            md:absolute md:inset-x-auto md:right-0 md:top-11 md:w-80 md:shadow-xl
            lg:w-96
          ">
          {/* Header del panel */}
          <div className="flex items-center justify-between border-b border-slate-200/50 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                  {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead(user.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck size={13} />
                  Leer todas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[420px] overflow-y-auto">
            {myNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400 dark:text-slate-500">Sin notificaciones</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {myNotifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 transition-colors ${
                      notif.read
                        ? "bg-transparent"
                        : "bg-violet-50/60 dark:bg-violet-500/5"
                    }`}
                  >
                    <span className="mt-0.5 text-base" aria-hidden="true">
                      {TYPE_ICONS[notif.type] ?? "📌"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${notif.read ? "text-slate-600 dark:text-slate-400" : "font-medium text-slate-900 dark:text-slate-100"}`}>
                        {notif.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-violet-400 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-500/10"
                        title="Marcar como leída"
                      >
                        <Check size={13} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
}
