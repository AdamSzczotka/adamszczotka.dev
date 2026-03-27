# MASTER PLAN: adamszczotka.dev

**Launch date:** Tuesday, April 14, 2026 (post-Easter)
**Goal:** Establish authority as a Software Engineer, showcase commercial Case Studies, and passively generate B2B leads / job offers.

---

## 1. Core Principles

- **Open Source:** Public repo on GitHub. `.env` strictly in `.gitignore` -- only `.env.example` committed.
- **UI/UX Rigor:** Zero emojis. Zero pastel "AI-generated" gradients. Raw, technical design inspired by Linear / Vercel. Monochrome + 1 muted accent color.
- **Dark/Light Mode:** Native support via `next-themes` and Tailwind `dark:` classes.
- **Performance:** 100/100 Core Web Vitals. Static generation (SSG) wherever possible.
- **Security:** Full server-side sanitization of form inputs (comments) before database writes.
- **Privacy & GDPR:** No Google Analytics, no FB Pixel, no cookie banner. Only essential `localStorage` for theme/language (disclosed in Privacy Policy).
- **Feature Freeze:** Build only what is on this list before launch.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (`@theme` in `globals.css`) + `next-themes` + `@tailwindcss/typography` |
| Database | PostgreSQL (Docker, internal network) + Drizzle ORM |
| Auth | Better Auth (GitHub OAuth, native Drizzle adapter, type-safe, built-in MFA) |
| Content Editor | TipTap (Headless WYSIWYG, outputs clean HTML) |
| Image Processing | Sharp (server-side AVIF/WebP compression) |
| Fonts | Geist Sans (body) + JetBrains Mono (code/tags) |
| Animation | Motion (Framer Motion v12+) |
| Infrastructure | VPS (Linux, 80GB), Nginx reverse proxy, Docker, Let's Encrypt SSL |

---

## 3. Design System

**Vibe:** "Pragmatic Engineer" -- brutal minimalism, sharp edges, generous whitespace, visible borders.

**Colors:**
- Dark Mode (for devs): `bg-neutral-950` / `text-neutral-200` / `border-neutral-800`
- Light Mode (for HR / general): `bg-neutral-50` / `text-neutral-900` / `border-neutral-200`
- Accent: One muted color (cool blue or violet from FormattedAI) -- CTA buttons and hovers only

**Typography:** Geist Sans for body text, JetBrains Mono for code snippets and tech tags.

**Rules:**
- Sharp edges: `rounded-none` or `rounded-sm`
- Tech logos: `filter grayscale opacity-50`, full color on hover
- Large whitespace: `py-24` / `gap-8` minimum between sections
- Professional, natural profile photo (black-and-white or raw)

---

## 4. Database Schema (Drizzle)

6 tables:

| Table | Columns |
|---|---|
| `projects` | id, title, slug, description, content (HTML), image_url, live_url, github_url, created_at |
| `posts` | id, title, slug, excerpt, content (HTML), is_published (boolean), created_at |
| `tags` | id, name, slug |
| `project_tags` | project_id (FK), tag_id (FK) |
| `post_tags` | post_id (FK), tag_id (FK) |
| `comments` | id, post_id (FK), author_name, content (sanitized text), status (PENDING / APPROVED / REJECTED), created_at |

---

## 5. Site Architecture & Routing

### A. Public Pages

**`/` -- Landing Page**
- Hero Section: H1 "Adam Szczotka. Software Engineer & Product Architect."
- Subtitle: Coding since age 11. Scalable backends, fast mobile apps, privacy-first web tools. Delivering business value, not just code.
- Professional photo on the right
- Buttons: [View my projects] (scroll) / [GitHub] (link)
- Social proof: Greyed-out tech logos (TypeScript, React Native, Python, Django, Docker, GCP, Nginx)

**Projects Section (Z-Pattern / Asymmetric):**
- Project 1: **FormattedAI.pl** -- Challenge: Dev tools breaking NDA and tracking users. Solution: 100% client-side, SSG-rendered i18n, zero cookies.
- Project 2: **TutorHub** -- Challenge: Managing a tutoring school in Excel. Solution: Django monolith, PostgreSQL, Docker deployment.

**Tech Feed:** 3 latest blog posts (title, date, tags).

**CTA & Footer:**
- H2: "Got an interesting problem to solve?"
- Subtext: Professional outreach invitation (passive candidate positioning)
- mailto: link button
- Footer: (c) 2026 Adam Szczotka | GitHub | LinkedIn | FormattedAI | TutorHub | Privacy Policy

**`/projects/[slug]`** -- Deep Case Study (problem, solution, stack, live/code links)

**`/blog`** -- Chronological article list + tag filtering

**`/blog/[slug]`** -- Article content + comment form (name + content, status: PENDING) + approved comments list

**`/about`** -- Personal story (mountains, -70kg weight loss, sports career, discipline). Separated from the commercial front.

### B. Admin Panel (Protected)

Guarded by Better Auth middleware (no session -> redirect to `/admin/login`).

| Route | Function |
|---|---|
| `/admin/login` | Raw screen with "Login with GitHub" button |
| `/admin/dashboard` | Stats: post count, pending comments count |
| `/admin/posts` | Posts table (CRUD), Published/Draft toggle |
| `/admin/projects` | Projects table (CRUD) |
| `/admin/editor/[type]/[id]` | TipTap editor with title, excerpt, tag selection, drag&drop image upload |
| `/admin/tags` | Tag management (add/delete) |
| `/admin/comments` | Moderation center: pending comments with Approve/Reject actions |

---

## 6. Security & API

- **XSS Protection:** All comment content passes through `sanitize-html` with strict rules (strip all `<script>`, `<iframe>`, etc.) before INSERT via Drizzle.
- **Server-only DB access:** All database communication via Next.js Route Handlers / Server Actions.
- **Upload Security:** `/api/upload` validates MIME types (images only) and file size (max 5MB) before passing to Sharp. Sharp processes before saving to disk.
- **CSP Headers:** Content-Security-Policy in `next.config`.
- **Auth Middleware:** Better Auth verifies sessions on all `/admin/*` routes.

---

## 7. Infrastructure & Deployment

- **Server:** Own VPS (Linux, 80GB)
- **Database:** PostgreSQL Docker image on internal Docker network (`my_internal_net`). Port 5432 not exposed to host -- Next.js communicates internally.
- **Reverse Proxy:** Nginx -- serves static upload files directly (`/uploads/`), proxies app traffic (port 3000) to ports 80/443 for `adamszczotka.dev`.
- **SSL:** Let's Encrypt (Certbot). Required by `.dev` TLD.
- **Backups:** Cron-triggered Bash script (nightly): `pg_dump` -> `.gz` -> Google Drive via Rclone.

---

## 8. Roadmap

| Phase | Scope |
|---|---|
| 1. Setup & Database | Next.js, Tailwind, Drizzle config, schema creation, local migrations |
| 2. Core Backend | Better Auth (GitHub OAuth), admin panel, TipTap editor, image upload (Sharp) |
| 3. Moderation & Logic | Tags system, comment system with sanitization, approval API |
| 4. Frontend | Raw UI for public pages (SSG), dark mode integration, article rendering |
| 5. DevOps | VPS deployment, Docker setup (DB + app), Nginx config, backup script |

**Schedule:** April 2026 -- coding evenings & weekends. Launch: Tuesday, April 14, 2026 (LinkedIn posts: FormattedAI + new site).
