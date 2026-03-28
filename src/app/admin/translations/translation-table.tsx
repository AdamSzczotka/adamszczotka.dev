"use client";

import { useState, useMemo, useRef } from "react";
import { upsertTranslation, deleteTranslation } from "./actions";

interface Translation {
  id: number;
  key: string;
  en: string;
  pl: string;
}

interface TranslationTableProps {
  translations: Translation[];
}

function groupByPrefix(items: Translation[]): Record<string, Translation[]> {
  const groups: Record<string, Translation[]> = {};
  for (const item of items) {
    const dotIndex = item.key.indexOf(".");
    const prefix = dotIndex > -1 ? item.key.substring(0, dotIndex) : "_ungrouped";
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(item);
  }
  return groups;
}

function TranslationRow({ t }: { t: Translation }) {
  const [editing, setEditing] = useState(false);
  const [en, setEn] = useState(t.en);
  const [pl, setPl] = useState(t.pl);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCancel = () => {
    setEn(t.en);
    setPl(t.pl);
    setEditing(false);
  };

  return (
    <tr className="border-b border-border last:border-b-0 group">
      <td className="py-2.5 pr-3 align-top">
        <code className="font-mono text-xs">{t.key}</code>
      </td>
      <td className="py-2.5 px-3 align-top">
        {editing ? (
          <textarea
            value={en}
            onChange={(e) => setEn(e.target.value)}
            rows={2}
            className="w-full border border-border bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-accent rounded-sm resize-y"
          />
        ) : (
          <span className="text-sm text-muted">{t.en}</span>
        )}
      </td>
      <td className="py-2.5 px-3 align-top">
        {editing ? (
          <textarea
            value={pl}
            onChange={(e) => setPl(e.target.value)}
            rows={2}
            className="w-full border border-border bg-transparent px-2 py-1 text-sm focus:outline-none focus:border-accent rounded-sm resize-y"
          />
        ) : (
          <span className="text-sm text-muted">{t.pl}</span>
        )}
      </td>
      <td className="py-2.5 pl-3 align-top">
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <form
                ref={formRef}
                action={async (formData) => {
                  await upsertTranslation(formData);
                  setEditing(false);
                }}
              >
                <input type="hidden" name="key" value={t.key} />
                <input type="hidden" name="en" value={en} />
                <input type="hidden" name="pl" value={pl} />
                <button
                  type="submit"
                  className="text-xs border border-green-500/30 text-green-500 px-2 py-1 rounded-sm hover:bg-green-500/10 transition-colors"
                >
                  Save
                </button>
              </form>
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs text-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
              >
                Edit
              </button>
              <form
                action={async () => {
                  await deleteTranslation(t.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </form>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function GroupSection({
  prefix,
  items,
  defaultOpen,
}: {
  prefix: string;
  items: Translation[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface transition-colors"
      >
        <span className="font-mono text-sm font-medium">
          {prefix === "_ungrouped" ? "(ungrouped)" : `${prefix}.*`}
        </span>
        <span className="text-xs text-muted">
          {items.length} key{items.length !== 1 ? "s" : ""}{" "}
          <span className="inline-block transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▾
          </span>
        </span>
      </button>
      {open && (
        <div className="border-t border-border">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-border">
                <th className="text-left font-normal py-2 pr-3 pl-4 w-[28%]">Key</th>
                <th className="text-left font-normal py-2 px-3 w-[30%]">EN</th>
                <th className="text-left font-normal py-2 px-3 w-[30%]">PL</th>
                <th className="text-left font-normal py-2 pl-3 pr-4 w-[12%]" />
              </tr>
            </thead>
            <tbody className="px-4">
              {items.map((t) => (
                <TranslationRow key={t.id} t={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function TranslationTable({ translations }: TranslationTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return translations;
    const q = search.toLowerCase();
    return translations.filter(
      (t) =>
        t.key.toLowerCase().includes(q) ||
        t.en.toLowerCase().includes(q) ||
        t.pl.toLowerCase().includes(q),
    );
  }, [translations, search]);

  const grouped = useMemo(() => groupByPrefix(filtered), [filtered]);
  const sortedPrefixes = useMemo(
    () => Object.keys(grouped).sort((a, b) => (a === "_ungrouped" ? 1 : b === "_ungrouped" ? -1 : a.localeCompare(b))),
    [grouped],
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by key or value..."
        className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
      />

      <div className="mt-6 space-y-3">
        {sortedPrefixes.length === 0 && (
          <p className="text-sm text-muted border border-border p-6 rounded-sm">
            No translations found.
          </p>
        )}
        {sortedPrefixes.map((prefix) => (
          <GroupSection
            key={prefix}
            prefix={prefix}
            items={grouped[prefix]}
            defaultOpen={!!search || sortedPrefixes.length <= 5}
          />
        ))}
      </div>
    </div>
  );
}
