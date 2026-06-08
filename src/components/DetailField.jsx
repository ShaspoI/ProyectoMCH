export default function DetailField({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-normal text-slate-400 dark:text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </dd>
    </div>
  );
}
