"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
  title: string;
  description: string;
}

export function ImageSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Image */}
      <div className="relative group">
        <div className="border border-[var(--border)] rounded-sm overflow-hidden bg-[var(--surface)]">
          <Image
            src={slides[current].src}
            alt={slides[current].alt}
            width={1200}
            height={675}
            className="w-full h-auto"
          />
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm border border-[var(--border)] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:border-[var(--accent)]/50"
          aria-label="Previous"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--foreground)]">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm border border-[var(--border)] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:border-[var(--accent)]/50"
          aria-label="Next"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--foreground)]">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Info + dots */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">
            {slides[current].title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed">
            {slides[current].description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--border)] hover:bg-[var(--muted)]"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <span className="ml-2 text-[10px] font-mono text-[var(--muted)]">
            {current + 1}/{slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}
