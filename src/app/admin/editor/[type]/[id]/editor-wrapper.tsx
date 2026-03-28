"use client";

import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { saveContent, saveMetadata } from "./actions";
import { useState, useRef } from "react";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Metadata {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  coverImage: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  isPublished: boolean;
  category: string;
  locale: string;
  selectedTagIds: number[];
}

interface EditorWrapperProps {
  type: string;
  id: number;
  content: string;
  metadata: Metadata;
  allTags: Tag[];
}

export function EditorWrapper({ type, id, content, metadata: initial, allTags }: EditorWrapperProps) {
  const [meta, setMeta] = useState(initial);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleMetaSave = async () => {
    setMetaSaving(true);
    await saveMetadata(type, id, meta);
    setMetaSaving(false);
    setMetaSaved(true);
    setTimeout(() => setMetaSaved(false), 2000);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setMeta({ ...meta, coverImage: data.url });
      }
    } catch {
      alert("Upload failed");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const toggleTag = (tagId: number) => {
    const ids = meta.selectedTagIds.includes(tagId)
      ? meta.selectedTagIds.filter((id) => id !== tagId)
      : [...meta.selectedTagIds, tagId];
    setMeta({ ...meta, selectedTagIds: ids });
  };

  const isPost = type === "post";

  return (
    <div className="space-y-6">
      {/* Metadata panel */}
      <div className="border border-border rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted">
            Settings
          </h2>
          <div className="flex items-center gap-3">
            {metaSaved && <span className="text-xs text-green-500">Saved</span>}
            <button
              onClick={handleMetaSave}
              disabled={metaSaving}
              className="text-sm border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors rounded-sm disabled:opacity-50"
            >
              {metaSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Title + Slug */}
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

        {/* Locale + Category (posts) / Locale (projects) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">Language</label>
            <select
              value={meta.locale}
              onChange={(e) => setMeta({ ...meta, locale: e.target.value })}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
            >
              <option value="en">English</option>
              <option value="pl">Polski</option>
            </select>
          </div>
          {isPost && (
            <div>
              <label className="block text-xs text-muted mb-1">Category</label>
              <select
                value={meta.category}
                onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="TECH">Tech</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>
          )}
          {isPost && (
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
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

        {/* Excerpt (posts) */}
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

        {/* Description + URLs (projects) */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Cover Image */}
        <div>
          <label className="block text-xs text-muted mb-1">Cover Image</label>
          <div className="flex items-center gap-4">
            {meta.coverImage ? (
              <div className="relative w-32 h-20 border border-border rounded-sm overflow-hidden bg-background">
                <img src={meta.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMeta({ ...meta, coverImage: "" })}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-background/80 text-xs text-muted hover:text-red-500 rounded-sm"
                >
                  x
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="border border-dashed border-border px-4 py-3 text-xs text-muted hover:border-accent hover:text-accent transition-colors rounded-sm disabled:opacity-50"
              >
                {coverUploading ? "Uploading..." : "Upload cover image"}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs text-muted mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const selected = meta.selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-colors ${
                    selected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
            {allTags.length === 0 && (
              <span className="text-xs text-muted">No tags. Create some in Tags section.</span>
            )}
          </div>
        </div>
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
