import { db } from "./index";
import { projects, tags, projectTags } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Tags
  const tagData = [
    { name: "TypeScript", slug: "typescript" },
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Python", slug: "python" },
    { name: "Django", slug: "django" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Docker", slug: "docker" },
    { name: "Privacy", slug: "privacy" },
    { name: "SSG", slug: "ssg" },
    { name: "i18n", slug: "i18n" },
    { name: "B2B", slug: "b2b" },
  ];

  const insertedTags = await db.insert(tags).values(tagData).onConflictDoNothing().returning();
  console.log(`Inserted ${insertedTags.length} tags`);

  // FormattedAI
  const [formattedai] = await db
    .insert(projects)
    .values({
      title: "FormattedAI.pl",
      slug: "formattedai",
      description: "Privacy-first developer tools. 100% client-side processing, zero cookies, zero tracking.",
      content: `<h2>The Problem</h2>
<p>Every formatting and conversion tool on the market sends your data to external servers. For developers working under NDA, this is a direct violation of their agreements. On top of that, most tools track users with cookies, analytics, and advertising pixels.</p>

<h2>The Solution</h2>
<p>FormattedAI is a suite of developer tools that runs entirely in the browser. Nothing ever leaves your machine:</p>
<ul>
<li><strong>Markdown Formatter</strong> — clean, consistent markdown output with live preview</li>
<li><strong>AVIF Converter</strong> — client-side image compression using WebAssembly</li>
<li><strong>CSS Minifier</strong> — strip comments, whitespace, and optimize selectors</li>
<li><strong>JS/JSON Formatter</strong> — beautify or minify JavaScript and JSON</li>
<li><strong>SEO Meta Generator</strong> — generate structured metadata for any page</li>
</ul>

<h2>Technical Decisions</h2>
<p>The entire application is built with vanilla JavaScript and compiled SCSS. No frameworks, no build-time dependencies beyond Sass and esbuild. This keeps the bundle tiny and eliminates supply chain risk.</p>
<p>Internationalization (Polish/English) is rendered at build time using SSG — no runtime i18n library, no FOUC, no layout shifts. Each language gets its own pre-rendered HTML.</p>
<p>Image conversion uses <code>@aspect/avif</code> compiled to WebAssembly, running entirely in a Web Worker to avoid blocking the main thread.</p>

<h2>Results</h2>
<ul>
<li>100/100 Lighthouse score across all pages</li>
<li>Zero external requests (no analytics, no CDN, no API calls)</li>
<li>Under 50KB total JavaScript per tool page</li>
<li>Used by developers in companies with strict data handling policies</li>
</ul>`,
      liveUrl: "https://formattedai.pl",
      githubUrl: "https://github.com/AdamSzczotka/formattedai",
    })
    .returning();

  // TutorHub
  const [tutorhub] = await db
    .insert(projects)
    .values({
      title: "TutorHub",
      slug: "tutorhub",
      description: "B2B tutoring school management system. Django monolith replacing Excel-based workflows.",
      content: `<h2>The Problem</h2>
<p>A tutoring school with 200+ active students was managing everything in Excel: student records, teacher schedules, lesson tracking, payment status, and parent communication. The owner spent 10+ hours per week on administrative tasks that should have been automated.</p>
<p>Common issues included double-booked teachers, missed payments going unnoticed for weeks, and no way to generate reports for tax season without manual data aggregation.</p>

<h2>The Solution</h2>
<p>A custom-built Django monolith with a relational PostgreSQL database designed around the school's actual workflows:</p>
<ul>
<li><strong>Student Management</strong> — profiles, contact info, lesson history, payment records</li>
<li><strong>Teacher Scheduling</strong> — availability matrix, conflict detection, automatic slot assignment</li>
<li><strong>Lesson Tracking</strong> — attendance, notes, homework assignments per student</li>
<li><strong>Invoicing</strong> — automatic monthly invoice generation based on completed lessons</li>
<li><strong>Reporting</strong> — revenue breakdowns, teacher utilization, student retention metrics</li>
</ul>

<h2>Technical Decisions</h2>
<p>Django was chosen over a SPA framework because the client needed server-rendered pages that work on older devices (some parents access the system from 5-year-old Android phones). Django's admin interface also provided an immediate internal tool for the school owner.</p>
<p>The database schema uses composite keys for schedule slots and enforces constraints at the database level (not just application level) to prevent double-booking even under concurrent access.</p>
<p>Deployment is fully Dockerized — a single <code>docker-compose up</code> brings up the app, database, and Nginx reverse proxy on any VPS.</p>

<h2>Results</h2>
<ul>
<li>Admin time reduced from 10h to under 1h per week</li>
<li>Zero double-booking incidents since deployment</li>
<li>Automated invoicing saves 3 days of manual work per month</li>
<li>System handles 200+ concurrent users without performance issues</li>
</ul>`,
      githubUrl: null,
      liveUrl: null,
    })
    .returning();

  // Link tags to projects
  const allTags = await db.select().from(tags);
  const tagMap = Object.fromEntries(allTags.map((t) => [t.slug, t.id]));

  const formattedaiTags = ["typescript", "privacy", "ssg", "i18n"];
  const tutorhubTags = ["python", "django", "postgresql", "docker", "b2b"];

  for (const slug of formattedaiTags) {
    if (tagMap[slug]) {
      await db.insert(projectTags).values({ projectId: formattedai.id, tagId: tagMap[slug] }).onConflictDoNothing();
    }
  }

  for (const slug of tutorhubTags) {
    if (tagMap[slug]) {
      await db.insert(projectTags).values({ projectId: tutorhub.id, tagId: tagMap[slug] }).onConflictDoNothing();
    }
  }

  console.log("Seeded: FormattedAI + TutorHub projects with tags");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
