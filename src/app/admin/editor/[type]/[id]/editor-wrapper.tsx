"use client";

import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { saveContent, saveMetadata } from "./actions";
import { useState } from "react";

interface Metadata {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  isPublished: boolean;
}

interface EditorWrapperProps {
  type: string;
  id: number;
  content: string;
  metadata: Metadata;
}

export function EditorWrapper({ type, id, content, metadata: initial }: EditorWrapperProps) {
  const [meta, setMeta] = useState(initial);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);

  const handleMetaSave = async () => {
    setMetaSaving(true);
    await saveMetadata(type, id, meta);
    setMetaSaving(false);
    setMetaSaved(true);
    setTimeout(() => setMetaSaved(false), 2000);
  };

  const isPost = type === "post";

  return (
    <div className="space-y-8">
      {/* Metadata panel */}
      <div className="border border-border rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted">
            Settings
          </h2>
          <div className="flex items-center gap-3">
            {metaSaved && (
              <span className="text-xs text-green-500">Saved</span>
            )}
            <button
              onClick={handleMetaSave}
              disabled={metaSaving}
              className="text-sm border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors rounded-sm disabled:opacity-50"
            >
              {metaSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">Title</label>
            <input
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Slug</label>
            <input
              value={meta.slug}
              onChange={(e) => setMeta({ ...meta, slug: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
            />
          </div>
        </div>

        {isPost && (
          <div>
            <label className="block text-xs text-muted mb-1">Excerpt</label>
            <textarea
              value={meta.excerpt}
              onChange={(e) => setMeta({ ...meta, excerpt: e.target.value })}
              rows={2}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm resize-none"
            />
          </div>
        )}

        {!isPost && (
          <>
            <div>
              <label className="block text-xs text-muted mb-1">Description</label>
              <textarea
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                rows={2}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Image URL</label>
                <input
                  value={meta.imageUrl}
                  onChange={(e) => setMeta({ ...meta, imageUrl: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Live URL</label>
                <input
                  value={meta.liveUrl}
                  onChange={(e) => setMeta({ ...meta, liveUrl: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">GitHub URL</label>
                <input
                  value={meta.githubUrl}
                  onChange={(e) => setMeta({ ...meta, githubUrl: e.target.value })}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
                />
              </div>
            </div>
          </>
        )}

        {isPost && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={meta.isPublished}
              onChange={(e) => setMeta({ ...meta, isPublished: e.target.checked })}
              className="accent-accent"
            />
            <span className="text-sm">Published</span>
          </label>
        )}
      </div>

      {/* Content editor */}
      <div>
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted mb-3">
          Content
        </h2>
        <TiptapEditor
          content={content}
          onSave={async (html) => {
            await saveContent(type, id, html);
          }}
        />
      </div>
    </div>
  );
}
