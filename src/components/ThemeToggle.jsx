import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      className="relative flex h-10 w-[76px] shrink-0 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition-colors duration-300 hover:border-violet-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-500/50"
      onClick={onToggle}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      type="button"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={isDark}
    >
      <span
        className={`absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm transition-transform duration-300 dark:bg-violet-600 dark:text-white ${
          isDark ? "translate-x-9" : "translate-x-0"
        }`}
      >
        {/* key forces remount → triggers spin animation on every toggle */}
        <span key={theme} className="animate-spin-once block">
          {isDark ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
        </span>
      </span>
      <span className="flex w-full items-center justify-between px-2 text-slate-400 dark:text-slate-500">
        <Sun size={15} aria-hidden="true" />
        <Moon size={15} aria-hidden="true" />
      </span>
    </button>
  );
}
