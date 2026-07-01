import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UserContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const { updateUserProfile } = useUsers();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Pasamos la nueva contraseña. UserContext se encarga de limpiarla y remover tempPassword.
      updateUserProfile(user.id, {
        email: user.email,
        telefono: user.telefono,
        password: password,
      });
      addToast("Contraseña actualizada con éxito. Sistema desbloqueado.", "success");
      // AuthContext via useEffect(users) auto-actualizará la sesión,
      // la cual al no tener tempPassword disparará la navegación hacia `/` (RootRedirect)
    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#0a0a1a]">
      {/* Background Decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-violet-600/10 mix-blend-multiply blur-3xl dark:bg-violet-600/10"></div>
        <div className="absolute -bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-teal-500/10 mix-blend-multiply blur-3xl dark:bg-teal-500/10"></div>
      </div>

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="animate-fade-in relative z-10 w-full max-w-md">
        <div className="glass-card overflow-hidden rounded-2xl border border-white/20 p-8 shadow-2xl dark:border-white/10 dark:shadow-none">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cambio de contraseña</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Por motivos de seguridad, debés configurar una nueva contraseña antes de continuar usando el sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nueva contraseña
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-10 text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar contraseña
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-3 text-slate-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500"
                    placeholder="Confirmá la nueva contraseña"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 active:scale-[0.98]"
            >
              Confirmar y continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
