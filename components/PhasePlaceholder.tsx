export function PhasePlaceholder({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-svh max-w-[640px] px-4 pb-16 pt-32 md:px-6">
      <h1 className="font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">{title}</h1>
      <p className="mt-8 text-[13px] leading-[1.7]">Inhalt folgt in einer späteren Projektphase.</p>
    </main>
  );
}
