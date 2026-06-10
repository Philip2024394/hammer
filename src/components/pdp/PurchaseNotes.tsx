export function PurchaseNotes({ notes }: { notes: string[] | null }) {
  if (!notes?.length) return null;
  return (
    <ul className="space-y-1 rounded-xl border border-brand-line bg-black/40 p-3 text-xs text-brand-text">
      {notes.map((n, i) => (
        <li key={i} className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-brand-accent" />
          <span>{n}</span>
        </li>
      ))}
    </ul>
  );
}
