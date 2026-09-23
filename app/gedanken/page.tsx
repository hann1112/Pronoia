import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, KIND_LABELS, readingMinutes, writings } from "@/lib/writing";

export const metadata: Metadata = {
  title: "gedanken — pronoia",
  description: "Essays, Gedanken und Notizen zur Marke pronoia.",
};

export default function GedankenPage() {
  return (
    <main className="mx-auto min-h-svh max-w-[720px] px-4 pb-24 pt-32 md:px-6">
      <h1 className="font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">gedanken</h1>
      <p className="mt-6 text-[13px] leading-[1.7] text-muted">Essays, Gedanken und Notizen zur Marke.</p>

      <ol className="mt-16 border-t border-line">
        {writings.map((writing) => (
          <li key={writing.slug} className="border-b border-line">
            <Link
              href={`/gedanken/${writing.slug}`}
              className="group grid gap-3 py-8 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink md:grid-cols-[180px_1fr] md:gap-8"
            >
              <span className="whitespace-nowrap font-ui text-[10px] uppercase tracking-[0.2em] text-muted md:pt-3">
                {KIND_LABELS[writing.kind]} · <time dateTime={writing.date}>{formatDate(writing.date)}</time>
              </span>
              <span>
                <span className="block font-display text-[clamp(32px,4vw,52px)] leading-[1.05] transition-opacity group-hover:opacity-60">
                  {writing.title}
                </span>
                <span className="mt-3 block font-ui text-[10px] uppercase tracking-[0.2em] text-muted">
                  {readingMinutes(writing)} Min. Lesezeit →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
