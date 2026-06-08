import { ClipboardList, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="ambient-bg relative flex min-h-screen items-center justify-center p-4 transition-colors">

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="absolute right-0 top-0 -translate-y-16">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
              <ClipboardList size={26} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Recuperar contraseña
            </h1>
          </div>

          {sent ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <MailCheck size={26} aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Se ha enviado un enlace de recuperacion a su correo electronico.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
              >
                Volver al inicio de sesion
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-xl p-6"
            >
              <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Ingrese su correo electronico y le enviaremos un enlace para restablecer su
                contraseña.
              </p>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500/50"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.97]"
              >
                Recuperar contraseña
              </button>

              <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <Link
                  to="/login"
                  className="font-medium text-violet-600 underline-offset-2 transition-colors hover:underline dark:text-violet-400"
                >
                  Volver al inicio de sesion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
