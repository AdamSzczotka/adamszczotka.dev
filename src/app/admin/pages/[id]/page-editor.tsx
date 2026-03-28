"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  addBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from "../actions";

type BlockType = "hero" | "project_showcase" | "blog_feed" | "cta" | "text";

interface Block {
  id: number;
  pageId: number;
  type: BlockType;
  position: number;
  dataEn: Record<string, unknown>;
  dataPl: Record<string, unknown>;
}

interface Page {
  id: number;
  slug: string;
  title: string;
}

interface Project {
  id: number;
  title: string;
  locale: "en" | "pl";
}

const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  project_showcase: "Project Showcase",
  blog_feed: "Blog Feed",
  cta: "CTA",
  text: "Text",
};

export function PageEditor({
  page,
  blocks: initialBlocks,
  projects,
}: {
  page: Page;
  blocks: Block[];
  projects: Project[];
}) {
  const [locale, setLocale] = useState<"en" | "pl">("en");
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const [newBlockType, setNewBlockType] = useState<BlockType>("hero");
  const [isPending, startTransition] = useTransition();

  const blocks = initialBlocks;

  function handleAddBlock() {
    const nextPosition = blocks.length;
    startTransition(async () => {
      await addBlock(page.id, newBlockType, nextPosition);
    });
  }

  function handleDeleteBlock(blockId: number) {
    startTransition(async () => {
      await deleteBlock(blockId);
    });
  }

  function handleMoveBlock(index: number, direction: "up" | "down") {
    const ids = blocks.map((b) => b.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;

    [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];

    startTransition(async () => {
      await reorderBlocks(page.id, ids);
    });
  }

  function handleSaveBlock(blockId: number, data: Record<string, unknown>) {
    startTransition(async () => {
      await updateBlock(blockId, locale, data);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/pages"
          className="text-xs text-muted hover:text-accent transition-colors font-mono"
        >
          &larr; Pages
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-medium">{page.title}</h1>
        <p className="mt-1 text-sm text-muted font-mono">/{page.slug}</p>
      </div>

      {/* Locale toggle */}
      <div className="flex gap-0 mb-6">
        <button
          onClick={() => setLocale("en")}
          className={`px-4 py-1.5 text-sm font-mono border border-border rounded-sm transition-colors ${
            locale === "en"
              ? "bg-accent text-accent-foreground border-accent"
              : "text-muted hover:text-accent"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLocale("pl")}
          className={`px-4 py-1.5 text-sm font-mono border border-border rounded-sm -ml-px transition-colors ${
            locale === "pl"
              ? "bg-accent text-accent-foreground border-accent"
              : "text-muted hover:text-accent"
          }`}
        >
          PL
        </button>
      </div>

      {/* Blocks list */}
      <div className="border border-border divide-y divide-border">
        {blocks.length === 0 && (
          <p className="p-6 text-sm text-muted">
            No blocks yet. Add one below.
          </p>
        )}
        {blocks.map((block, index) => (
          <div key={block.id}>
            {/* Block header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveBlock(index, "up")}
                    disabled={index === 0 || isPending}
                    className="text-xs text-muted hover:text-accent disabled:opacity-30 transition-colors font-mono"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveBlock(index, "down")}
                    disabled={index === blocks.length - 1 || isPending}
                    className="text-xs text-muted hover:text-accent disabled:opacity-30 transition-colors font-mono"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {BLOCK_LABELS[block.type]}
                  </span>
                  <span className="ml-2 text-xs text-muted font-mono">
                    #{block.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setExpandedBlock(
                      expandedBlock === block.id ? null : block.id,
                    )
                  }
                  className="text-xs text-muted hover:text-accent transition-colors font-mono"
                >
                  {expandedBlock === block.id ? "Collapse" : "Edit"}
                </button>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  disabled={isPending}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Block edit form */}
            {expandedBlock === block.id && (
              <div className="border-t border-border bg-surface p-4">
                <BlockForm
                  block={block}
                  locale={locale}
                  projects={projects}
                  isPending={isPending}
                  onSave={(data) => handleSaveBlock(block.id, data)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add block */}
      <div className="mt-4 flex items-center gap-3">
        <select
          value={newBlockType}
          onChange={(e) => setNewBlockType(e.target.value as BlockType)}
          className="border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent"
        >
          <option value="hero">Hero</option>
          <option value="project_showcase">Project Showcase</option>
          <option value="blog_feed">Blog Feed</option>
          <option value="cta">CTA</option>
          <option value="text">Text</option>
        </select>
        <button
          onClick={handleAddBlock}
          disabled={isPending}
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm disabled:opacity-50"
        >
          Add Block
        </button>
      </div>

      {isPending && (
        <p className="mt-4 text-xs text-muted font-mono">Saving...</p>
      )}
    </div>
  );
}

/* ─── Block-specific edit forms ─────────────────────────────────────── */

function BlockForm({
  block,
  locale,
  projects,
  isPending,
  onSave,
}: {
  block: Block;
  locale: "en" | "pl";
  projects: Project[];
  isPending: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const data = locale === "en" ? block.dataEn : block.dataPl;

  switch (block.type) {
    case "hero":
      return (
        <HeroForm data={data} isPending={isPending} onSave={onSave} />
      );
    case "project_showcase":
      return (
        <ProjectShowcaseForm
          data={data}
          projects={projects}
          isPending={isPending}
          onSave={onSave}
        />
      );
    case "blog_feed":
      return (
        <BlogFeedForm data={data} isPending={isPending} onSave={onSave} />
      );
    case "cta":
      return (
        <CtaForm data={data} isPending={isPending} onSave={onSave} />
      );
    case "text":
      return (
        <TextForm data={data} isPending={isPending} onSave={onSave} />
      );
    default:
      return <p className="text-sm text-muted">Unknown block type.</p>;
  }
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted font-mono">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent"
      />
    </div>
  );
}

function SaveButton({
  isPending,
  onClick,
}: {
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm disabled:opacity-50"
    >
      Save
    </button>
  );
}

function HeroForm({
  data,
  isPending,
  onSave,
}: {
  data: Record<string, unknown>;
  isPending: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [fields, setFields] = useState({
    title: (data.title as string) || "",
    subtitle: (data.subtitle as string) || "",
    description: (data.description as string) || "",
    buttonText: (data.buttonText as string) || "",
    buttonUrl: (data.buttonUrl as string) || "",
  });

  function handleChange(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="space-y-3">
      <FormField label="Title" name="title" value={fields.title} onChange={handleChange} />
      <FormField label="Subtitle" name="subtitle" value={fields.subtitle} onChange={handleChange} />
      <FormField label="Description" name="description" value={fields.description} onChange={handleChange} />
      <FormField label="Button Text" name="buttonText" value={fields.buttonText} onChange={handleChange} />
      <FormField label="Button URL" name="buttonUrl" value={fields.buttonUrl} onChange={handleChange} />
      <SaveButton isPending={isPending} onClick={() => onSave(fields)} />
    </div>
  );
}

function ProjectShowcaseForm({
  data,
  projects,
  isPending,
  onSave,
}: {
  data: Record<string, unknown>;
  projects: Project[];
  isPending: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [projectId, setProjectId] = useState<string>(
    data.projectId != null ? String(data.projectId) : "",
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-muted font-mono">
          Project
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.title} ({p.locale.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
      <SaveButton
        isPending={isPending}
        onClick={() =>
          onSave({ projectId: projectId ? parseInt(projectId, 10) : null })
        }
      />
    </div>
  );
}

function BlogFeedForm({
  data,
  isPending,
  onSave,
}: {
  data: Record<string, unknown>;
  isPending: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [count, setCount] = useState<string>(
    data.count != null ? String(data.count) : "3",
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-muted font-mono">
          Number of posts
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-full border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent"
        />
      </div>
      <SaveButton
        isPending={isPending}
        onClick={() => onSave({ count: parseInt(count, 10) || 3 })}
      />
    </div>
  );
}

function CtaForm({
  data,
  isPending,
  onSave,
}: {
  data: Record<string, unknown>;
  isPending: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [fields, setFields] = useState({
    heading: (data.heading as string) || "",
    text: (data.text as string) || "",
    buttonText: (data.buttonText as string) || "",
    email: (data.email as string) || "",
  });

  function handleChange(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="space-y-3">
      <FormField label="Heading" name="heading" value={fields.heading} onChange={handleChange} />
      <FormField label="Text" name="text" value={fields.text} onChange={handleChange} />
      <FormField label="Button Text" name="buttonText" value={fields.buttonText} onChange={handleChange} />
      <FormField label="Email" name="email" value={fields.email} onChange={handleChange} type="email" />
      <SaveButton isPending={isPending} onClick={() => onSave(fields)} />
    </div>
  );
}

function TextForm({
  data,
  isPending,
  onSave,
}: {
  data: Record<string, unknown>;
  isPending: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [html, setHtml] = useState<string>((data.html as string) || "");

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-muted font-mono">
          HTML Content
        </label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          className="w-full border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent resize-y"
        />
      </div>
      <SaveButton isPending={isPending} onClick={() => onSave({ html })} />
    </div>
  );
}
