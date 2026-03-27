"use client";

import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { saveContent } from "./actions";

interface EditorWrapperProps {
  type: string;
  id: number;
  content: string;
}

export function EditorWrapper({ type, id, content }: EditorWrapperProps) {
  return (
    <TiptapEditor
      content={content}
      onSave={async (html) => {
        await saveContent(type, id, html);
      }}
    />
  );
}
