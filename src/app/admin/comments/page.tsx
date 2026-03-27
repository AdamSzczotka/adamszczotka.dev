import { db } from "@/lib/db";
import { comments, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { approveComment, rejectComment } from "./actions";

export default async function AdminCommentsPage() {
  await requireAdmin();

  const pendingComments = await db
    .select({
      id: comments.id,
      authorName: comments.authorName,
      content: comments.content,
      createdAt: comments.createdAt,
      postTitle: posts.title,
    })
    .from(comments)
    .leftJoin(posts, eq(comments.postId, posts.id))
    .where(eq(comments.status, "PENDING"))
    .orderBy(desc(comments.createdAt));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">Comment Moderation</h1>
      <p className="mt-1 text-sm text-muted">
        {pendingComments.length} pending
      </p>

      <div className="mt-8 space-y-4">
        {pendingComments.length === 0 && (
          <p className="text-sm text-muted border border-border p-6">
            No pending comments.
          </p>
        )}
        {pendingComments.map((comment) => (
          <div key={comment.id} className="border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{comment.authorName}</p>
                <p className="text-xs text-muted">
                  on {comment.postTitle} &middot;{" "}
                  {comment.createdAt.toLocaleDateString("en-US")}
                </p>
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await approveComment(comment.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs border border-green-500/30 text-green-500 px-2 py-1 rounded-sm hover:bg-green-500/10 transition-colors"
                  >
                    Approve
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await rejectComment(comment.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs border border-red-500/30 text-red-500 px-2 py-1 rounded-sm hover:bg-red-500/10 transition-colors"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
