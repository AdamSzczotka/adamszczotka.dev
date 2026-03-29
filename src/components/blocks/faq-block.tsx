"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  items?: FaqItem[];
}

export function FaqBlock({ data }: { data: FaqData }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  if (!data.items || data.items.length === 0) return null;

  function toggle(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="divide-y divide-[var(--border)]">
          {data.items.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span className="font-semibold pr-4">{item.question}</span>
                <span className="shrink-0 text-muted font-mono text-sm">
                  {openItems.has(i) ? "-" : "+"}
                </span>
              </button>
              {openItems.has(i) && (
                <p className="pb-4 text-muted leading-relaxed text-sm">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
