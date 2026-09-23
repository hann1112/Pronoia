"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useUiStore } from "@/lib/ui-store";

type EmailFormProps = {
  label: string;
  variant?: "panel" | "bar";
  // Hinweis von außen, z. B. „Link abgelaufen“ nach Rückkehr aus der Bestätigungsmail.
  notice?: string;
  onSuccess?: () => void;
};
type FormStatus = "idle" | "loading" | "success" | "error";

const INVALID_EMAIL = "BITTE GÜLTIGE E-MAIL EINGEBEN.";
const FAILED = "DAS HAT NICHT GEKLAPPT. BITTE NOCHMAL VERSUCHEN.";
const SUCCESS = "FAST GESCHAFFT. BITTE BESTÄTIGE DEINE E-MAIL.";

export function EmailForm({ label, variant = "panel", notice, onSuccess }: EmailFormProps) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<FormStatus>(notice ? "error" : "idle");
  const [message, setMessage] = useState(notice ?? "");
  const setSubscribed = useUiStore((state) => state.setSubscribed);
  const locked = status === "loading" || status === "success";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254) {
      setStatus("error");
      setMessage(INVALID_EMAIL);
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, company }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "subscribe_failed");
      }
      setStatus("success");
      setMessage(SUCCESS);
      onSuccess?.();
      setSubscribed(true);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.message === "invalid_email" ? INVALID_EMAIL : FAILED);
    }
  }

  const input = (
    <input
      id={`${id}-email`}
      type="email"
      autoComplete="email"
      inputMode="email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      disabled={locked}
      placeholder="E-MAIL-ADRESSE"
      aria-describedby={`${id}-hint`}
      aria-invalid={status === "error" && message === INVALID_EMAIL ? true : undefined}
      className={`${variant === "bar" ? "h-9 md:h-10" : "h-11"} w-full min-w-0 border-0 border-b border-line bg-transparent px-0 font-ui text-[11px] tracking-[0.2em] text-ink outline-none placeholder:text-faint focus:border-ink`}
    />
  );

  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={`${id}-company`}>Firma</label>
      <input id={`${id}-company`} name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
    </div>
  );

  const button = (
    <button
      type="submit"
      disabled={locked}
      className={`${variant === "bar" ? "h-9 md:w-auto md:px-6" : "h-11"} w-full shrink-0 rounded-[6px] bg-ink px-4 font-ui text-[11px] uppercase tracking-[0.2em] text-bg disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink`}
    >
      {status === "loading" ? "…" : "Eintragen"}
    </button>
  );

  const statusLine = message && (
    <p role="status" aria-live="polite" className={variant === "bar" ? "font-ui text-[10px] uppercase tracking-[0.2em]" : "mt-3 text-[11px] leading-[1.6]"}>
      {message}
    </p>
  );

  if (variant === "bar") {
    if (status === "success") {
      return <div className="flex min-h-9 items-center md:min-h-10">{statusLine}</div>;
    }
    // Hinweiszeile nur, solange das Formular fokussiert oder ausgefüllt ist (Spec 6.5).
    return (
      <form onSubmit={handleSubmit} className="group w-full" noValidate>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
          <label htmlFor={`${id}-email`} className="sr-only font-ui text-[11px] uppercase tracking-[0.2em] md:not-sr-only md:shrink-0">
            {label}
          </label>
          {input}
          {honeypot}
          {button}
        </div>
        {message && <div className="mt-1.5">{statusLine}</div>}
        <p id={`${id}-hint`} className={`${email ? "block" : "hidden group-focus-within:block"} mt-1.5 text-[10px] leading-[1.6] text-muted`}>
          Mit dem Eintragen erhältst du Updates zu pronoia per E-Mail. Abmeldung jederzeit.{" "}
          <Link href="/datenschutz" className="uppercase tracking-[0.2em] underline underline-offset-2">Datenschutz</Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <label htmlFor={`${id}-email`} className="font-ui text-[11px] uppercase tracking-[0.2em]">
        {label}
      </label>
      <div className="mt-3 flex flex-col gap-3">
        {input}
        {honeypot}
        {button}
      </div>
      {statusLine}
      <p id={`${id}-hint`} className="mt-3 text-[10px] leading-[1.7] text-muted">
        Mit dem Eintragen erhältst du Updates zu pronoia per E-Mail. Abmeldung jederzeit.{" "}
        <Link href="/datenschutz" className="underline underline-offset-2">Datenschutz</Link>
      </p>
    </form>
  );
}
