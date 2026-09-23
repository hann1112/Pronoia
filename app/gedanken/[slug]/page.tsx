import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { formatDate, getWriting, KIND_LABELS, paragraphs, readingMinutes, summary, writings } from "@/lib/writing";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return writings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const writing = getWriting(slug);
  if (!writing) notFound();

  const description = summary(writing);
  return {
    title: `${writing.title} — pronoia`,
    description,
    openGraph: { type: "article", title: writing.title, description, publishedTime: writing.date },
  };
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  const writing = getWriting(slug);
  if (!writing) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: writing.title,
    description: summary(writing),
    datePublished: writing.date,
    inLanguage: "de",
    url: `${SITE_URL}/gedanken/${writing.slug}`,
    author: { "@type": "Organization", name: "pronoia" },
  };

  return (
    <main className="mx-auto min-h-svh max-w-[640px] px-4 pb-24 pt-32 md:px-6">
      <article>
        <header>
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-muted">
            {KIND_LABELS[writing.kind]} · <time dateTime={writing.date}>{formatDate(writing.date)}</time> · {readingMinutes(writing)} Min.
          </p>
          <h1 className="mt-6 font-display text-[clamp(46px,5.75vw,92px)] leading-[1.05]">{writing.title}</h1>
        </header>

        <div className="mt-14 space-y-6 font-display-regular text-[clamp(20px,1.9vw,24px)] leading-[1.6]">
          {paragraphs(writing).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </article>

      <Link
        href="/gedanken"
        className="mt-20 inline-block font-ui text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        ← alle gedanken
      </Link>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
