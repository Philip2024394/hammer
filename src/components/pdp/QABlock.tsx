"use client";

import { useState } from "react";
import type { HammerexQuestion } from "@/lib/supabase";

export function QABlock({ questions }: { questions: HammerexQuestion[] }) {
  const [draft, setDraft] = useState("");
  return (
    <section id="qa" className="border-t border-brand-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Questions & answers</h2>
            <p className="mt-1 text-xs text-brand-muted">Answered by Hammerex and by people who own this tool.</p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setDraft(""); }}
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-surface p-4 sm:flex-row sm:items-center"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question about this product…"
            className="h-12 flex-1 rounded-full border border-brand-line bg-black px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="h-12 rounded-full bg-brand-accent px-5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-40"
          >Ask</button>
        </form>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface p-10 text-center">
            <p className="text-sm text-brand-text">No questions yet — yours could be the first.</p>
            <p className="mt-1 text-xs text-brand-muted">We answer within one business day.</p>
          </div>
        ) : (
          <ol className="space-y-4">
            {questions.map((q) => (
              <li key={q.id} className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                <p className="text-sm font-semibold text-brand-text">Q: {q.body}</p>
                <p className="mt-1 text-xs text-brand-muted">— {q.asked_by ?? "Anonymous"}</p>
                {q.answers.length > 0 && (
                  <ul className="mt-3 space-y-3 border-t border-brand-line pt-3">
                    {q.answers.map((a) => (
                      <li key={a.id}>
                        <p className="text-sm text-brand-text">A: {a.body}</p>
                        <p className="mt-1 text-xs text-brand-muted">
                          — {a.by_vendor ? "Hammerex team" : a.by_name ?? "Verified owner"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
