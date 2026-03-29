"use client";

import { useState } from "react";
import { CommentForm } from "@/app/(public)/blog/[slug]/comment-form";

interface CommentFormTranslations {
  submitted: string;
  yourName: string;
  yourComment: string;
  submit: string;
  submitting: string;
}

export interface CommentData {
  id: number;
  postId: number;
  parentId: number | null;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface CommentNodeData extends CommentData {
  replies: CommentNodeData[];
}

interface CommentThreadProps {
  comments: CommentData[];
  postId: number;
  dateLocale: string;
  translations: CommentFormTranslations;
  replyLabel?: string;
}

const MAX_DEPTH = 2;

function buildCommentTree(comments: CommentData[]): CommentNodeData[] {
  const map = new Map<number, CommentNodeData>();
  const roots: CommentNodeData[] = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function flattenBeyondDepth(
  nodes: CommentNodeData[],
  currentDepth: number,
): CommentNodeData[] {
  const result: CommentNodeData[] = [];

  for (const node of nodes) {
    if (currentDepth >= MAX_DEPTH) {
      result.push({ ...node, replies: [] });
      if (node.replies.length > 0) {
        result.push(...flattenBeyondDepth(node.replies, currentDepth + 1));
      }
    } else {
      result.push({
        ...node,
        replies: flattenBeyondDepth(node.replies, currentDepth + 1),
      });
    }
  }

  return result;
}

export function CommentThread({
  comments,
  postId,
  dateLocale,
  translations,
  replyLabel = "Reply",
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const tree = buildCommentTree(comments);
  const normalizedTree = flattenBeyondDepth(tree, 0);

  return (
    <div className="space-y-0">
      {normalizedTree.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          postId={postId}
          depth={0}
          dateLocale={dateLocale}
          translations={translations}
          replyLabel={replyLabel}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      ))}
    </div>
  );
}

interface CommentNodeProps {
  comment: CommentNodeData;
  postId: number;
  depth: number;
  dateLocale: string;
  translations: CommentFormTranslations;
  replyLabel: string;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
}

function CommentNode({
  comment,
  postId,
  depth,
  dateLocale,
  translations,
  replyLabel,
  replyingTo,
  setReplyingTo,
}: CommentNodeProps) {
  const isReplying = replyingTo === comment.id;
  const canReply = depth < MAX_DEPTH;

  return (
    <div className="border-b border-[var(--border)] py-4 last:border-b-0">
      <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
        <span className="font-medium text-[var(--foreground)]">
          {comment.authorName}
        </span>
        <span className="w-px h-3 bg-[var(--border)]" />
        <time dateTime={comment.createdAt.toISOString()}>
          {comment.createdAt.toLocaleDateString(dateLocale, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </div>
      <p className={`mt-2 leading-relaxed ${depth > 0 ? "text-xs text-[var(--muted)]" : "text-sm text-[var(--foreground)]"}`}>
        {comment.content}
      </p>
      {canReply && (
        <button
          onClick={() => setReplyingTo(isReplying ? null : comment.id)}
          className="mt-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-mono"
        >
          {replyLabel}
        </button>
      )}

      {isReplying && (
        <div className="mt-4">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            replyingTo={comment.authorName}
            onCancel={() => setReplyingTo(null)}
            onSuccess={() => setReplyingTo(null)}
            translations={translations}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="ml-6 mt-4 border-l-2 border-[var(--border)] pl-4 space-y-0">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              dateLocale={dateLocale}
              translations={translations}
              replyLabel={replyLabel}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
