"use client";

import { useId, useState, type ReactNode } from "react";

type AccordionProps = {
  title: string;
  children: ReactNode;
};

export function Accordion({ title, children }: AccordionProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-line">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between py-5 text-left font-ui text-[11px] font-medium uppercase tracking-[0.22em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-current"
        >
          <span>{title}</span>
          <span aria-hidden="true" className="ml-4 text-base leading-none">
            {open ? "−" : "+"}
          </span>
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="pb-6 text-[13px] leading-[1.7]">
        {children}
      </div>
    </div>
  );
}
