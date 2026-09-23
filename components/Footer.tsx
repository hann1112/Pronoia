"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
  { href: "/versand", label: "Versand" },
] as const;

export function Footer() {
  const isHome = usePathname() === "/";

  return (
    <footer className={`grid grid-cols-[20px_1fr_20px] items-center gap-2 px-4 py-4 font-ui text-[clamp(7px,2vw,9px)] uppercase tracking-[0.03em] text-muted md:px-6 md:text-[9px] md:tracking-[0.2em] ${isHome ? "fixed inset-x-0 z-30 transition-[bottom] duration-500" : "border-t border-line"}`}
      style={isHome ? { bottom: "var(--email-bar-space, 0px)" } : { paddingBottom: "calc(1rem + var(--email-bar-space, 0px))" }}
    >
      <Link href="/" aria-label="pronoia – zur Startseite" className="flex items-center justify-center">
        <Image src="/brand/mark.svg" alt="" width={18} height={18} />
      </Link>
      <nav aria-label="Rechtliches" className="flex items-center justify-center gap-x-1.5 whitespace-nowrap md:gap-x-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink">
            {link.label}
          </Link>
        ))}
      </nav>
      <span aria-hidden="true" />
    </footer>
  );
}
