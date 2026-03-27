import { requireAdmin } from "@/lib/auth/session";
import { createProject } from "../actions";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-medium">New Project</h1>

      <form action={createProject} className="mt-8 space-y-4">
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
          <label htmlFor="description" className="block text-sm text-muted">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm resize-none"
          />
        </div>
        <div>
          <label htmlFor="liveUrl" className="block text-sm text-muted">
            Live URL
          </label>
          <input
            id="liveUrl"
            name="liveUrl"
            type="url"
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        <div>
          <label htmlFor="githubUrl" className="block text-sm text-muted">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
