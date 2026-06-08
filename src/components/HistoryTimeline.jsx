import { formatActionDate } from "../utils/ticketUtils.js";

export default function HistoryTimeline({ history }) {
  return (
    <ol className="space-y-4">
      {history.map((entry) => (
        <li className="relative pl-6" key={entry.id}>
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900 ring-4 ring-slate-100 dark:bg-slate-100 dark:ring-slate-800" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {entry.action}
              </p>
              <time className="text-xs text-slate-500 dark:text-slate-400">
                {formatActionDate(entry.date)}
              </time>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{entry.detail}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{entry.actor}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
