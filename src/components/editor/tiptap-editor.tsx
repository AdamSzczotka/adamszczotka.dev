"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const lowlight = createLowlight(common);

const AUTOSAVE_DELAY_MS = 2000;

// Blockquote that keeps its class attribute, so callouts survive the
// HTML -> editor -> HTML round trip (styling comes from CSS, which the
// sanitizer allows — inline style attributes get stripped).
const CalloutBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) =>
          attributes.class ? { class: attributes.class } : {},
      },
    };
  },
});

export interface TiptapEditorHandle {
  /** Flushes any pending autosave and stores the current content. */
  save: () => Promise<boolean>;
}

interface TiptapEditorProps {
  content: string;
  onSave: (html: string) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  ref?: React.Ref<TiptapEditorHandle>;
}

function formatSavedAt(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
    const labels = { info: "Info", warning: "Warning", tip: "Tip" };
    editor
      .chain()
      .focus()
      .insertContent(
        `<blockquote class="callout callout-${type}"><p><strong>${labels[type]}:</strong> </p></blockquote>`,
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

export function TiptapEditor({
  content,
  onSave,
  onDirtyChange,
  ref,
}: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  // useEditor does not re-render on transactions, so the counter needs state.
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HTML as it currently sits in the editor vs. as it was last persisted.
  const currentHtmlRef = useRef<string | null>(null);
  const savedHtmlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const performSave = useCallback(async (html: string): Promise<boolean> => {
    // Serialise concurrent saves so the last write always wins.
    while (inFlightRef.current) await inFlightRef.current;
    if (html === savedHtmlRef.current) return true;

    setStatus("saving");
    const run = (async () => {
      try {
        await onSaveRef.current(html);
        savedHtmlRef.current = html;
        setSavedAt(new Date());
        setStatus("saved");
        setDirty(currentHtmlRef.current !== html);
        return true;
      } catch {
        setStatus("error");
        return false;
      }
    })();
    inFlightRef.current = run;

    const ok = await run;
    if (inFlightRef.current === run) inFlightRef.current = null;
    return ok;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const scheduleAutosave = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const html = currentHtmlRef.current;
      if (html !== null && html !== savedHtmlRef.current) void performSave(html);
    }, AUTOSAVE_DELAY_MS);
  }, [clearTimer, performSave]);

  const flush = useCallback(async (): Promise<boolean> => {
    clearTimer();
    const html = currentHtmlRef.current;
    if (html === null) return true;
    return performSave(html);
  }, [clearTimer, performSave]);

  useImperativeHandle(ref, () => ({ save: flush }), [flush]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // Don't lose a draft when the tab is hidden — save right away instead of
  // waiting out the debounce.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      const html = currentHtmlRef.current;
      if (html === null || html === savedHtmlRef.current) return;
      clearTimer();
      void performSave(html);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [clearTimer, performSave]);

  useEffect(() => clearTimer, [clearTimer]);

  const editor = useEditor({
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      const html = editor.getHTML();
      currentHtmlRef.current = html;
      savedHtmlRef.current = html;
      setCharCount(editor.getText().length);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      currentHtmlRef.current = html;
      setCharCount(editor.getText().length);
      const isDirty = html !== savedHtmlRef.current;
      setDirty(isDirty);
      if (!isDirty) {
        clearTimer();
        return;
      }
      scheduleAutosave();
    },
    extensions: [
      StarterKit.configure({ codeBlock: false, blockquote: false }),
      CalloutBlockquote,
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

  let statusLabel = "";
  let statusClass = "text-muted";
  if (status === "saving") {
    statusLabel = "Saving...";
  } else if (status === "error") {
    statusLabel = "Autosave failed - changes kept in editor";
    statusClass = "text-red-500";
  } else if (dirty) {
    statusLabel = "Unsaved changes";
    statusClass = "text-foreground";
  } else if (savedAt) {
    statusLabel = `Saved ${formatSavedAt(savedAt)}`;
  }

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
          {editor ? `${charCount} chars` : ""}
        </span>
        <span className={`text-xs px-2 ${statusClass}`} aria-live="polite">
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
