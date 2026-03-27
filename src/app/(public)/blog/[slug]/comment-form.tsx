"use client";

import { useState } from "react";
import { addComment } from "./actions";

interface CommentFormProps {
  postId: number;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setStatus("submitting");
    const result = await addComment(postId, formData);

    if (result.error) {
      setError(result.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-muted border border-border p-4 rounded-sm">
        Comment submitted. It will appear after moderation.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input
        name="authorName"
        type="text"
        required
        maxLength={100}
        placeholder="Your name"
        className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
      />
      <textarea
        name="content"
        required
        maxLength={2000}
        rows={4}
        placeholder="Your comment"
        className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm resize-none"
      />
      {status === "error" && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors rounded-sm disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting..." : "Submit Comment"}
      </button>
    </form>
  );
}
