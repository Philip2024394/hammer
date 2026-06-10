export function SectionHeader({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-brand-accent pb-1.5">
      <h2
        className="bg-brand-accent px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black sm:text-sm"
        style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%)", paddingRight: "1.75rem" }}
      >
        {title}
      </h2>
      {viewAllHref && (
        <a
          href={viewAllHref}
          className="text-[11px] font-bold uppercase tracking-widest text-brand-accent hover:underline sm:text-xs"
        >
          View all ›
        </a>
      )}
    </div>
  );
}
