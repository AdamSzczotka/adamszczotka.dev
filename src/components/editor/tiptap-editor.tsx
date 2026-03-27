"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

interface TiptapEditorProps {
  content: string;
  onSave: (html: string) => Promise<void>;
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const buttons = [
    { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { label: "H3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    { label: "List", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { label: "1.", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { label: "Code", action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
    { label: "Quote", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { label: "---", action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-border p-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.action}
          className={`px-2 py-1 text-xs font-mono rounded-sm transition-colors ${
            btn.active
              ? "bg-accent text-accent-foreground"
              : "hover:bg-foreground/5"
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

export function TiptapEditor({ content, onSave }: TiptapEditorProps) {
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none p-4 min-h-[400px] focus:outline-none",
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    await onSave(editor.getHTML());
    setSaving(false);
  };

  return (
    <div className="border border-border rounded-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex justify-end border-t border-border p-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-accent-foreground px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
