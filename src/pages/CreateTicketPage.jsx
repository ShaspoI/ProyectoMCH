import { SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTickets } from "../context/TicketContext.jsx";
import { buildHistoryEntry } from "../utils/ticketUtils.js";
import { statuses } from "../data/mockTickets.js";

export default function CreateTicketPage() {
  const { user } = useAuth();
  const { tickets, addTicket } = useTickets();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [deviceTag, setDeviceTag] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function generateTicketId() {
    const maxNum = tickets.reduce((max, t) => {
      const num = parseInt(t.id.replace("MT-", ""), 10);
      return num > max ? num : max;
    }, 1012);
    return `MT-${maxNum + 1}`;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!category.trim() || !subcategory.trim() || !description.trim()) {
      setError("Categoria, subcategoria y descripcion son obligatorios");
      return;
    }

    const now = new Intl.DateTimeFormat("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const newTicket = {
      id: generateTicketId(),
      user: `${user.nombre} ${user.apellido}`,
      sector: user.sector,
      category: category.trim(),
      subcategory: subcategory.trim(),
      deviceTag: deviceTag.trim(),
      shortDescription: description.trim().slice(0, 80),
      fullDescription: description.trim(),
      date: now,
      status: "abierto",
      observations: [],
      history: [
        buildHistoryEntry({
          action: "Ticket creado",
          detail: "Solicitud creada desde el portal de usuario.",
        }),
      ],
    };

    addTicket(newTicket);
    navigate("/dashboard/my-tickets");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Crear ticket
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Complete el formulario para registrar una nueva solicitud de mantenimiento.
      </p>

      <form
        onSubmit={handleSubmit}
        className="glass-card mt-6 rounded-xl p-6"
      >
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Categoria
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Seleccione una categoria</option>
              <option value="Electrico">Electrico</option>
              <option value="Mecanico">Mecanico</option>
              <option value="Climatizacion">Climatizacion</option>
              <option value="Sanitario">Sanitario</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Equipo">Equipo</option>
              <option value="Mobiliario">Mobiliario</option>
              <option value="Herramientas">Herramientas</option>
              <option value="Iluminacion">Iluminacion</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Subcategoria
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              placeholder="Ej: Iluminacion, Toma corriente, Cinta transportadora"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Etiqueta del equipo
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              placeholder="Ej: LUM-A12, CT-P05 (opcional)"
              value={deviceTag}
              onChange={(e) => setDeviceTag(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Descripcion
            </label>
            <textarea
              className="min-h-32 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              placeholder="Describa el problema o solicitud..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
          >
            <SendHorizonal size={17} aria-hidden="true" />
            Crear ticket
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.97] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
