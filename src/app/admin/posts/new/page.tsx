import { requireAdmin } from "@/lib/auth/session";
import { createPost } from "../actions";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-medium">New Post</h1>

      <form action={createPost} className="mt-8 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm text-muted">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm text-muted">
            Slug (auto-generated if empty)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm text-muted">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm resize-none"
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          Create Post
        </button>
      </form>
    </div>
  );
}
