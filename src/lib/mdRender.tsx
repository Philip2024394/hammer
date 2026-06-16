// Minimal markdown → JSX for /guides body_md. Intentionally narrow: just
// the subset our curated guides use (h2/h3/h4, paragraphs, lists, bold,
// italic, links). All content is hand-authored, so we don't need a full
// markdown parser. If guide authors start needing more, swap this for
// `marked` + DOMPurify and delete this file.

import { Fragment, type ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let k = 0;
  while (remaining.length > 0) {
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/\*([^*]+)\*/);
    const candidates = [
      linkMatch ? { idx: linkMatch.index!, m: linkMatch, type: "link" as const } : null,
      boldMatch ? { idx: boldMatch.index!, m: boldMatch, type: "bold" as const } : null,
      italicMatch ? { idx: italicMatch.index!, m: italicMatch, type: "italic" as const } : null
    ].filter((c): c is NonNullable<typeof c> => c !== null);
    candidates.sort((a, b) => a.idx - b.idx);
    const next = candidates[0];
    if (!next) {
      parts.push(remaining);
      break;
    }
    if (next.idx > 0) parts.push(remaining.slice(0, next.idx));
    if (next.type === "link") {
      parts.push(
        <a
          key={`${keyBase}-l-${k++}`}
          href={next.m[2]}
          className="text-brand-accent underline-offset-2 hover:underline"
        >
          {next.m[1]}
        </a>
      );
    } else if (next.type === "bold") {
      parts.push(
        <strong key={`${keyBase}-b-${k++}`} className="font-semibold text-brand-text">
          {next.m[1]}
        </strong>
      );
    } else {
      parts.push(
        <em key={`${keyBase}-i-${k++}`} className="italic">
          {next.m[1]}
        </em>
      );
    }
    remaining = remaining.slice(next.idx + next.m[0].length);
  }
  return <>{parts.map((p, i) => (typeof p === "string" ? <Fragment key={i}>{p}</Fragment> : p))}</>;
}

export function renderMarkdown(md: string): ReactNode {
  const blocks = md.split(/\n\n+/);
  const out: ReactNode[] = [];
  blocks.forEach((blockRaw, bi) => {
    const block = blockRaw.trim();
    if (!block) return;
    if (block.startsWith("#### ")) {
      out.push(
        <h4 key={bi} className="mt-6 text-base font-semibold text-brand-text">
          {inline(block.slice(5), `h4-${bi}`)}
        </h4>
      );
      return;
    }
    if (block.startsWith("### ")) {
      out.push(
        <h3 key={bi} className="mt-8 text-lg font-semibold text-brand-text">
          {inline(block.slice(4), `h3-${bi}`)}
        </h3>
      );
      return;
    }
    if (block.startsWith("## ")) {
      out.push(
        <h2 key={bi} className="mt-10 text-xl font-bold text-brand-text">
          {inline(block.slice(3), `h2-${bi}`)}
        </h2>
      );
      return;
    }
    if (/^[-*] /.test(block)) {
      const items = block.split("\n").map((l) => l.replace(/^[-*] /, ""));
      out.push(
        <ul key={bi} className="mt-4 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-brand-muted">
          {items.map((it, ii) => (
            <li key={ii}>{inline(it, `li-${bi}-${ii}`)}</li>
          ))}
        </ul>
      );
      return;
    }
    out.push(
      <p key={bi} className="mt-4 text-sm leading-relaxed text-brand-muted">
        {inline(block, `p-${bi}`)}
      </p>
    );
  });
  return <>{out}</>;
}
