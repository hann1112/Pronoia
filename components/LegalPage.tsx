import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-svh max-w-[640px] px-4 pb-16 pt-32 md:px-6">
      <h1 className="font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">{title}</h1>
      <div className="legal mt-10 text-[13px] leading-[1.7]">{children}</div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-ui text-[11px] uppercase tracking-[0.2em]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
