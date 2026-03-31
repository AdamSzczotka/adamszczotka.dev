"use client";

import { useState } from "react";
import { addComment } from "@/lib/actions/comments";

interface CommentFormTranslations {
  submitted: string;
  yourName: string;
  yourComment: string;
  submit: string;
  submitting: string;
}

interface CommentFormProps {
  postId: number;
  parentId?: number | null;
  replyingTo?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  translations?: CommentFormTranslations;
}

export function CommentForm({
  postId,
  parentId,
  replyingTo,
  onCancel,
  onSuccess,
  translations,
}: CommentFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setStatus("submitting");
    const result = await addComment(postId, formData, parentId);

    if (result.error) {
      setError(result.error);
      setStatus("error");
    } else {
      setStatus("success");
      onSuccess?.();
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-[var(--muted)] border border-[var(--border)] p-4 rounded-sm">
        {translations?.submitted || "Comment submitted. It will appear after moderation."}
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {replyingTo && (
        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
          <span>
            Replying to{" "}
            <span className="font-medium text-[var(--foreground)]">{replyingTo}</span>
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
      <input
        name="authorName"
        type="text"
        required
        maxLength={100}
        placeholder={translations?.yourName || "Your name"}
        className="w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] rounded-sm"
      />
      <textarea
        name="content"
        required
        maxLength={2000}
        rows={replyingTo ? 3 : 4}
        placeholder={translations?.yourComment || "Your comment"}
        className="w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] rounded-sm resize-none"
      />
      {status === "error" && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--foreground)]/5 transition-colors rounded-sm disabled:opacity-50"
        >
          {status === "submitting"
            ? (translations?.submitting || "Submitting...")
            : (translations?.submit || "Submit Comment")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
