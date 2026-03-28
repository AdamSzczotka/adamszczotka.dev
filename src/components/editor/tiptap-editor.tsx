"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback, useRef, useState } from "react";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onSave: (html: string) => Promise<void>;
}

function MenuBar({
  editor,
  onImageUpload,
}: {
  editor: ReturnType<typeof useEditor> | null;
  onImageUpload: () => void;
}) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL:");
    if (!url) return;
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  const insertCallout = (type: "info" | "warning" | "tip") => {
    const colors = { info: "#3b82f6", warning: "#f59e0b", tip: "#22c55e" };
    const labels = { info: "Info", warning: "Warning", tip: "Tip" };
    editor
      .chain()
      .focus()
      .insertContent(
        `<blockquote style="border-left: 3px solid ${colors[type]}; padding: 12px 16px; background: ${colors[type]}11;"><strong>${labels[type]}:</strong> </blockquote>`,
      )
      .run();
  };

  const groups = [
    {
      label: "Text",
      buttons: [
        { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
        { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
        { label: "S", action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), title: "Strikethrough" },
        { label: "`", action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code"), title: "Inline code" },
      ],
    },
    {
      label: "Heading",
      buttons: [
        { label: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), title: "Heading 1" },
        { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "Heading 2" },
        { label: "H3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), title: "Heading 3" },
      ],
    },
    {
      label: "Block",
      buttons: [
        { label: "UL", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet list" },
        { label: "OL", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Ordered list" },
        { label: "</>", action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), title: "Code block" },
        { label: "\"", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), title: "Quote" },
        { label: "---", action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: "Divider" },
      ],
    },
    {
      label: "Insert",
      buttons: [
        { label: "Link", action: setLink, active: editor.isActive("link"), title: "Add link" },
        { label: "Img", action: onImageUpload, active: false, title: "Upload image" },
      ],
    },
    {
      label: "Callout",
      buttons: [
        { label: "Info", action: () => insertCallout("info"), active: false, title: "Info callout" },
        { label: "Warn", action: () => insertCallout("warning"), active: false, title: "Warning callout" },
        { label: "Tip", action: () => insertCallout("tip"), active: false, title: "Tip callout" },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-px border-b border-border p-1.5 bg-surface/50">
      {groups.map((group, gi) => (
        <div key={group.label} className="flex items-center">
          {gi > 0 && <div className="w-px h-5 bg-border mx-1.5" />}
          {group.buttons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className={`px-2 py-1 text-xs font-mono rounded-sm transition-colors ${
                btn.active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TiptapEditor({ content, onSave }: TiptapEditorProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder: "Start writing your content..." }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none p-6 min-h-[500px] focus:outline-none",
      },
    },
  });

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          editor
            .chain()
            .focus()
            .setImage({ src: data.url, alt: file.name })
            .run();
        } else {
          alert(data.error || "Upload failed");
        }
      } catch {
        alert("Upload failed");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [editor],
  );

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    await onSave(editor.getHTML());
    setSaving(false);
  };

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <MenuBar editor={editor} onImageUpload={handleImageUpload} />

      {uploading && (
        <div className="px-4 py-1.5 text-xs text-accent bg-accent/5 border-b border-border">
          Uploading image...
        </div>
      )}

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between border-t border-border p-2">
        <span className="text-xs text-muted px-2">
          {editor
            ? `${editor.getText().length} chars`
            : ""}
        </span>
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
