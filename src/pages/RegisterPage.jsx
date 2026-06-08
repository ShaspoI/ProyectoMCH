import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    legajo: "",
    email: "",
    telefono: "",
    sector: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((v) => !v.trim())) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Ingrese un email valido");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    const result = register({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      legajo: form.legajo.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      sector: form.sector.trim(),
      password: form.password,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate("/login");
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg relative flex min-h-screen items-center justify-center p-4 transition-colors">

        <div className="relative w-full max-w-lg animate-fade-in">
          <div className="absolute right-0 top-0 -translate-y-16">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
              <ClipboardList size={26} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Registrese para crear solicitudes de mantenimiento
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-xl p-6"
          >
            {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Apellido
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  value={form.apellido}
                  onChange={(e) => setField("apellido", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Legajo
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  value={form.legajo}
                  onChange={(e) => setField("legajo", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Telefono
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  value={form.telefono}
                  onChange={(e) => setField("telefono", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sector
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  value={form.sector}
                  onChange={(e) => setField("sector", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar contrasena
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
            >
              Registrarse
            </button>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Ya tiene cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-violet-600 underline-offset-2 transition-colors hover:underline dark:text-violet-400"
              >
                Iniciar sesion
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
