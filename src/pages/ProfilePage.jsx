import { Save } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefono, setTelefono] = useState(user?.telefono ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingrese un email valido");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    if (password && password.length < 4) {
      setError("La contrasena debe tener al menos 4 caracteres");
      return;
    }

    const stored = localStorage.getItem("maintenance-users");
    if (stored) {
      const users = JSON.parse(stored);
      const updated = users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            email,
            telefono,
            ...(password ? { password } : {}),
          };
        }
        return u;
      });
      localStorage.setItem("maintenance-users", JSON.stringify(updated));

      const session = JSON.parse(localStorage.getItem("maintenance-session"));
      if (session) {
        session.email = email;
        session.telefono = telefono;
        localStorage.setItem("maintenance-session", JSON.stringify(session));
      }
    }

    setPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Mi perfil
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Consulte y edite su informacion personal.
      </p>

      <form
        onSubmit={handleSubmit}
        className="glass-card mt-6 rounded-xl p-6"
      >
        {saved ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Datos actualizados correctamente.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Read-only fields */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500 dark:text-slate-400">
              Nombre
            </label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              {user?.nombre}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500 dark:text-slate-400">
              Apellido
            </label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              {user?.apellido}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500 dark:text-slate-400">
              Legajo
            </label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              {user?.legajo}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500 dark:text-slate-400">
              Sector
            </label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              {user?.sector}
            </p>
          </div>

          {/* Editable fields */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Telefono
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nueva contraseña
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              type="password"
              placeholder="Dejar en blanco para no cambiar"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirmar contraseña
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
              type="password"
              placeholder="Repita la nueva contrasena"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
        >
          <Save size={17} aria-hidden="true" />
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
